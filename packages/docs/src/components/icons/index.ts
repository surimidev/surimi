import { config, icon } from '@fortawesome/fontawesome-svg-core';
import { faBluesky, faDiscord, faGithub, faLinkedin, faNpm, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowRight,
  faBars,
  faBarsStaggered,
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

export const ArrowLeftIcon = icon(faArrowRight);
export const ArrowUpIcon = icon(faArrowRight, { transform: { rotate: 270 } });
export const BarsStaggeredIcon = icon(faBarsStaggered);
export const BarsIcon = icon(faBars);
export const BlueskyIcon = icon(faBluesky);
export const BoltIcon = icon(faBolt);
export const ChevronLeftIcon = icon(faCircleChevronLeft);
export const CodeIcon = icon(faCode);
export const CopyIcon = icon(faCopy);
export const DiscordIcon = icon(faDiscord);
export const BookIcon = icon(faBook);
export const DropletIcon = icon(faDroplet);
export const DropletSlashIcon = icon(faDropletSlash);
export const ExternalLinkIcon = icon(faExternalLinkAlt);
export const GithubIcon = icon(faGithub);
export const LightbulbIcon = icon(faLightbulb);
export const LinkedinIcon = icon(faLinkedin);
export const MoonIcon = icon(faMoon);
export const NpmIcon = icon(faNpm);
export const RssIcon = icon(faRss);
export const ShieldHalvedIcon = icon(faShieldHalved);
export const SunIcon = icon(faSun);
export const TerminalIcon = icon(faTerminal);
export const YoutubeIcon = icon(faYoutube);
