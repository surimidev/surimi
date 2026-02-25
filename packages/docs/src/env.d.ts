// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />

declare module '*?bundle' {
  const mod: string;
  export default mod;
}
