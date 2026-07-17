export type Project = { slug: string; title: string; year: string; status: string; description: string; body: string[] };

export const profile = { name: 'Pitohui', tagline: '研究、创作与长期思考。', bio: '在这里记录值得留下的问题、工具与作品。', now: '正在整理阅读笔记，并打磨这个博客的第一批文章。', email: 'katolevin**@gmail.com', github: 'https://github.com/PitoHuill' };

export const projects: Project[] = [
  { slug: 'knowledge-garden', title: '个人知识花园', year: '2026', status: '持续更新', description: '一个持续更新的笔记、研究与作品索引。', body: ['把零散笔记整理成可以回访的知识路径。', '这个项目关注轻量的结构、清晰的链接与长期积累。'] },
  { slug: 'reading-atlas', title: 'Reading Atlas', year: '2025', status: '实验中', description: '用主题与问题组织读书笔记的可视化索引。', body: ['读过的书并不是一排书名，而是一张不断生长的关联网络。'] }
];
