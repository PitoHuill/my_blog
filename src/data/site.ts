import type { Locale } from '../i18n/config';

export type Localized<T> = Record<Locale, T>;

export type Profile = {
  name: string;
  tagline: Localized<string>;
  bio: Localized<string>;
  now: Localized<string>;
  email: string;
  github: string;
};

export type Project = {
  slug: string;
  year: string;
  title: Localized<string>;
  status: Localized<string>;
  description: Localized<string>;
  body: Localized<string[]>;
};

export const profile: Profile = {
  name: 'Pitohui',
  tagline: { en: 'Research, making, and long-term thinking.', zh: '研究、创作与长期思考。' },
  bio: { en: 'A record of questions, tools, and work worth keeping.', zh: '在这里记录值得留下的问题、工具与作品。' },
  now: { en: 'Organizing reading notes and refining this blog’s first collection of posts.', zh: '正在整理阅读笔记，并打磨这个博客的第一批文章。' },
  email: 'katolevin**@gmail.com',
  github: 'https://github.com/PitoHuill',
};

export const projects: Project[] = [
  {
    slug: 'knowledge-garden', year: '2026',
    title: { en: 'Personal Knowledge Garden', zh: '个人知识花园' },
    status: { en: 'Ongoing', zh: '持续更新' },
    description: { en: 'A living index of notes, research, and creative work.', zh: '一个持续更新的笔记、研究与作品索引。' },
    body: {
      en: ['Turning scattered notes into paths of knowledge I can revisit.', 'This project values lightweight structure, clear links, and steady accumulation.'],
      zh: ['把零散笔记整理成可以回访的知识路径。', '这个项目关注轻量的结构、清晰的链接与长期积累。'],
    },
  },
  {
    slug: 'reading-atlas', year: '2025',
    title: { en: 'Reading Atlas', zh: '阅读地图' },
    status: { en: 'Experimenting', zh: '实验中' },
    description: { en: 'A visual index for organizing reading notes by theme and question.', zh: '用主题与问题组织读书笔记的可视化索引。' },
    body: {
      en: ['Books I have read are not a row of titles, but an evolving network of relationships.'],
      zh: ['读过的书并不是一排书名，而是一张不断生长的关联网络。'],
    },
  },
];
