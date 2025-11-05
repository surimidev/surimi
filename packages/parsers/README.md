# @surimi/parsers

Zero-dependency tokenizers / stringifyers for CSS selectors, at-rules etc - written in typescript types.

## Selectors

Convert a valid CSS selector into a list of `nodes`, each representing a token, both at runtime and in typescript types.

```css
html#container > .button
```

becomes something like

```ts
[
  {
    type: "type";
    name: "html";
    content: "html";
  },
  {
    type: "id";
    name: "container";
    content: "#container";
  },
  {
    type: "combinator";
    content: ">";
  },
  {
    type: "class";
    name: "button";
    content: ".button";
  },
]
```

## At-rules

The same thing for `at-rules`: Given something like an `@media screen and (min-width: 600px)`, you will get

```ts
[{
  { type: 'at-rule-name', name: 'media', content: '@media' },
  { type: 'identifier', value: 'screen', content: 'screen' },
  { type: 'operator', operator: 'and', content: 'and' },
  { type: 'delimiter', delimiter: '(', content: '(' },
  { type: 'identifier', value: 'min-width', content: 'min-width' },
  { type: 'delimiter', delimiter: ':', content: ':' },
  { type: 'dimension', value: 768, unit: 'px', content: '768px' },
  { type: 'delimiter', delimiter: ')', content: ')' },
}];
```

---

This is inspired by, and partially includes code derived from, https://parsel.verou.me by the one and only [Lea Verou](https://github.com/sponsors/LeaVerou).
