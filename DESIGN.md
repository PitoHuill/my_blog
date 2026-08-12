---
name: Personal Blog Publishing System
description: "以沉静研究档案为品牌，以出版工作台为操作界面的双模式设计系统。"
colors:
  brand-accent: "#327562"
  brand-accent-hover: "#2b6656"
  brand-accent-dark: "#7eaf9d"
  warm-paper: "#f7f5f0"
  paper-white: "#ffffff"
  warm-border: "#dedbd3"
  ink: "#282721"
  stone-muted: "#6d6a63"
  soft-paper: "#efede7"
  night-charcoal: "#171b22"
  night-surface: "#20252e"
  night-border: "#343c49"
  night-text: "#f2efe7"
  night-muted: "#aaa7a2"
  night-soft: "#29313c"
  workbench-canvas: "#f7f7f8"
  workbench-accent-soft: "#edf4f1"
  workbench-border: "#e4e4e7"
  workbench-ink: "#18181b"
  workbench-control-text: "#52525b"
  workbench-muted: "#71717a"
  workbench-soft-surface: "#fafafa"
  workbench-sidebar: "#242b2f"
  success: "#16a34a"
  warning: "#d97706"
  danger: "#dc2626"
typography:
  display:
    fontFamily: "Georgia, 'Noto Serif SC', serif"
    fontSize: "2.35rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Georgia, 'Noto Serif SC', serif"
    fontSize: "1.55rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  title:
    fontFamily: "Georgia, 'Noto Serif SC', serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.95
    letterSpacing: "normal"
  control:
    fontFamily: "Inter, 'Segoe UI', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "normal"
rounded:
  tag: "3px"
  badge: "4px"
  field: "6px"
  compact: "7px"
  control: "8px"
  panel: "12px"
  dialog: "13px"
  focus-card: "16px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-accent}"
    textColor: "{colors.paper-white}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.brand-accent-hover}"
    textColor: "{colors.paper-white}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.workbench-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.workbench-control-text}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  input-search:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "14px 16px"
  input-workbench:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.workbench-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "38px"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.stone-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "7px 10px"
  card-editorial:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px 30px"
  callout-success:
    backgroundColor: "#f0fdf4"
    textColor: "#15803d"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  callout-warning:
    backgroundColor: "#fffbeb"
    textColor: "#a16207"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  callout-error:
    backgroundColor: "#fef2f2"
    textColor: "#b91c1c"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  preview-dialog:
    backgroundColor: "{colors.workbench-border}"
    textColor: "{colors.workbench-ink}"
    rounded: "{rounded.dialog}"
    padding: "0"
  theme-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    width: "72px"
    height: "44px"
---

# Design System: Personal Blog Publishing System

## Overview

**Creative North Star: "沉静研究档案"**

整个产品像一份持续生长的私人研究档案：公开站负责让观点被从容阅读，桌面端负责让内容被高效整理与发布。两者共享同一套纸张、墨色、鼠尾草绿与编辑式排版，但密度不同——公开站舒展、留白充足，桌面端紧凑、信息优先。

视觉气质应当克制、编辑化、可信赖。界面依靠排版、间距、边界和少量色彩建立层级，不依靠装饰性渐变、大面积高饱和色或成片阴影。公开站是“沉静研究档案”，桌面端是“出版工作台”；它们是同一品牌的阅读模式与操作模式。

**Key Characteristics:**

- 暖纸色背景、深墨色正文与稀少的鼠尾草绿强调色。
- 衬线标题建立编辑感，无衬线正文保证长时间阅读与操作效率。
- 平面分层优先，细边框与色调差承担主要结构表达。
- 公开站强调阅读节奏，桌面端强调扫描、状态与任务推进。
- 动效短、轻、可中断，并完整尊重减少动态效果设置。

## Colors

色板以暖纸色中性色为底，鼠尾草绿承担唯一品牌强调；深色模式不是反相，而是以炭黑表面与柔和浅墨重建同样的对比关系。

### Primary

