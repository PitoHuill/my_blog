import type { Locale } from '../i18n/config';
import siteContent from './site-content.json';

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

export const profile: Profile = siteContent.profile;

export const projects: Project[] = siteContent.projects;
