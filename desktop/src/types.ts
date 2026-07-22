export type Locale = 'en' | 'zh';

export type PostMeta = {
  title: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  series?: string;
  seriesKey?: string;
  seriesOrder?: number;
  heroImage?: string;
  locale: Locale;
  translationKey: string;
};

export type PostDocument = {
  relativePath: string;
  slug: string;
  meta: PostMeta;
  body: string;
  raw: string;
  isNew?: boolean;
};

export type FileEntry = {
  relativePath: string;
  content: string;
};

export type LocalizedText = { en: string; zh: string };

export type SiteContent = {
  profile: {
    name: string;
    tagline: LocalizedText;
    bio: LocalizedText;
    now: LocalizedText;
    email: string;
    github: string;
  };
  projects: Array<Record<string, unknown>>;
};

export type HomeSectionId = 'featured' | 'now' | 'latest' | 'projects';

export type HomeConfig = {
  sidebar: {
    profile: boolean;
    stats: boolean;
    links: boolean;
  };
  mainSections: Array<{ id: HomeSectionId; visible: boolean }>;
};

export type BlogInfo = {
  root: string;
  name: string;
  branch: string;
  releaseBranch: boolean;
  dirtyFiles: string[];
};

export type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
};

export type PublishResult = {
  branch: string;
  commit: string;
  pushed: boolean;
};