- **档案鼠尾草绿** (`brand-accent` / `brand-accent-hover` / `brand-accent-dark`): 链接、当前项、主要按钮、焦点与少量进度提示。浅色、悬停与深色模式分别使用对应 Token，禁止手写近似色。

### Secondary

- **语义成功色** (`success`): 仅表示操作完成、检查通过或安全状态。
- **语义警示色** (`warning`): 仅表示需要关注但仍可继续的状态。
- **语义危险色** (`danger`): 仅表示失败、破坏性操作或不可继续的状态。

### Neutral

- **暖纸底色** (`warm-paper`): 公开站页面底色与阅读环境。
- **纸白表面** (`paper-white`): 卡片、表单与工作台主要面板。
- **暖灰边界** (`warm-border`): 分隔线、静态边框和输入边界。
- **正文墨色** (`ink`): 浅色模式的标题与正文。
- **石灰辅助文字** (`stone-muted`): 元信息、说明文字与未激活导航。
- **柔纸填充** (`soft-paper`): 标签、轻提示与悬停底色。
- **夜间炭黑组** (`night-charcoal`、`night-surface`、`night-border`、`night-text`、`night-muted`、`night-soft`): 深色模式的背景、表面、边界、正文与辅助层级。
- **工作台画布** (`workbench-canvas`): 桌面端主工作区的低对比背景，不用于公开站正文区域。
- **工作台结构色** (`workbench-accent-soft`、`workbench-border`、`workbench-ink`、`workbench-control-text`、`workbench-muted`、`workbench-soft-surface`、`workbench-sidebar`): 桌面端选中底色、边界、正文、控件文字、辅助文字、次级面板与全高导航表面；它们比公开站中性色更冷、更紧凑，不应反向覆盖阅读界面。

### Named Rules

**The Quiet Accent Rule.** 鼠尾草绿在单屏视觉面积中不超过约 10%，只用于动作、链接、当前状态与焦点；它的稀少本身就是品牌辨识度。

**The Semantic Color Rule.** 成功、警示、危险色只表达对应状态，不承担品牌装饰，也不与鼠尾草绿竞争主操作层级。

**The One Brand Rule.** 桌面端主操作已经统一使用品牌鼠尾草绿；任何新的蓝紫主色或第二套品牌强调色都视为视觉漂移，不得引入。

## Typography

**Display Font:** Georgia (with Noto Serif SC and system serif fallbacks)
**Body Font:** system-ui (with Segoe UI and Microsoft YaHei fallbacks)
**Control Font:** Inter (with Segoe UI、Microsoft YaHei and system-ui fallbacks；项目未内置 Inter 时自然回退)
**Label/Mono Font:** 标签沿用系统无衬线；代码与日志使用 Cascadia Code、SFMono-Regular、Consolas

**Character:** 衬线字承担观点、文章和章节的编辑气质；无衬线字承担导航、元信息、表单和操作。代码字体只出现在 Markdown、路径、命令与运行日志中，不用于普通说明。

### Hierarchy

- **Display** (`typography.display`): 页面主标题和少量入口标题；常用紧缩字距为 -0.02em，文章长标题可到 -0.025em，每个视口最多一个主视觉标题。
- **Headline** (`typography.headline`): 文章二级标题、重要内容区标题与发布页主任务标题。
- **Title** (`typography.title`): 卡片标题、分区标题和面板标题。
- **Body** (`typography.body`): 长文正文与公开站说明；正文行宽控制在 65–72ch，工作台说明可缩短行高但不得低于 1.55。
- **Control** (`typography.control`): 桌面端按钮与主操作；默认 16px / 650，不把长段正文的 1.95 行高带入控件。
- **Label** (`typography.label`): 元信息、字段名、分组名和极短状态标签；默认正常字距，只有工作台结构分组允许约 0.08em 的大写字距，禁止用于句子或长段落。
- **Mono** (`typography.mono`): 编辑器、代码、路径和日志；表单与普通导航不得使用。

### Named Rules

