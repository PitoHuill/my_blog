import type { Locale } from './config';

type UIStrings = {
  navigation: { home: string; posts: string; projects: string; about: string; search: string };
  home: { featuredPosts: string; latestPosts: string; allPosts: string; allProjects: string; now: string; posts: string; projects: string; works: string; featured: string; links: string; aboutMe: string; rss: string; email: string };
  posts: { title: string; description: string; published: string; updated: string; readingTime: string; minute: string; tags: string; series: string; previous: string; next: string; backToPosts: string; translation: string };
  projects: { title: string; description: string; allProjects: string; status: string; backToProjects: string };
  about: { title: string; greeting: string; now: string; site: string; contact: string };
  search: { eyebrow: string; title: string; description: string; inputLabel: string; placeholder: string; initialMessage: string; results: string; noResults: string };
  footer: { builtWith: string; rss: string; search: string };
  languageToggle: { label: string; switchToEnglish: string; switchToChinese: string };
};

export const ui: Record<Locale, UIStrings> = {
  en: {
    navigation: { home: 'Home', posts: 'Posts', projects: 'Projects', about: 'About', search: 'Search' },
    home: { featuredPosts: 'Featured posts', latestPosts: 'Latest posts', allPosts: 'All posts', allProjects: 'All projects', now: 'Now', posts: 'Posts', projects: 'Projects', works: 'Works', featured: 'Featured', links: 'Selected links', aboutMe: 'About me', rss: 'RSS feed', email: 'Email' },
    posts: { title: 'Posts', description: 'Writing on ideas, tools, and long-term work.', published: 'Published', updated: 'Updated', readingTime: 'Reading time', minute: 'min', tags: 'Tags', series: 'Series', previous: 'Previous post', next: 'Next post', backToPosts: 'Back to posts', translation: 'Read in another language' },
    projects: { title: 'Projects', description: 'Works in progress, with room to change.', allProjects: 'All projects', status: 'Status', backToProjects: 'Back to projects' },
    about: { title: 'About', greeting: 'Hello, I am', now: 'Now', site: 'This site', contact: 'Contact' },
    search: { eyebrow: 'SEARCH', title: 'Search posts', description: 'Search posts', inputLabel: 'Enter a keyword', placeholder: 'Title, description, or tag', initialMessage: 'Enter a keyword to start searching', results: 'posts found', noResults: 'No posts found' },
    footer: { builtWith: 'Built with Astro', rss: 'RSS', search: 'Search' },
    languageToggle: { label: 'Language', switchToEnglish: 'Switch to English', switchToChinese: '切换到中文' },
  },
  zh: {
    navigation: { home: '首页', posts: '文章', projects: '项目', about: '关于', search: '搜索' },
    home: { featuredPosts: '精选文章', latestPosts: '最新文章', allPosts: '全部文章', allProjects: '全部项目', now: '此刻', posts: '文章', projects: '项目', works: '成果', featured: '精选', links: '精选链接', aboutMe: '关于我', rss: 'RSS 订阅', email: '邮箱' },
    posts: { title: '文章', description: '关于想法、工具与长期工作的写作。', published: '发布于', updated: '更新于', readingTime: '阅读时间', minute: '分钟', tags: '标签', series: '系列', previous: '上一篇', next: '下一篇', backToPosts: '返回文章列表', translation: '阅读另一种语言版本' },
    projects: { title: '项目', description: '一些正在生长、也允许变化的作品。', allProjects: '全部项目', status: '状态', backToProjects: '返回项目列表' },
    about: { title: '关于', greeting: '你好，我是', now: '此刻', site: '这个网站', contact: '联系' },
    search: { eyebrow: '搜索', title: '搜索文章', description: '搜索文章', inputLabel: '输入关键词', placeholder: '标题、摘要或标签', initialMessage: '输入关键词开始搜索', results: '篇文章', noResults: '没有找到文章' },
    footer: { builtWith: '用 Astro 构建', rss: 'RSS', search: '搜索' },
    languageToggle: { label: '语言', switchToEnglish: 'Switch to English', switchToChinese: '切换到中文' },
  },
};
