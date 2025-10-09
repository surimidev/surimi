import { config, icon } from '@fortawesome/fontawesome-svg-core';
import { faBluesky, faDiscord, faGithub, faLinkedin, faNpm, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowRight,
  faBolt,
  faBook,
  faCircleChevronLeft,
  faCode,
  faCopy,
  faDroplet,
  faDropletSlash,
  faExternalLinkAlt,
  faLightbulb,
  faMoon,
  faRss,
  faShieldHalved,
  faSun,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

export const ChevronLeftIcon = icon(faCircleChevronLeft);
export const DropletIcon = icon(faDroplet);
export const DropletSlashIcon = icon(faDropletSlash);
export const MoonIcon = icon(faMoon);
export const SunIcon = icon(faSun);
export const RssIcon = icon(faRss);
export const ExternalLinkIcon = icon(faExternalLinkAlt);
export const ActionArrowIcon = icon(faArrowRight);
export const DocumentationIcon = icon(faBook);

// Features section icons
export const ShieldHalvedIcon = icon(faShieldHalved);
export const LightbulbIcon = icon(faLightbulb);
export const BoltIcon = icon(faBolt);
export const CodeIcon = icon(faCode);

// Code section icons
export const CopyIcon = icon(faCopy);

// Install section icons
export const TerminalIcon = icon(faTerminal);

export const GithubIcon = icon(faGithub);
export const NpmIcon = icon(faNpm);
export const BlueskyIcon = icon(faBluesky);
export const YoutubeIcon = icon(faYoutube);
export const LinkedinIcon = icon(faLinkedin);
export const DiscordIcon = icon(faDiscord);
