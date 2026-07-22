use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    net::{SocketAddr, TcpStream},
    path::{Component, Path, PathBuf},
    process::{Child, Command, Output, Stdio},
    sync::Mutex,
    thread,
    time::Duration,
};
use tauri::Manager;

struct PreviewState(Mutex<Option<Child>>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FileEntry {
    relative_path: String,
    content: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BlogInfo {
    root: String,
    name: String,
    branch: String,
    release_branch: bool,
    dirty_files: Vec<String>,
}

#[derive(Serialize)]
struct CommandResult {
    ok: bool,
    stdout: String,
    stderr: String,
}

#[derive(Serialize)]
struct PublishResult {
    branch: String,
    commit: String,
    pushed: bool,
}

fn canonical_blog(root: &str) -> Result<PathBuf, String> {
    let path = fs::canonicalize(root).map_err(|error| format!("无法访问博客目录：{error}"))?;
    let required = [
        "package.json",
        "src/content.config.ts",
        "src/content/posts",
        "src/data/site-content.json",
        "src/data/home-config.json",
    ];
    for item in required {
        if !path.join(item).exists() {
            return Err(format!("所选目录不是可管理的博客，缺少 {item}"));
        }
    }
    Ok(path)
}

fn normalized_relative(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn safe_relative_path(
    root: &Path,
    relative_path: &str,
    allowed_root: &str,
) -> Result<PathBuf, String> {
    let relative = Path::new(relative_path);
    if relative.is_absolute()
        || relative.components().any(|part| {
            matches!(
                part,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        })
    {
        return Err("文件路径不安全".into());
    }
    let destination = root.join(relative);
    let allowed = root.join(allowed_root);
    if !destination.starts_with(&allowed) {
        return Err("文件不在允许的博客目录中".into());
    }
    Ok(destination)
}

fn read_json(root: &Path, relative_path: &str) -> Result<Value, String> {
    let path = safe_relative_path(root, relative_path, "src/data")?;
    let raw = fs::read_to_string(path).map_err(|error| format!("读取配置失败：{error}"))?;
    serde_json::from_str(&raw).map_err(|error| format!("配置 JSON 无效：{error}"))
}

fn write_json(root: &Path, relative_path: &str, value: &Value) -> Result<(), String> {
    if !value.is_object() {
        return Err("配置必须是 JSON 对象".into());
    }
    let path = safe_relative_path(root, relative_path, "src/data")?;
    let mut raw = serde_json::to_string_pretty(value).map_err(|error| error.to_string())?;
    raw.push('\n');
    fs::write(path, raw).map_err(|error| format!("保存配置失败：{error}"))
}

fn command_output(root: &Path, program: &str, args: &[&str]) -> Result<Output, String> {
    Command::new(program)
        .args(args)
        .current_dir(root)
        .output()
        .map_err(|error| format!("无法执行 {program}：{error}"))
}

fn checked_command(root: &Path, program: &str, args: &[&str]) -> Result<Output, String> {
    let output = command_output(root, program, args)?;
    if output.status.success() {
        Ok(output)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
}

fn git_branch(root: &Path) -> Result<String, String> {
    let output = checked_command(root, "git", &["branch", "--show-current"])?;
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn git_dirty_files(root: &Path) -> Result<Vec<String>, String> {
    let output = checked_command(root, "git", &["status", "--porcelain"])?;
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(|line| line.get(3..))
        .map(|line| line.trim().replace('\\', "/"))
        .collect())
}

#[tauri::command]
fn validate_blog(root: String) -> Result<BlogInfo, String> {
    let path = canonical_blog(&root)?;
    let package: Value = serde_json::from_str(
        &fs::read_to_string(path.join("package.json")).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    let branch = git_branch(&path).unwrap_or_else(|_| "unknown".into());
    let dirty_files = git_dirty_files(&path).unwrap_or_default();
    Ok(BlogInfo {
        root: path.to_string_lossy().to_string(),
        name: package
            .get("name")
            .and_then(Value::as_str)
            .unwrap_or("Astro Blog")
            .to_string(),
        release_branch: branch == "main" || branch == "master",
        branch,
        dirty_files,
    })
}

#[tauri::command]
fn scan_posts(root: String) -> Result<Vec<FileEntry>, String> {
    let root = canonical_blog(&root)?;
    let posts_root = root.join("src/content/posts");
    let mut entries = Vec::new();
    for locale in ["en", "zh"] {
        let locale_dir = posts_root.join(locale);
        if !locale_dir.exists() {
            continue;
        }
        for item in fs::read_dir(&locale_dir).map_err(|error| error.to_string())? {
            let path = item.map_err(|error| error.to_string())?.path();
            let extension = path
                .extension()
                .and_then(|value| value.to_str())
                .unwrap_or("");
            if path.is_file() && matches!(extension.to_ascii_lowercase().as_str(), "md" | "mdx") {
                let relative = path
                    .strip_prefix(&root)
                    .map_err(|error| error.to_string())?;
                entries.push(FileEntry {
                    relative_path: normalized_relative(relative),
                    content: fs::read_to_string(&path).map_err(|error| error.to_string())?,
                });
            }
        }
    }
    entries.sort_by(|left, right| left.relative_path.cmp(&right.relative_path));
    Ok(entries)
}

#[tauri::command]
fn save_post(root: String, relative_path: String, content: String) -> Result<(), String> {
    let root = canonical_blog(&root)?;
    let path = safe_relative_path(&root, &relative_path, "src/content/posts")?;
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("");
    if !matches!(extension.to_ascii_lowercase().as_str(), "md" | "mdx") {
        return Err("文章只能保存为 .md 或 .mdx".into());
    }
    if !content.starts_with("---\n") && !content.starts_with("---\r\n") {
        return Err("文章缺少 Frontmatter".into());
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(path, content).map_err(|error| format!("保存文章失败：{error}"))
}

#[tauri::command]
fn load_site_content(root: String) -> Result<Value, String> {
    let root = canonical_blog(&root)?;
    read_json(&root, "src/data/site-content.json")
}

#[tauri::command]
fn save_site_content(root: String, content: Value) -> Result<(), String> {
    let root = canonical_blog(&root)?;
    if content.get("profile").is_none() || content.get("projects").is_none() {
        return Err("站点配置缺少 profile 或 projects".into());
    }
    write_json(&root, "src/data/site-content.json", &content)
}

#[tauri::command]
fn load_home_config(root: String) -> Result<Value, String> {
    let root = canonical_blog(&root)?;
    read_json(&root, "src/data/home-config.json")
}

#[tauri::command]
fn save_home_config(root: String, content: Value) -> Result<(), String> {
    let root = canonical_blog(&root)?;
    if content.get("sidebar").is_none() || content.get("mainSections").is_none() {
        return Err("首页配置缺少 sidebar 或 mainSections".into());
    }
    write_json(&root, "src/data/home-config.json", &content)
}

fn safe_filename(value: &str) -> String {
    value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == '-' || character == '_' {
                character.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string()
}

#[tauri::command]
fn import_article_image(root: String, source_path: String, slug: String) -> Result<String, String> {
    let root = canonical_blog(&root)?;
    let source = fs::canonicalize(source_path).map_err(|error| format!("读取图片失败：{error}"))?;
    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    if !matches!(
        extension.as_str(),
        "jpg" | "jpeg" | "png" | "webp" | "gif" | "avif"
    ) {
        return Err("仅支持 JPG、PNG、WebP、GIF 或 AVIF 图片".into());
    }
    let stem = source
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("image");
    let base_name = format!("{}-{}", safe_filename(&slug), safe_filename(stem));
    let image_dir = root.join("src/content/posts/images");
    fs::create_dir_all(&image_dir).map_err(|error| error.to_string())?;
    let mut destination = image_dir.join(format!("{base_name}.{extension}"));
    let mut counter = 2;
    while destination.exists() {
        destination = image_dir.join(format!("{base_name}-{counter}.{extension}"));
        counter += 1;
    }
    fs::copy(source, &destination).map_err(|error| format!("复制图片失败：{error}"))?;
    let filename = destination
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("image");
    Ok(format!("../images/{filename}"))
}

#[tauri::command]
fn import_avatar(root: String, source_path: String) -> Result<(), String> {
    let root = canonical_blog(&root)?;
    let source = fs::canonicalize(source_path).map_err(|error| format!("读取头像失败：{error}"))?;
    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    if !matches!(extension.as_str(), "jpg" | "jpeg") {
        return Err("当前头像管线仅接受 JPG/JPEG 文件".into());
    }
    fs::copy(source, root.join("src/assets/avatar.jpg"))
        .map(|_| ())
        .map_err(|error| format!("替换头像失败：{error}"))
}

fn npm_program() -> &'static str {
    if cfg!(windows) {
        "npm.cmd"
    } else {
        "npm"
    }
}

#[tauri::command]
fn start_preview(root: String, state: tauri::State<'_, PreviewState>) -> Result<String, String> {
    let root = canonical_blog(&root)?;
    let mut guard = state
        .0
        .lock()
        .map_err(|_| "预览进程状态不可用".to_string())?;
    if let Some(child) = guard.as_mut() {
        let _ = child.kill();
        let _ = child.wait();
    }

    let mut command = Command::new(npm_program());
    command
        .args(["run", "dev", "--", "--host", "127.0.0.1", "--port", "4321"])
        .current_dir(&root)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let mut child = command
        .spawn()
        .map_err(|error| format!("启动 Astro 预览失败：{error}"))?;
    let address: SocketAddr = "127.0.0.1:4321"
        .parse()
        .map_err(|error| format!("{error}"))?;
    let mut ready = false;
    for _ in 0..40 {
        if let Some(status) = child.try_wait().map_err(|error| error.to_string())? {
            return Err(format!("Astro 预览提前退出：{status}"));
        }
        if TcpStream::connect_timeout(&address, Duration::from_millis(150)).is_ok() {
            ready = true;
            break;
        }
        thread::sleep(Duration::from_millis(250));
    }
    if !ready {
        let _ = child.kill();
        return Err("Astro 预览在 10 秒内未就绪".into());
    }
    *guard = Some(child);
    Ok("http://127.0.0.1:4321/".into())
}

#[tauri::command]
fn stop_preview(state: tauri::State<'_, PreviewState>) -> Result<(), String> {
    let mut guard = state
        .0
        .lock()
        .map_err(|_| "预览进程状态不可用".to_string())?;
    if let Some(mut child) = guard.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
    Ok(())
}

#[tauri::command]
fn run_project_check(root: String, check: String) -> Result<CommandResult, String> {
    let root = canonical_blog(&root)?;
    let script = match check.as_str() {
        "unit" => "test:unit",
        "build" => "build",
        "e2e" => "test:e2e",
        _ => return Err("未知检查类型".into()),
    };
    let output = command_output(&root, npm_program(), &["run", script])?;
    Ok(CommandResult {
        ok: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    })
}

#[tauri::command]
fn publish_changes(root: String, message: String) -> Result<PublishResult, String> {
    let root = canonical_blog(&root)?;
    let message = message.trim();
    if message.is_empty() || message.len() > 120 || message.contains(['\n', '\r']) {
        return Err("提交说明不能为空、不能换行，且最多 120 个字符".into());
    }
    let branch = git_branch(&root)?;
    if branch != "main" && branch != "master" {
        return Err(format!(
            "当前分支是 {branch}。只有 main/master 可以直接发布到线上。"
        ));
    }
    let dirty_files = git_dirty_files(&root)?;
    if dirty_files.is_empty() {
        return Err("没有需要发布的修改".into());
    }
    let allowed = [
        "src/content/posts/",
        "src/data/site-content.json",
        "src/data/home-config.json",
        "src/assets/avatar.jpg",
    ];
    let unexpected: Vec<String> = dirty_files
        .iter()
        .filter(|path| !allowed.iter().any(|prefix| path.starts_with(prefix)))
        .cloned()
        .collect();
    if !unexpected.is_empty() {
        return Err(format!(
            "检测到桌面管理器范围之外的修改，请先处理：{}",
            unexpected.join("、")
        ));
    }

    checked_command(
        &root,
        "git",
        &[
            "add",
            "--",
            "src/content/posts",
            "src/data/site-content.json",
            "src/data/home-config.json",
            "src/assets/avatar.jpg",
        ],
    )?;
    checked_command(&root, "git", &["commit", "-m", message])?;
    checked_command(&root, "git", &["push", "origin", &branch])?;
    let output = checked_command(&root, "git", &["rev-parse", "--short", "HEAD"])?;
    Ok(PublishResult {
        branch,
        commit: String::from_utf8_lossy(&output.stdout).trim().to_string(),
        pushed: true,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(PreviewState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            validate_blog,
            scan_posts,
            save_post,
            load_site_content,
            save_site_content,
            load_home_config,
            save_home_config,
            import_article_image,
            import_avatar,
            start_preview,
            stop_preview,
            run_project_check,
            publish_changes,
        ])
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::Destroyed) {
                if let Ok(mut guard) = window.state::<PreviewState>().0.lock() {
                    if let Some(mut child) = guard.take() {
                        let _ = child.kill();
                        let _ = child.wait();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Blog Publisher");
}
