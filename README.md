# AgileHero MCP server

**Agile project management your AI agent can operate.** AgileHero is a project tool for agile
teams — kanban boards, epics and roadmap, retrospectives, estimation poker, whiteboards, a wiki and
delivery metrics in one workspace — and every module is exposed to AI assistants over the
[Model Context Protocol](https://modelcontextprotocol.io) through **49 tools**.

This repository is the public connector kit for the hosted server. There is no server code here:
the server runs at `https://mcp.agilehero.io/mcp`, and these files describe it to MCP clients and
catalogs (the registry manifest, a Claude Code plugin, client configuration) and document what it can do.

- Website: <https://agilehero.io>
- Setup guide and supported clients: <https://agilehero.io/docs/mcp>
- AgileHero Markup (rich-text) specification: <https://agilehero.io/docs/mcp/agilehero-markup>
- Official MCP Registry entry: `io.agilehero/agilehero`

## Connect

| | |
|---|---|
| Endpoint | `https://mcp.agilehero.io/mcp` |
| Transport | Streamable HTTP |
| Authentication | OAuth 2.1 — you sign in with your AgileHero account from the client; no API key to paste. The client must support [Client ID Metadata Documents](https://agilehero.io/docs/mcp) (Claude Code, Claude.ai, VS Code, Codex, Zed and others; Cursor and Gemini CLI are not yet supported). |
| Permissions | The agent acts as you — it can do exactly what your account can do, nothing more. |
| Plans | Every plan, including Free. Wiki, whiteboard, retrospective and roadmap tools need a workspace on Pro or on the 14-day trial. |
| Daily limit | Tool calls are metered per user per workspace: 500 a day on Free, 5,000 on Pro or trial, reset at 00:00 UTC. |

**Claude Code**

```bash
claude mcp add --transport http agilehero https://mcp.agilehero.io/mcp
```

Then run `/mcp` inside Claude Code and follow the sign-in link.

**Claude Code plugin** — this repository is also a plugin marketplace with one plugin; install it
and the server comes with it.

```bash
claude plugin marketplace add agilehero-io/agilehero-mcp
claude plugin install agilehero@agilehero
```

**Any other MCP client** — point it at the endpoint above; the client discovers the authorization
server on its own (RFC 9728 protected-resource metadata) and opens the sign-in. Per-client steps
for VS Code, Codex, Zed and more: <https://agilehero.io/docs/mcp>.

Generic configuration ([`.mcp.json`](.mcp.json)):

```json
{ "mcpServers": { "agilehero": { "type": "http", "url": "https://mcp.agilehero.io/mcp" } } }
```

## What an agent can do

Ask it to triage a backlog, break a spec into an epic with cards, estimate, move work across the
board, write up a retrospective, turn a whiteboard brainstorm into cards, or draft a wiki page —
in your own workspace, with your permissions, with every change appearing live for your team.

Conventions the server tells every client at `initialize` time: every id is a short `uid`
returned by a list/get/search tool (never invented); most tools need a project uid (call
`list_projects` first); rich text is **AgileHero Markup (AHM)**, a strict XML dialect — call
`get_ahm_spec` once before writing any; description and wiki edits are two-step by design
(preview, then apply with the returned token).

## Tools (49)

### Discovery & search

| Tool | What it does |
|---|---|
| `list_projects` | List every workspace and project the token's user can access, so the agent can resolve the project uid that… |
| `search` | The product's global full-text search (OpenSearch): cards, epics, wiki pages and projects, matching titles,… |
| `search_cards` | Title-substring card search within one project (kanban board and backlog), matching the product's in-project… |
| `list_project_users` | List the members of a project so the agent can resolve assignee uids |
| `list_board_lists` | List the lists of a project's kanban board so the agent can resolve a valid move_card destination. |
| `list_labels` | List a project's labels so the agent can reuse the existing taxonomy instead of creating near-duplicates on… |

### Cards & epics

| Tool | What it does |
|---|---|
| `list_cards` | List the cards of one kanban list, or of the project's backlog when list_id is omitted or empty, in board… |
| `get_card` | Retrieve detailed information about a card by its ID |
| `create_card` | Create a new card on a project's kanban board, with any combination of supported fields |
| `update_card` | Update an existing card by its uid. |
| `move_card` | Move a card to a different list (or change its position within the same list). |
| `delete_card` | Soft-delete a card by its uid |
| `list_epics` | List a project's epics so the agent can resolve epic uids for get_epic and card assignment. |
| `get_epic` | Retrieve detailed information about an epic by its ID |
| `create_epic` | Create a new epic on a project, with any combination of supported fields |
| `update_epic` | Update an existing epic by its uid; only supplied fields are changed. |
| `delete_epic` | Soft-delete an epic by its uid. |
| `create_label` | Create a new label on a project by name. |
| `create_comment` | Add a comment to a card or to an epic. |
| `delete_comment` | Delete a comment YOU posted (comments are attributed to the signed-in user this client acts as — other… |

### Rich text (AgileHero Markup)

| Tool | What it does |
|---|---|
| `get_ahm_spec` | The AgileHero Markup (AHM) v1.0 specification — the ONLY rich-text format AgileHero accepts (markdown and… |
| `preview_description_update` | REQUIRED first step of every card or epic description edit: validates the block operations and returns the… |
| `update_description` | Apply a previously previewed description update to a card or epic. |

### Wiki

| Tool | What it does |
|---|---|
| `list_wiki_paths` | List all wiki paths (pages and folders) for a project |
| `show_wiki_page` | Retrieve a wiki page as AgileHero Markup (AHM) with its document_version. |
| `create_wiki_page` | Create a wiki page (optionally inside a folder) with AgileHero Markup (AHM) content. |
| `preview_wiki_page_update` | REQUIRED first step of every wiki page update: validates the operations and returns the server-computed… |
| `update_wiki_page` | Apply a previously previewed update to a wiki page. |

### Whiteboards

| Tool | What it does |
|---|---|
| `list_whiteboards` | List the whiteboards of a project (uid, name, element count, url). |
| `create_whiteboard` | Create an empty whiteboard on a project. |
| `get_whiteboard` | Read a whiteboard as a compact text representation: board bounds plus one line per element — "<type> <uid> at… |
| `create_whiteboard_elements` | Create up to 100 whiteboard elements in one transactional call (all-or-nothing, one realtime event). |
| `create_whiteboard_diagram` | Draw a diagram (flowchart, process, dependency graph) on a whiteboard from a semantic graph — nodes, edges,… |
| `update_whiteboard_elements` | Update up to 100 whiteboard elements in one all-or-nothing call: move (x/y), resize, restack (z_index),… |
| `delete_whiteboard_elements` | Delete up to 100 whiteboard elements in one transactional call. |
| `review_whiteboard` | Run deterministic quality checks on a whiteboard: text likely overflowing its element, visibly overlapping… |
| `convert_whiteboard_element` | Convert a whiteboard element into a backlog item: a sticky note into a card or an epic, or a frame into an… |
| `convert_mind_map` | Convert a mind map into backlog items with a per-node mapping: the root can become a new epic (role "epic")… |

### Retrospectives

| Tool | What it does |
|---|---|
| `list_retrospectives` | List a project's retrospective meetings, most recent first (uid, name, date, url). |
| `create_retrospective` | Create a retrospective meeting. |
| `get_retrospective` | Read a retrospective meeting: its columns (with uids — the handles add_retro_items and move_retro_item take),… |
| `add_retro_items` | Add items to a retrospective board, several at once. |
| `move_retro_item` | Move a retrospective item to another column of its retro board. |

### Roadmap

| Tool | What it does |
|---|---|
| `list_roadmap_slots` | List a project's roadmap slots overlapping a date window (default: this month through five months out). |
| `create_roadmap_slot` | Schedule an epic on the project roadmap: a slot from start_date to end_date, optionally with assignees. |
| `update_roadmap_slot` | Update a roadmap slot: reschedule or resize (start_date/end_date), move it to another epic of the same… |
| `delete_roadmap_slot` | PERMANENTLY delete a roadmap slot (and its assignee links). |

### Metrics & attention

| Tool | What it does |
|---|---|
| `list_attention_cards` | List the cards needing attention on a project's kanban board — the same lists as the product's Metrics pages. |
| `get_metrics_summary` | One-call counts of the cards needing attention on a project's kanban board: overdue_cards_count,… |

## Files in this repository

| File | Purpose |
|---|---|
| [`server.json`](server.json) | Manifest published to the Official MCP Registry |
| [`.mcp.json`](.mcp.json) | Client configuration for the hosted server |
| [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Claude Code plugin manifest (validated with `claude plugin validate`) |
| [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) | Marketplace manifest so the plugin installs straight from this repository |
| [`assets/agilehero-icon-512.png`](assets/agilehero-icon-512.png) | Icon for catalogs |

## Pricing

2 seats free forever. Pro is $12/month plus $9 per extra seat, with a 14-day trial of every premium
module and no credit card. Details: <https://agilehero.io/pricing>.

## Support

<https://agilehero.io/contact/> · support@agilehero.io

## License

The files in this repository are released under the [MIT License](LICENSE). AgileHero itself is a
hosted, proprietary service; its [Terms](https://agilehero.io/terms/) apply to the account you sign in with.