**The Editorial Pairing Rule.** 衬线字体只负责内容与层级，无衬线字体负责操作与元数据；同一组件内不因装饰需要增加第三套字体。

**The 72ch Rule.** 长文正文的有效行宽必须保持在 65–72ch；若空间更宽，增加外部留白，而不是拉长文本行。

## Layout

公开站使用最大宽度 1120px 的居中壳层，桌面两侧保留 20px 安全留白；767px 及以下改为 14px。主页在宽屏使用 260px 侧栏与自适应主栏，行/列间距为 24px / 48px；768–1023px 收敛为 220px 侧栏与 32px 列间距，767px 以下改为单栏。文章页外壳为 1020px，其中正文 720px、目录 220px、间隔 64px，并在 1023px 以下改为目录置顶的单栏。文章列表与搜索为 820px，关于与项目详情为 740px，专题详情为 820px，项目与专题索引为 900px。列表默认采用连续行与分隔线，只有真正独立、可进入或需要成组强调的内容才使用卡片。

桌面工作台使用 92px 全高导航栏、58px 顶栏与可滚动工作区。文章工作区标准三栏为 264px / minmax(420px, 1fr) / 312px，首页工作区为 232px / minmax(500px, 1fr) / 300px；不宽于 1250px 时分别收缩到 250px / minmax(360px, 1fr) / 300px 与 220px / minmax(430px, 1fr) / 300px。不宽于 1180px 时导航收为 76px、顶栏收为 54px，文章与首页的辅助栏分别进一步收为 228/278px 与 204/278px。桌面窗口产品下限为 1100×720；低于该范围不继续压缩信息，而应由窗口最小尺寸阻止失真。

间距以 `spacing` 标尺为骨架：4–12px 用于图标、标签与紧凑控件，16–28px 用于卡片和面板内边距，32–64px 用于版块与页面节奏。22px、30px、54–56px 等值只作为列表行、精选卡和工具栏的光学校正，不晋升为全局 Token。公开站的结构断点为 767px 与 1023px，并在 380px 处理极窄导航；桌面端以 1250px、1180px 和 760px 高度处理压缩态。预览设备宽度固定为 390px（手机）与 820px（平板），用于真实预览，不反向定义产品断点。

**The Editorial Rhythm Rule.** 一个视口只允许一个主表面占据视觉主导；辅助信息通过留白、分隔线和窄栏组织，避免等权卡片铺满页面。

**The Read/Operate Rule.** 公开站优先可读性与留白，桌面端优先扫描效率与任务推进；共享的是 Token 与组件语言，不是相同的信息密度。

## Elevation & Depth

系统以平面分层为默认。公开站的连续列表和正文不使用投影，通过背景色差、1px 边界和留白表达层级；首页精选卡是明确例外，以单一柔和阴影建立入口层级。桌面端主要按钮、站点画布、浮动反馈与独立任务面板可使用低强度投影；模态与整屏预览可以使用更强遮罩和高层投影。

### Shadow Vocabulary

- **主要操作承载** (`0 6px 16px rgba(52, 121, 102, 0.18)`): 桌面端主要按钮常态的轻微品牌投影；次要与幽灵按钮保持平面。
- **精选卡常态** (`0 16px 36px rgba(36, 45, 42, 0.08)`): 首页唯一精选入口；悬停提升为 `0 20px 42px rgba(36, 45, 42, 0.12)` 并上移 2px。
- **跳转链接浮层** (`0 8px 24px color-mix(in srgb, var(--color-text) 14%, transparent)`): 仅用于键盘聚焦时出现的跳转正文链接。
- **画布承载** (`0 10px 30px rgba(39, 39, 42, 0.08)`): 桌面端站点画布和可视化预览容器。
- **功能面板** (`0 5px 18px rgba(39, 39, 42, 0.035)`): 发布检查等独立工作面板，可省略时优先省略。
- **连接引导** (`0 24px 60px rgba(39, 45, 42, 0.10)`): 只用于首次连接仓库时的单一任务焦点卡。
- **模态高层** (`0 28px 80px rgba(0, 0, 0, 0.35)`): 只用于模态、全屏预览或需要阻断背景任务的表面。

