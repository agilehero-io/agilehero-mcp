# AgileHero Markup (AHM) v1.0

<!-- generated from data/mcp-docs.json by scripts/generate-docs.mjs — do not edit -->

AgileHero Markup is the only rich-text format AgileHero accepts, for wiki pages,
card and epic descriptions, and comments. Markdown and HTML are never accepted and
render as literal text. Agents can also fetch this specification at runtime with the
`get_ahm_spec` tool.

AHM is the ONLY rich-text format AgileHero accepts. Markdown and HTML are never
accepted and render as literal text. AHM is strict XML with a closed vocabulary —
anything outside this specification is rejected with a repair hint.

## Rules

1. Wrap every payload: `<agile-hero-markup version="1.0">`...`</agile-hero-markup>`
2. Escape & < > in text as &amp; &lt; &gt; (attributes also need &quot;).
   Inside `<code-line>`, wrap raw code in <![CDATA[...]]> instead of escaping.
3. Block ids: keep the id attribute of any block you edit; omit ids on new blocks
   (the server assigns them). Never invent ids.
4. `<discussion id="...">`...`</discussion>` marks an inline team discussion anchored to
   the wrapped text. PRESERVE these tags when editing — move them with the text they
   annotate; deleting one unanchors a discussion for the whole team.
5. `<image/>`, `<attachment/>` and `<unknown/>` are references — keep, move, or delete
   them, never invent them (media is added through the app's upload flow).

## Block elements

- `<paragraph>` — attributes: id, align=left|center|right
- `<heading>` — attributes: id, align=left|center|right, level=1|2|3 (required)
- `<quote>` — attributes: id
- `<code-block>` — attributes: id, lang
- `<code-line>` — attributes: id
- `<divider>` — attributes: id
- `<list-item>` — attributes: id, style=bullet|ordered|todo (required), indent, checked=true|false, start
- `<table>` — attributes: id
- `<row>` — attributes: id
- `<cell>` — attributes: id, header=true|false
- `<image>` — attributes: id, media (required), alt, align=left|center|right, name
- `<attachment>` — attributes: id, media (required), name
- `<unknown>` — attributes: id, kind

## Inline elements (inside paragraph, heading, quote, list-item, cell)

- `<bold>` 
- `<italic>` 
- `<underline>` 
- `<strikethrough>` 
- `<inline-code>` 
- `<color>` — attributes: value (required)
- `<highlight>` — attributes: value (required)
- `<link>` — attributes: url (required), id
- `<mention>` — attributes: uid (required), id, key
- `<discussion>` — attributes: id (required)

## Lists are flat

Each item is one `<list-item>`; nesting is the indent attribute (1 = top level):

```xml
<list-item style="bullet" indent="1">Fruit</list-item>
<list-item style="bullet" indent="2">Apple</list-item>
<list-item style="todo" indent="1" checked="false">Ship it</list-item>
<list-item style="ordered" indent="1" start="3">Third</list-item>
```

## Example document

```xml
<agile-hero-markup version="1.0">
<heading level="1">Sprint 12 retro</heading>
<paragraph>We shipped <discussion id="d3f9k2p1">the <bold>poker</bold> fix</discussion> early.</paragraph>
<paragraph>See <link url="https://agilehero.io">the site</link> — thanks <mention uid="pk3n9abc"/>!</paragraph>
<code-block lang="ruby">
<code-line><![CDATA[if a < b && ok?]]></code-line>
<code-line><![CDATA[  ship!]]></code-line>
<code-line>end</code-line>
</code-block>
<table>
<row><cell header="true">Metric</cell><cell header="true">Value</cell></row>
<row><cell>Velocity</cell><cell>41</cell></row>
</table>
</agile-hero-markup>
```
