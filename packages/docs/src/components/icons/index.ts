import { config, icon } from '@fortawesome/fontawesome-svg-core';
import { faBluesky, faGithub, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
  faCircleChevronLeft,
  faDroplet,
  faDropletSlash,
  faMoon,
  faRss,
  faSun,
} from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

export const ChevronLeftIcon = icon(faCircleChevronLeft);
export const DropletIcon = icon(faDroplet);
export const DropletSlashIcon = icon(faDropletSlash);
export const MoonIcon = icon(faMoon);
export const SunIcon = icon(faSun);
export const RssIcon = icon(faRss);

export const GithubIcon = icon(faGithub);
export const BlueskyIcon = icon(faBluesky);
export const YoutubeIcon = icon(faYoutube);
export const LinkedinIcon = icon(faLinkedin);