### Named Rules

**The Flat-by-Default Rule.** 连续内容、普通卡片和次要控件在常态下保持平面；投影只表达精选入口、主要操作、单一任务焦点、画布承载、临时浮层或模态层级，绝不作为通用装饰。

## Shapes

形状语言是克制的轻圆角，而不是胶囊化。标签使用 3px，筛选与行内提示使用 4px，公开输入与跳转链接使用 6px，桌面紧凑控件使用 7px，主要按钮与 Callout 使用 8px，公开卡片和大型工作面板使用 12px，预览对话框使用 13px，连接引导卡使用 16px。999px 胶囊仅用于开关、圆形状态和真正的药丸标签。

所有结构边界默认 1px。边框颜色使用当前主题的边界 Token；选中状态优先使用 1–3px 左侧标记、底部标记或下划线，而不是同时加粗边框、变色、投影和缩放。头像、状态点与主题切换旋钮可以使用圆形，普通容器不得无理由使用大圆角。

## Components

组件整体应“精炼而克制”：默认状态安静，交互状态清晰，视觉反馈不戏剧化。所有可交互组件必须具备悬停、键盘焦点、按下、禁用与必要的加载状态；公开站使用品牌强调色 3px 外轮廓与 3px 偏移，密集工作台使用 2px 外轮廓与 2px 偏移。两者都必须在强制颜色模式中保留可见边界。

### Buttons

- **Shape:** 标准按钮使用轻圆角表面（`rounded.control`），桌面工作台默认高 38px；重要单步操作可增至 46px，公开站触控目标不得小于 44px。
- **Primary:** 使用 `button-primary`；一组动作中最多一个主按钮。文本使用清晰的动词，不使用全大写。
- **Hover / Focus:** 主按钮常态带轻微品牌投影，悬停切换到 `brand-accent-hover` 并上移 1px，持续 180ms；按下恢复原位。键盘焦点使用对应表面的焦点环，不以颜色变化替代焦点。
- **Secondary / Ghost:** 次按钮保留 1px 边框；幽灵按钮只用于工具栏和低优先级操作。禁用状态降低不透明度并取消位移，但文字仍需可辨认。

### Chips

- **Style:** 内容标签使用柔纸填充和 3px 小圆角；可交互筛选常态为透明背景、4px 圆角与 1px 边界。正文元标签保持正常大小写，只有结构分组才使用大写与字距。
- **State:** 筛选选中态使用柔纸底色、强调色边界与正文墨色，并通过 `aria-current` 或 `aria-pressed` 暴露语义；不可只依赖颜色。

### Cards / Containers

- **Corner Style:** 公开内容卡、编辑面板和大型设置面板以 `rounded.panel`（12px）为主；桌面工具控件内部可使用 7–8px。
- **Background:** 公开站卡片使用纸白表面，桌面端面板使用纸白表面叠放在工作台画布上。
- **Shadow Strategy:** 默认无投影，遵守 Flat-by-Default Rule；首页精选卡、主要操作、单一任务焦点、画布、模态或关键浮层使用约定投影。
- **Border:** 统一 1px 主题边界。活跃内容行用左侧强调条与柔和底色表达，不改成高饱和整块填充。
- **Internal Padding:** 紧凑行使用 12–16px，普通卡片使用 20–24px，首页精选卡使用 28×30px，连接引导卡使用 28–44px。

### Inputs / Fields

- **Style:** 纸白背景与 1px 边界。公开搜索输入使用 6px 圆角和 14×16px 内边距，形成至少 44px 的命中高度；桌面搜索与表单使用 7–8px 圆角，紧凑搜索框高 38px。
- **Focus:** 公开搜索与桌面元数据字段在边界变为品牌强调色时添加 3px 低透明度环；紧凑工作台输入保留全局 2px / 2px `:focus-visible` 轮廓。不得移除键盘轮廓后只留下细边框。
- **Error / Disabled:** 错误使用危险色边界、说明文本和图标共同表达；禁用使用低对比背景与明确不可用光标，不得仅将文字变得几乎不可读。

