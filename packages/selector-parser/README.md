# @surimi/selector-parser

A zero-dependency CSS selector parser/tokenizer - written in typescript types.

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

This is heavily inspired by, and partially includes code derived from, https://parsel.verou.me by the one and only [Lea Verou](https://github.com/sponsors/LeaVerou).
