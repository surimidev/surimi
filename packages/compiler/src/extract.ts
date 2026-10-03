import { SURIMI_CSS_EXPORT_NAME } from './constants';

export interface SurimiModule extends Record<string, unknown> {
  default?: unknown;
  [SURIMI_CSS_EXPORT_NAME]?: unknown;
}

export function isSerializable(value: unknown): value is string | number | boolean | null | object {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean' || value === null || type === 'object';
}

/** Extract CSS and JSON-serializable exports from an evaluated surimi module namespace. */
export function extractSurimiResult(module: SurimiModule): { css: string; js: string } {
  const cssValue = module[SURIMI_CSS_EXPORT_NAME] ?? '';
  const css = typeof cssValue === 'string' ? cssValue : '';

  const exports: string[] = [];
  // Sort by code-unit order to match ES module-namespace key ordering, which is how the
  // rolldown `execute()` path enumerated exports before this was shared. Keeps both evaluators
  // deterministic and byte-identical (see parity tests).
  for (const [key, value] of Object.entries(module).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (key === 'default' || key === SURIMI_CSS_EXPORT_NAME) continue;
    if (!isSerializable(value)) continue;
    try {
      exports.push(`export const ${key} = ${JSON.stringify(value)};`);
    } catch {
      // skip values that fail JSON serialization
    }
  }

  return { css, js: exports.length > 0 ? exports.join('\n') : '' };
}