### Navigation

公开站顶栏高 64px，使用半透明背景、轻模糊与底部分隔线；品牌字标使用衬线体，导航使用无衬线体。当前页必须同时具备语义标记与视觉强调。767px 以下导航换行至第二行，保持 44px 可点击高度，不隐藏核心入口。

桌面端使用 92px 图标导航栏。默认项为柔和浅色文字，悬停使用低透明度底色，当前项使用品牌强调色填充；图标与文字必须同时存在，不能只靠图标猜测。版本信息固定在底部，任务导航固定在顶部。

### Feedback and Status

Callout 使用浅色背景、1px 同色系边界、图标与短文案。成功、警示、危险状态与 `success`、`warning`、`danger` 一一对应；蓝色只作为组件私有的信息提示色，不得升级为第二品牌色。长日志放入深色等宽字体容器；进度阶段使用“未开始 / 运行中 / 成功 / 失败”四态，不用模糊的中间颜色代替状态文案。

加载失败必须在原任务位置显示可恢复动作；保存与发布错误使用 `role="alert"`，成功与进度使用礼貌型 Live Region。错误文案说明问题和下一步，不直接暴露原始异常；折叠设置面板时，反馈以右上浮层继续可见。

### Preview Dialog

预览对话框使用 13px 圆角、白色 56px 工具栏、冷灰舞台和高层遮罩。设备切换按钮为 40×40px，并通过 `aria-pressed` 表达当前设备；加载、失败与重试均留在舞台中心。对话框必须圈定键盘焦点、支持 Esc 关闭，并在关闭后把焦点还给触发控件。

### Theme Toggle

主题切换是品牌签名组件。外部命中区为 72×44px，轨道为 64×30px；移动端命中区为 60×44px，轨道为 52×28px。太阳、月亮、云与星星是克制的插画细节，状态通过 `aria-pressed` 暴露。主过渡为 320ms，按下缩放只到 0.97；用户偏好减少动态效果时近乎即时完成。

### Workbench Switch

工作台布尔开关为 34×19px，旋钮 13px，使用胶囊轨道。开启态使用品牌强调色，关闭态使用中性灰；必须同时有可见标签、状态文字或可访问名称，不能把开关孤立成无上下文图形。

**The Honest Preview Rule.** 工作台预览必须使用真实内容和真实 Token；若只能展示结构占位，必须明确标记为示意，不能让用户误以为已保存或已发布。

## Do's and Don'ts

### Do:

- **Do** 让公开站与桌面端共享品牌、语义状态、字体角色、圆角与焦点原则，并分别使用暖纸与 Zinc 中性层。
- **Do** 优先用排版、留白、分隔线和信息密度建立层级。
- **Do** 在长文中维持 65–72ch 行宽和舒展行高，在工作台中用更紧凑但可读的密度。
- **Do** 为所有交互状态提供键盘可见焦点，并让公开站及触控场景的命中目标达到至少 44px。
- **Do** 使用连续内容行呈现同类列表，只把真正独立的对象放进卡片。
- **Do** 在 767px 与 1023px 断点验证公开站，在 1100×720 下限、1180px 边缘态和 1250px 压缩态验证桌面端。

### Don't:

- **Don't** 把信息蓝、语义状态色或任意新色扩展成第二套品牌强调色。
- **Don't** 把每一段内容都包成相同权重的圆角卡片，形成“卡片地毯”。
- **Don't** 使用大面积渐变、玻璃拟态、发光边缘或无功能的装饰投影。
- **Don't** 同时使用高饱和填充、粗边框、投影、缩放来表达同一个选中状态。
- **Don't** 用颜色作为成功、失败、选中或发布状态的唯一信息载体。
- **Don't** 为了填满宽屏而拉长正文，或为了塞入窄窗而压缩桌面工作台到不可操作。
