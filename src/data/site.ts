export type Post = { slug: string; title: string; date: string; tags: string[]; description: string; featured?: boolean; body: string[] };
export type Project = { slug: string; title: string; year: string; status: string; description: string; body: string[] };

export const profile = { name: '你的名字', tagline: '研究、创作与长期思考。', bio: '在这里记录值得留下的问题、工具与作品。', now: '正在整理阅读笔记，并打磨这个博客的第一批文章。', email: 'hello@example.com', github: 'https://github.com/' };

export const posts: Post[] = [
  { slug: 'building-a-lasting-blog', title: '从零搭建一个可长期维护的个人博客', date: '2026-07-02', tags: ['Astro', '博客'], featured: true, description: '用清晰的内容结构与克制的界面，让写作成为长期可持续的事。', body: ['一个好的个人博客不需要复杂的功能。它应该先让你愿意写，然后让读者愿意停留。', '我把内容、页面和视觉系统分开：文章只负责表达，组件负责呈现，主题变量负责维持整体秩序。', '当每一部分都有清楚的边界，博客便会随着内容积累而自然生长。'] },
  { slug: 'small-systems-long-thinking', title: '用更小的系统，完成更长的思考', date: '2026-07-11', tags: ['工具', '随笔'], description: '给复杂问题留下足够安静的空间，也给长期项目保留可以持续的节奏。', body: ['工具不是为了把一切加速，而是为了减少无意义的摩擦。', '一个足够小的系统，往往更容易被理解、被维护，也更容易陪伴一个长期问题走到最后。', '写作、阅读和项目管理都可以从这种克制开始。'] },
  { slug: 'write-complex-things-clearly', title: '读书笔记：把复杂问题写得更清楚', date: '2026-06-19', tags: ['阅读'], description: '保留留白与稳定的阅读节奏，让内容始终成为视觉中心。', body: ['清楚不是把问题说得简单，而是把结构说得可见。', '先交代问题，再给出判断，最后展示推理过程；这比堆叠结论更能帮助读者建立自己的理解。'] },
  { slug: 'a-better-reading-workflow', title: '建立一套温和的阅读工作流', date: '2026-05-28', tags: ['阅读', '方法'], description: '把输入、标注与复盘分成轻量的阶段，让阅读不再停在收藏夹。', body: ['阅读的关键不在于完成数量，而在于是否形成了自己的问题库。', '每周回顾少量摘记，比偶尔做一次庞大的整理更可靠。'] }
];

export const projects: Project[] = [
  { slug: 'knowledge-garden', title: '个人知识花园', year: '2026', status: '持续更新', description: '一个持续更新的笔记、研究与作品索引。', body: ['把零散笔记整理成可以回访的知识路径。', '这个项目关注轻量的结构、清晰的链接与长期积累。'] },
  { slug: 'reading-atlas', title: 'Reading Atlas', year: '2025', status: '实验中', description: '用主题与问题组织读书笔记的可视化索引。', body: ['读过的书并不是一排书名，而是一张不断生长的关联网络。'] }
];
