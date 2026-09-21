// Generates docs/*.md from data/mcp-docs.json — the file the AgileHero backend
// produces with `bin/rails mcp:docs`, the same source the published docs pages
// use. Never edit the generated files by hand: refresh the JSON, re-run this.
//
// The output shape is deliberate. Context7 and similar documentation indexes
// store a *titled code block with a sentence of explanation*, so every client
// and every tool gets its own heading, one line of prose and one fenced block.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(root, "data/mcp-docs.json"), "utf8"));
const { endpoint, transport, clients } = d.setup;
const fence = (lang, body) => "```" + lang + "\n" + body + "\n```";
// Enum types read `enum: story | bug | chore` — the pipes would split the
// markdown table into extra columns, so escape them everywhere in a cell.
const cell = (v) => String(v).replace(/\|/g, "\\|");
const out = (name, body) => {
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "docs", name), body.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
  console.log("docs/" + name);
};

// AHM sections are plain text full of bare XML tags. Left alone, a markdown
// renderer swallows `<paragraph>` as HTML and an indented example loses its
// shape — and an indexer sees prose where it should see code. So: a run of
// indented lines that BEGIN with a tag becomes a fenced xml block (a wrapped
// continuation line of a numbered rule merely mentions one, so it stays prose), a whole section
// that is one document becomes a fenced xml block, and any bare tag left in
// prose is wrapped in backticks.
const renderAhm = (body) => {
  if (/^\s*<agile-hero-markup/.test(body)) return fence("xml", body);
  const lines = body.split("\n");
  const chunks = [];
  let buf = [];
  const flush = () => { if (buf.length) { chunks.push(fence("xml", buf.join("\n").replace(/^ {2}/gm, ""))); buf = []; } };
  for (const line of lines) {
    if (/^\s{2,}</.test(line)) buf.push(line);
    else { flush(); chunks.push(line); }
  }
  flush();
  return chunks
    .map((c) => (c.startsWith("```") ? c : c.replace(/(^|[^`])(<\/?[a-z][a-z0-9-]*(?:\s[^<>]*?)?\/?>)/g, "$1`$2`")))
    .join("\n");
};

/* ---------- setup.md : one snippet per supported client ---------- */
const supported = clients.filter((c) => c.tier === "picker");
const unsupported = clients.filter((c) => c.tier !== "picker");
const langFor = (c) => (c.format === "shell" ? "bash" : c.format === "json" ? "json" : "text");

out("setup.md", `# Connecting a client to the AgileHero MCP server

<!-- generated from data/mcp-docs.json by scripts/generate-docs.mjs — do not edit -->

| | |
|---|---|
| Endpoint | \`${endpoint}\` |
| Transport | ${transport} |
| Authentication | OAuth 2.1 — you sign in with your own AgileHero account from the client. There is no API key or token to paste. The client must support Client ID Metadata Documents. |
| Permissions | The agent acts as you and can do exactly what your account can do. |
| Plans | Every plan including Free. Wiki, whiteboard, retrospective and roadmap tools need a workspace on Pro or on the 14-day trial. |
| Daily limit | 500 tool calls per user per workspace per day on Free, 5,000 on Pro or trial, reset 00:00 UTC. |

## Supported clients

${supported.map((c) => `### ${c.name}

${c.summary}${c.configPath ? `\n\nFile: \`${c.configPath}\`` : ""}

${fence(langFor(c), c.snippet.replaceAll("{{ENDPOINT}}", endpoint))}
${(c.notes || []).map((n) => `- ${n}`).join("\n")}
${c.verify ? `\n**Verify:** ${c.verify}` : ""}
`).join("\n")}

## Not supported yet

These clients cannot complete the sign-in because they do not implement Client ID
Metadata Documents, or they do not support remote MCP servers at all.

${unsupported.map((c) => `- **${c.name}** — ${c.summary}`).join("\n")}
`);

/* ---------- tools.md : one JSON call example per tool ---------- */
const GROUPS = [
  ["Discovery and search", ["list_projects","search","search_cards","list_project_users","list_board_lists","list_labels"]],
  ["Cards and epics", ["list_cards","get_card","create_card","update_card","move_card","delete_card","list_epics","get_epic","create_epic","update_epic","delete_epic","create_label","create_comment","delete_comment"]],
  ["Rich text (AgileHero Markup)", ["get_ahm_spec","preview_description_update","update_description"]],
  ["Wiki", ["list_wiki_paths","show_wiki_page","create_wiki_page","preview_wiki_page_update","update_wiki_page"]],
  ["Whiteboards", ["list_whiteboards","create_whiteboard","get_whiteboard","create_whiteboard_elements","create_whiteboard_diagram","update_whiteboard_elements","delete_whiteboard_elements","review_whiteboard","convert_whiteboard_element","convert_mind_map"]],
  ["Retrospectives", ["list_retrospectives","create_retrospective","get_retrospective","add_retro_items","move_retro_item"]],
  ["Roadmap", ["list_roadmap_slots","create_roadmap_slot","update_roadmap_slot","delete_roadmap_slot"]],
  ["Metrics and attention", ["list_attention_cards","get_metrics_summary"]],
];
const byName = Object.fromEntries(d.tools.map((t) => [t.name, t]));
const missing = d.tools.map((t) => t.name).filter((n) => !GROUPS.some(([, ns]) => ns.includes(n)));
if (missing.length) throw new Error("ungrouped tools: " + missing.join(", "));

const sample = (p) => {
  const t = p.type || "string";
  if (t.startsWith("enum:")) return t.slice(5).split("|")[0].trim();
  if (t === "integer" || t === "number") return 1;
  if (t === "boolean") return true;
  if (t.startsWith("array of object")) return [{}];
  if (t.startsWith("array of")) return ["…"];
  if (/_id$/.test(p.name)) return "<uid>";
  return "…";
};
const flags = (t) => [t.readOnly && "read-only", t.destructive && "destructive", t.premium && "Pro or trial"].filter(Boolean).join(" · ");

out("tools.md", `# AgileHero MCP tools (${d.toolCount})

<!-- generated from data/mcp-docs.json by scripts/generate-docs.mjs — do not edit -->

Every tool call goes to \`${endpoint}\` over ${transport}, authenticated with OAuth.
Every \`id\` is a short uid returned by a list, get or search tool — never invent one.
Most tools need a project uid, so call \`list_projects\` first.

${GROUPS.map(([g, names]) => `## ${g}

${names.map((n) => {
  const t = byName[n];
  const req = (t.parameters || []).filter((p) => p.required);
  const args = Object.fromEntries(req.map((p) => [p.name, sample(p)]));
  const f = flags(t);
  return `### ${t.name}

${t.description}${f ? `\n\n*${f}*` : ""}

${fence("json", JSON.stringify({ name: t.name, arguments: args }, null, 2))}
${(t.parameters || []).length ? `\n| Parameter | Type | Required | Description |\n|---|---|---|---|\n${t.parameters.map((p) => `| \`${p.name}\` | ${cell(p.type)} | ${p.required ? "yes" : "no"} | ${cell(p.description || "")} |`).join("\n")}` : ""}
`;
}).join("\n")}`).join("\n")}`);

/* ---------- agilehero-markup.md : the rich-text format ---------- */
const ahm = d.ahm;
out("agilehero-markup.md", `# ${ahm.title}

<!-- generated from data/mcp-docs.json by scripts/generate-docs.mjs — do not edit -->

AgileHero Markup is the only rich-text format AgileHero accepts, for wiki pages,
card and epic descriptions, and comments. Markdown and HTML are never accepted and
render as literal text. Agents can also fetch this specification at runtime with the
\`get_ahm_spec\` tool.

${ahm.sections.map((s) => `${s.heading ? `## ${s.heading}\n\n` : ""}${renderAhm(s.content.trim())}\n`).join("\n")}
`);
