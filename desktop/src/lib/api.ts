import { invoke } from '@tauri-apps/api/core';
import type { BlogInfo, CommandResult, FileEntry, HomeConfig, PublishResult, SiteContent } from '../types';

export const api = {
  validateBlog: (root: string) => invoke<BlogInfo>('validate_blog', { root }),
  scanPosts: (root: string) => invoke<FileEntry[]>('scan_posts', { root }),
  savePost: (root: string, relativePath: string, content: string) =>
    invoke<void>('save_post', { root, relativePath, content }),
  loadSiteContent: (root: string) => invoke<SiteContent>('load_site_content', { root }),
  saveSiteContent: (root: string, content: SiteContent) => invoke<void>('save_site_content', { root, content }),
  loadHomeConfig: (root: string) => invoke<HomeConfig>('load_home_config', { root }),
  saveHomeConfig: (root: string, content: HomeConfig) => invoke<void>('save_home_config', { root, content }),
  importImage: (root: string, sourcePath: string, slug: string) =>
    invoke<string>('import_article_image', { root, sourcePath, slug }),
  importAvatar: (root: string, sourcePath: string) => invoke<void>('import_avatar', { root, sourcePath }),
  startPreview: (root: string) => invoke<string>('start_preview', { root }),
  stopPreview: () => invoke<void>('stop_preview'),
  runProjectCheck: (root: string, check: 'unit' | 'build' | 'e2e') =>
    invoke<CommandResult>('run_project_check', { root, check }),
  publishChanges: (root: string, message: string) =>
    invoke<PublishResult>('publish_changes', { root, message }),
};
