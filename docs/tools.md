# AgileHero MCP tools (49)

<!-- generated from data/mcp-docs.json by scripts/generate-docs.mjs — do not edit -->

Every tool call goes to `https://mcp.agilehero.io/mcp` over Streamable HTTP (POST), authenticated with OAuth.
Every `id` is a short uid returned by a list, get or search tool — never invent one.
Most tools need a project uid, so call `list_projects` first.

## Discovery and search

### list_projects

List every workspace and project the token's user can access, so the agent can resolve the project uid that most other tools require. Call this first whenever no project uid is known — never ask the user to paste one. Returns workspaces (uid, name, plan, your role) with their projects (uid, name, url). Pro-pillar tools (wiki, metrics) need the workspace's plan to be pro or trial.

*read-only*

```json
{
  "name": "list_projects",
  "arguments": {}
}
```

### search

The product's global full-text search (OpenSearch): cards, epics, wiki pages and projects, matching titles, descriptions, comments, checklist items and attachment filenames, relevance-ranked with a recency boost. Use this to find anything by content ("the card where we discussed the migration"); use search_cards only for title-substring lookups inside one project. Each result carries a type, an action-ready uid (cards feed get_card/update_card, epics get_epic, wiki_pages show_wiki_page, projects the project_id parameters), a deep-link url, and <mark>-highlighted snippets showing why it matched. Optionally scope with project_id or assigned_to_me. Paginate with page/per_page; total_count is the full match count.

*read-only*

```json
{
  "name": "search",
  "arguments": {
    "query": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | yes | Free-text search query |
| `project_id` | string | no | Optional project uid to scope the search to |
| `assigned_to_me` | boolean | no | Only results assigned to the token's user |
| `page` | integer | no | Page number (default 1) |
| `per_page` | integer | no | Results per page, 1-50 (default 20) |

### search_cards

Title-substring card search within one project (kanban board and backlog), matching the product's in-project live card search exactly (database case-insensitive substring on the card title only — descriptions and comments are not searched; use the search tool for full-text search across all content types), ordered newest-created first. Returns action-sufficient card summaries (uid, title, list placement + position, epic, labels, assignees, reporter, due date); a query with no matches returns an empty cards array, not an error. Paginate with limit (default 50, max 100) and offset; total_count is the full match count.

*read-only*

```json
{
  "name": "search_cards",
  "arguments": {
    "project_id": "<uid>",
    "query": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |
| `query` | string | yes | Text to match against card titles (case-insensitive substring) |
| `limit` | integer | no | Page size, 1-100 (default 50) |
| `offset` | integer | no | Number of matching cards to skip (default 0) |

### list_project_users

List the people with access to a project — its creator, anyone explicitly added, and every workspace owner/admin — so the agent can resolve assignee uids instead of guessing names. Returns each member's uid, full name, email and workspace role (owner, admin, member or observer). Those uids are what assigned_to takes on create_card, update_card, create_epic, update_epic and create_roadmap_slot.

*read-only*

```json
{
  "name": "list_project_users",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |

### list_board_lists

List the lists of a project's kanban board so the agent can resolve a valid move_card destination. Returns each active list in display order with its uid (usable as a move_card target) and display name. The backlog is included as a selectable entry with an empty-string id.

*read-only*

```json
{
  "name": "list_board_lists",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |

### list_labels

List a project's labels so the agent can reuse the existing taxonomy instead of creating near-duplicates on card writes. Returns each label in display order (position ascending) with its uid, name and position.

*read-only*

```json
{
  "name": "list_labels",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |

## Cards and epics

### list_cards

List the cards of one kanban list, or of the project's backlog when list_id is omitted or empty, in board display order (top of the column first, i.e. placement position descending — the same order the product UI shows). Filters combine with AND: epic_id, label_id, assigned_user_id and reporter_id take uids (an unknown uid matches nothing); due_date keeps cards due on or before the given date. Returns action-sufficient card summaries (uid, title, list + position, epic, labels, assignees, reporter, due date) ready for get_card / move_card / update_card, paginated with limit (default 50, max 100) and offset; total_count is the full filtered count.

*read-only*

```json
{
  "name": "list_cards",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |
| `list_id` | string | no | List uid to read; omit or pass an empty string for the backlog |
| `epic_id` | string | no | Only cards in this epic (epic uid) |
| `label_id` | string | no | Only cards carrying this label (label uid) |
| `assigned_user_id` | string | no | Only cards assigned to this user (user uid) |
| `reporter_id` | string | no | Only cards reported (created) by this user (user uid) |
| `due_date` | string | no | Only cards due on or before this date (ISO-8601, e.g. 2026-06-10) |
| `updated_since` | string | no | Only cards whose record changed at or after this ISO-8601 date or datetime — the "what changed since I last ran" filter. Caveat: edits to attached collections (labels, checklists, links) may not bump a card's change time; title/description/scalar edits always do. |
| `limit` | integer | no | Page size, 1-100 (default 50) |
| `offset` | integer | no | Number of cards to skip (default 0) |

### get_card

Read one card in full: its AgileHero Markup description with block ids plus description_version (the two inputs preview_description_update / update_description take), list placement, epic, labels, assignees, reporter, type, estimation, due date, checklists, links, attachments, related cards and threaded comments. Takes the card uid alone — there is no project_id parameter. Card uids come from list_cards, search or search_cards.

*read-only*

```json
{
  "name": "get_card",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The unique identifier of the card |

### create_card

Create a card on a project's kanban board. Only project_id and title are required. Omit list_id to put the card in the backlog; omit position to join the end of the queue (move_card documents the position contract). description is AgileHero Markup — never markdown or HTML; read get_ahm_spec first. epic_id and assignee uids must already exist (list_epics, list_project_users), while label names that do not exist yet are created on the project. estimation is Fibonacci complexity (0/1/2/3/5/8/13), not a time estimate. Checklists, links, attachments and card relations can all be supplied in this same call.

```json
{
  "name": "create_card",
  "arguments": {
    "project_id": "<uid>",
    "title": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | Project uid the card belongs to (the card is created on the project's kanban board) |
| `list_id` | string | no | List uid; omit to place in backlog |
| `position` | integer | no |  |
| `type` | enum: story \| bug \| chore \| research | no |  |
| `title` | string | yes |  |
| `description` | string | no | AgileHero Markup (AHM) — never markdown or HTML; read get_ahm_spec first. Description surface: no tables, colors, alignment, or discussions. |
| `epic_id` | string | no | Epic uid; must already exist on the project |
| `estimation` | enum: 0 \| 1 \| 2 \| 3 \| 5 \| 8 \| 13 | no | Complexity estimate in story points (Fibonacci scale), not a time estimate |
| `due_date` | string | no | ISO-8601 date |
| `assigned_to` | array of string | no | Assignee user uids, discoverable via list_project_users |
| `labels` | array of string | no | Label names; unknown names are created on the project |
| `checklists` | array of object | no | Each { name, items: [{ description, checked }] }; items keep the supplied order |
| `cards_relations` | array of object | no | Each { type, target_card_id (a card uid on the same board) } |
| `links` | array of object | no | Each { url, description } |
| `attachments` | array of object | no | Each { url, name }; the file is fetched from the url |

### update_card

Update an existing card by its uid. For collections, prefer the add_*/remove_* delta fields (safe incremental edits: add_labels, remove_assignees, add_checklist_items, check_items, …); the plain collection fields (labels, assigned_to, checklists, cards_relations, links, attachments) REPLACE the prior state destructively and cannot be combined with their deltas. Use move_card to change list or position, and preview_description_update / update_description to edit the description.

*destructive*

```json
{
  "name": "update_card",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Card uid |
| `type` | enum: story \| bug \| chore \| research | no |  |
| `title` | string | no |  |
| `epic_id` | string | no |  |
| `estimation` | enum: 0 \| 1 \| 2 \| 3 \| 5 \| 8 \| 13 | no | Complexity estimate in story points (Fibonacci scale), not a time estimate |
| `due_date` | string | no | ISO-8601 date |
| `assigned_to` | array of string | no | Assignee user uids, discoverable via list_project_users; replaces the card's assignees |
| `labels` | array of string | no | Label names; unknown names are created on the project; replaces the card's labels |
| `checklists` | array of object | no | Each { name, items: [{ description, checked }] }; items keep the supplied order; replaces the card's checklists |
| `cards_relations` | array of object | no | Each { type, target_card_id (a card uid on the same board) }; replaces the card's relations |
| `links` | array of object | no | Each { url, description }; replaces the card's links |
| `attachments` | array of object | no | Each { url, name }; the file is fetched from the url; replaces the card's attachments |
| `add_labels` | array of string | no | Add labels by name (unknown names are created); keeps existing labels |
| `remove_labels` | array of string | no | Remove labels by name (case-insensitive); absent names are no-ops |
| `add_assignees` | array of string | no | Add assignees by user uid; keeps existing assignees |
| `remove_assignees` | array of string | no | Remove assignees by user uid; absent uids are no-ops |
| `add_checklist_items` | array of object | no | Append items: each { checklist, description, checked? } — the named checklist is created if it does not exist |
| `check_items` | array of object | no | Mark items done, matched by exact description within the named checklist |
| `uncheck_items` | array of object | no | Mark items not done (same matching as check_items) |
| `remove_checklist_items` | array of object | no | Delete items; absent items are no-ops |
| `add_relations` | array of object | no | Add relations; keeps existing relations |
| `remove_relations` | array of object | no | Remove matching relations; absent ones are no-ops |
| `add_links` | array of object | no | Add links: each { url, description? }; keeps existing links |
| `remove_links` | array of string | no | Remove links by exact url; absent urls are no-ops |

### move_card

Move a card to a different list (or change its position within the same list). Only cards on a kanban board can be moved; cards on retrospective boards are rejected. Pass an empty string for list_id to move the card to the kanban backlog. A list is displayed top-down from its highest position, so position 0 is the BOTTOM of the list. Omit position to join the end of the queue (the bottom, position 0) in the backlog and in to_do and in_progress lists, or the top of a done list.

```json
{
  "name": "move_card",
  "arguments": {
    "id": "…",
    "list_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Card uid |
| `list_id` | string | yes | Target list uid; empty string moves to backlog (kanban only) |
| `position` | integer | no | Placement within the target: 0 is the bottom and the highest position is the top. Must be between 0 and the number of other cards already in the target. Omit it to join the end of the queue (position 0) in the backlog and in to_do and in_progress lists, or the top of a done list. |

### delete_card

Soft-delete a card by its uid: it leaves the board and every listing, its relations to other cards are removed, any estimation session on it is deactivated, and whiteboard elements linked to it are unlinked. The epic it belonged to is not deleted. There is no undelete through MCP.

*destructive*

```json
{
  "name": "delete_card",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Card uid |

### list_epics

List a project's epics so the agent can resolve epic uids for get_epic and card assignment. Returns each epic in display order (position ascending) with its uid, number, name, description (Markdown), color, start/end dates and card counts.

*read-only*

```json
{
  "name": "list_epics",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |
| `updated_since` | string | no | Only epics whose record changed at or after this ISO-8601 date or datetime. Caveat: collection edits (checklists, links) may not bump an epic's change time; name/date/description edits always do. |

### get_epic

Read one epic in full: its AgileHero Markup description with block ids plus description_version (the two inputs preview_description_update / update_description take), name, number, color, start/end dates, assignees, checklists, links, attachments, the cards on it and threaded comments. Takes the epic uid alone — there is no project_id parameter. Epic uids come from list_epics or search.

*read-only*

```json
{
  "name": "get_epic",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The unique identifier of the epic |

### create_epic

Create an epic on a project. Only project_id and name are required. description is AgileHero Markup — never markdown or HTML; read get_ahm_spec first. Assignee uids come from list_project_users. Checklists, links and attachments can be supplied in this same call. Returns the new epic uid — what create_card / update_card take as epic_id, and what create_roadmap_slot schedules.

```json
{
  "name": "create_epic",
  "arguments": {
    "project_id": "<uid>",
    "name": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | Project uid the epic belongs to |
| `name` | string | yes |  |
| `description` | string | no | AgileHero Markup (AHM) — never markdown or HTML; read get_ahm_spec first. Description surface: no tables, colors, alignment, or discussions. |
| `color` | string | no | Hex color like #0060F0 |
| `start_date` | string | no | ISO-8601 date |
| `end_date` | string | no | ISO-8601 date |
| `assigned_to` | array of string | no | Assignee user uids, discoverable via list_project_users |
| `checklists` | array of object | no | Each { name, items: [{ description, checked }] }; items keep the supplied order |
| `links` | array of object | no | Each { url, description } |
| `attachments` | array of object | no | Each { url, name }; the file is fetched from the url |

### update_epic

Update an existing epic by its uid; only supplied fields are changed. For collections, prefer the add_*/remove_* delta fields (safe incremental edits); the plain collection fields (assigned_to, checklists, links, attachments) REPLACE the prior state destructively and cannot be combined with their deltas. Use preview_description_update / update_description to edit the description.

*destructive*

```json
{
  "name": "update_epic",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Epic uid |
| `name` | string | no |  |
| `color` | string | no | Hex color like #0060F0 |
| `start_date` | string | no | ISO-8601 date |
| `end_date` | string | no | ISO-8601 date |
| `assigned_to` | array of string | no | Assignee user uids, discoverable via list_project_users; replaces the epic's assignees |
| `checklists` | array of object | no | Each { name, items: [{ description, checked }] }; replaces the epic's checklists |
| `links` | array of object | no | Each { url, description }; replaces the epic's links |
| `attachments` | array of object | no | Each { url, name }; the file is fetched from the url; replaces the epic's attachments |
| `add_assignees` | array of string | no | Add assignees by user uid; keeps existing assignees |
| `remove_assignees` | array of string | no | Remove assignees by user uid; absent uids are no-ops |
| `add_checklist_items` | array of object | no | Append items: each { checklist, description, checked? } — the named checklist is created if it does not exist |
| `check_items` | array of object | no | Mark items done, matched by exact description within the named checklist |
| `uncheck_items` | array of object | no | Mark items not done (same matching as check_items) |
| `remove_checklist_items` | array of object | no | Delete items; absent items are no-ops |
| `add_links` | array of object | no | Add links: each { url, description? }; keeps existing links |
| `remove_links` | array of string | no | Remove links by exact url; absent urls are no-ops |

### delete_epic

Soft-delete an epic by its uid. Its cards are NOT deleted — they stay on the board, detached from the epic. The epic's roadmap slots ARE permanently deleted (a slot schedules an epic, so it is meaningless without one), and whiteboard elements linked to the epic are unlinked.

*destructive*

```json
{
  "name": "delete_epic",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Epic uid |

### create_label

Create a new label on a project by name. If a label with the same name already exists (case-insensitive), the existing label is returned unchanged instead of creating a near-duplicate. The new label is appended at the end of the display order.

```json
{
  "name": "create_label",
  "arguments": {
    "project_id": "<uid>",
    "name": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | Project uid the label belongs to |
| `name` | string | yes |  |

### create_comment

Add a comment to a card or to an epic. Provide exactly one of card_id or epic_id. Content is AgileHero Markup (AHM, comment surface: no tables, media, colors, alignment, or discussions) — never markdown or HTML; read get_ahm_spec first. The comment is attributed to the signed-in user this client acts as and appears in subsequent get_card / get_epic responses. Comments cannot be edited via MCP; delete_comment removes your own (correct mistakes by delete + repost). Pass parent_comment_id to reply to an existing comment. Threads are one level deep: replying to a reply attaches the new comment to that reply's thread root instead, so do not attempt to nest replies. The parent must be a comment on the same card or epic — a uid from anywhere else is rejected.

```json
{
  "name": "create_comment",
  "arguments": {
    "content": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `card_id` | string | no | Card uid to comment on (mutually exclusive with epic_id) |
| `epic_id` | string | no | Epic uid to comment on (mutually exclusive with card_id) |
| `content` | string | yes | Comment body as AgileHero Markup (AHM) |
| `parent_comment_id` | string | no | Optional uid of a comment on the SAME card or epic to reply to. Omit for a top-level comment. Replying to a reply normalises to that reply's thread root (threads are one level deep). |

### delete_comment

Delete a comment YOU posted (comments are attributed to the signed-in user this client acts as — other people's comments cannot be deleted). The correction pattern is delete + post a corrected comment with create_comment. A deleted comment that has replies remains visible as a tombstone in its thread. Comment uids come from get_card / get_epic.

*destructive*

```json
{
  "name": "delete_comment",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Comment uid |

## Rich text (AgileHero Markup)

### get_ahm_spec

The AgileHero Markup (AHM) v1.0 specification — the ONLY rich-text format AgileHero accepts (markdown and HTML are rejected). Read this ONCE before writing or editing any rich text (wiki pages, card/epic descriptions, comments): vocabulary, attributes, escaping rules, and a worked example. Same text on the web: https://agilehero.io/docs/mcp/agilehero-markup

*read-only*

```json
{
  "name": "get_ahm_spec",
  "arguments": {}
}
```

### preview_description_update

REQUIRED first step of every card or epic description edit: validates the block operations and returns the server-computed consequences plus the preview_token that update_description requires. Nothing is modified. Content is AgileHero Markup (AHM, description surface: no tables, colors, alignment, discussions, or file attachments) — read get_ahm_spec first; block ids and document_version come from get_card / get_epic.

*read-only*

```json
{
  "name": "preview_description_update",
  "arguments": {
    "resource_type": "card",
    "id": "…",
    "document_version": "…",
    "operations": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `resource_type` | enum: card \| epic | yes |  |
| `id` | string | yes | Card or epic uid |
| `document_version` | string | yes | From get_card / get_epic |
| `operations` | array of object | yes | Applied in order against the evolving description |

### update_description

Apply a previously previewed description update to a card or epic. Requires the preview_token from preview_description_update for EXACTLY these operations and this document_version — saving without previewing is impossible by design. Returns the updated description (AHM + new document_version).

*destructive*

```json
{
  "name": "update_description",
  "arguments": {
    "resource_type": "card",
    "id": "…",
    "document_version": "…",
    "operations": [
      {}
    ],
    "preview_token": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `resource_type` | enum: card \| epic | yes |  |
| `id` | string | yes | Card or epic uid |
| `document_version` | string | yes | The version the preview was taken against |
| `operations` | array of object | yes | The exact operations that were previewed |
| `preview_token` | string | yes | From preview_description_update |

## Wiki

### list_wiki_paths

List a project's whole wiki tree in display order — every folder and page with its uid, name, type (page or folder) and parent_id — so the agent can resolve the page uid show_wiki_page takes and pick a parent_id for create_wiki_page. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "list_wiki_paths",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |

### show_wiki_page

Retrieve a wiki page as AgileHero Markup (AHM) with its document_version. Content is AHM, not markdown — block ids, <discussion> anchors, and <image/>/<attachment/> references are part of the document; read get_ahm_spec before editing. Edit via preview_wiki_page_update then update_wiki_page, using the block ids and document_version returned here. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "show_wiki_page",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The unique identifier of the page path |

### create_wiki_page

Create a wiki page (optionally inside a folder) with AgileHero Markup (AHM) content. Content must be wrapped in <agile-hero-markup version="1.0"> — markdown and HTML are rejected; read get_ahm_spec first. Returns the new page's uid, url, document_version and content. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "create_wiki_page",
  "arguments": {
    "project_id": "<uid>",
    "name": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |
| `name` | string | yes | Page title |
| `parent_id` | string | no | Optional folder uid (from list_wiki_paths) |
| `content` | string | no | Page body as AHM; omit for an empty page |

### preview_wiki_page_update

REQUIRED first step of every wiki page update: validates the operations and returns the server-computed consequences (blocks added/removed/changed, files that would be permanently deleted, team discussions that would lose their anchors, possible-markdown warnings) plus the preview_token that update_wiki_page requires. Nothing is modified. Operations are block-addressed (replace_block / insert_after / delete_block / move_block) with AHM content — read get_ahm_spec first, and get block ids + document_version from show_wiki_page. Review the consequences before saving: a listed file deletion or discussion unanchoring is only acceptable when the user asked for it. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "preview_wiki_page_update",
  "arguments": {
    "id": "…",
    "document_version": "…",
    "operations": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Page path uid |
| `document_version` | string | yes | From show_wiki_page — proves freshness |
| `operations` | array of object | yes | Applied in order against the evolving document |

### update_wiki_page

Apply a previously previewed update to a wiki page. Requires the preview_token from preview_wiki_page_update for EXACTLY these operations and this document_version — saving without previewing is impossible by design. Every save creates a page version humans can revert in the app. Returns the updated page (AHM + new document_version) and the applied consequences. Requires a Pro or trial workspace.

*destructive · Pro or trial*

```json
{
  "name": "update_wiki_page",
  "arguments": {
    "id": "…",
    "document_version": "…",
    "operations": [
      {}
    ],
    "preview_token": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Page path uid |
| `document_version` | string | yes | The version the preview was taken against |
| `operations` | array of object | yes | The exact operations that were previewed |
| `preview_token` | string | yes | From preview_wiki_page_update |

## Whiteboards

### list_whiteboards

List the whiteboards of a project (uid, name, element count, url). Use get_whiteboard to read a board's elements. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "list_whiteboards",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |

### create_whiteboard

Create an empty whiteboard on a project. Add content with create_whiteboard_elements. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "create_whiteboard",
  "arguments": {
    "project_id": "<uid>",
    "name": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |
| `name` | string | yes | Whiteboard name |

### get_whiteboard

Read a whiteboard as a compact text representation: board bounds plus one line per element — "<type> <uid> at <x>,<y> size <w>x<h> [color] [parent <frame-uid>] [linked <card|epic> <uid>] \"text\"", connectors as "connector <uid> <from> -> <to>". Element uids from here are the handles every whiteboard write tool takes. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "get_whiteboard",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The unique identifier of the whiteboard |

### create_whiteboard_elements

Create up to 100 whiteboard elements in one transactional call (all-or-nothing, one realtime event). Native sizes, colors, and text placement are applied server-side — usually give just type + text (+ color). Omit x/y and elements are auto-arranged (grid by default; arrange: row|column|grid, origin_x/origin_y/gap to tune); give x/y for full control. Frames contain elements via parent_id (an existing frame uid) or parent_ref (the ref of a frame earlier in THIS call). Connectors bind elements by uid (source_id/target_id) or batch ref (source_ref/target_ref) — never coordinates; anchors are computed by the UI. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "create_whiteboard_elements",
  "arguments": {
    "whiteboard_id": "<uid>",
    "elements": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `whiteboard_id` | string | yes | The unique identifier of the whiteboard |
| `elements` | array of object | yes | Created in array order — refs only resolve backwards |
| `arrange` | enum: grid \| row \| column | no | Layout for elements without explicit x/y (default grid) |
| `origin_x` | number | no | Auto-arrange start x (default 100) |
| `origin_y` | number | no | Auto-arrange start y (default 100) |
| `gap` | number | no | Auto-arrange spacing in px (default 20) |

### create_whiteboard_diagram

Draw a diagram (flowchart, process, dependency graph) on a whiteboard from a semantic graph — nodes, edges, optional groups, NO coordinates: the server does layered top-to-bottom layout with native sizes and returns the created element uids keyed by your node ids. Placed below existing board content. Transactional (all-or-nothing, one realtime event). Max 20 nodes — split bigger flows into two diagrams. Keep shapes plain (rectangle) unless the semantics demand one (diamond = decision, stadium = start/end, cylinder = data store). Edit the result with update_whiteboard_elements — the layout never runs again. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "create_whiteboard_diagram",
  "arguments": {
    "whiteboard_id": "<uid>",
    "nodes": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `whiteboard_id` | string | yes | The unique identifier of the whiteboard |
| `title` | string | no | Diagram title (frame title, or a heading when groups are used) |
| `nodes` | array of object | yes |  |
| `edges` | array of object | no |  |
| `groups` | array of object | no |  |
| `origin_x` | number | no | Optional top-left x; defaults below existing content |
| `origin_y` | number | no | Optional top-left y; defaults below existing content |

### update_whiteboard_elements

Update up to 100 whiteboard elements in one all-or-nothing call: move (x/y), resize, restack (z_index), retext, recolor, reparent (parent_id — a frame uid, or "" to detach), and connector arrow/path/label. Element uids come from get_whiteboard; element types cannot be changed. Only supplied fields change — unrelated properties are preserved. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "update_whiteboard_elements",
  "arguments": {
    "whiteboard_id": "<uid>",
    "updates": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `whiteboard_id` | string | yes | The unique identifier of the whiteboard |
| `updates` | array of object | yes |  |

### delete_whiteboard_elements

Delete up to 100 whiteboard elements in one transactional call. Deleting a frame or mind-map node releases its children onto the board (they are NOT deleted — include their uids explicitly to delete them too). Connectors attached to deleted elements are not removed and will dangle. Element uids come from get_whiteboard. Requires a Pro or trial workspace.

*destructive · Pro or trial*

```json
{
  "name": "delete_whiteboard_elements",
  "arguments": {
    "whiteboard_id": "<uid>",
    "ids": [
      "…"
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `whiteboard_id` | string | yes | The unique identifier of the whiteboard |
| `ids` | array of string | yes | Element uids to delete |

### review_whiteboard

Run deterministic quality checks on a whiteboard: text likely overflowing its element, visibly overlapping elements, connectors with unbound or dangling endpoints, colors outside the UI palette, off-grid positions, and elements whose parent was deleted. Advisory — findings are suggestions, not errors, and a board with findings may be exactly what the user wants. Use after drawing to sanity-check, fix at most once, and do not loop chasing an empty report. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "review_whiteboard",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The unique identifier of the whiteboard |

### convert_whiteboard_element

Convert a whiteboard element into a backlog item: a sticky note into a card or an epic, or a frame into an epic (the frame's sticky-note children become cards on that epic; already-converted children are re-assigned, not duplicated). The element stays on the board, linked to what it became — get_whiteboard shows the link. An element can only be converted once. The note/frame text becomes the title unless you pass one. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "convert_whiteboard_element",
  "arguments": {
    "id": "…",
    "to": "card"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Element uid (a sticky_note or frame, from get_whiteboard) |
| `to` | enum: card \| epic | yes | What to create |
| `title` | string | no | Card title / epic name; defaults to the element's text |
| `list_id` | string | no | Card only: target list uid; omit for the backlog |
| `color` | string | no | Epic only: hex color; defaults to the element's color |

### convert_mind_map

Convert a mind map into backlog items with a per-node mapping: the root can become a new epic (role "epic") or attach to an existing one (role "existing_epic" + target_epic_id); other nodes become cards on that epic (role "card") or project labels (role "label" — label nodes above a card node in the tree are applied to that card); role "skip" ignores a node. Pass the ROOT element uid as id and every node you want converted in nodes (unlisted nodes are ignored). One conversion per node: already-converted nodes are rejected up front — resubmit without them. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "convert_mind_map",
  "arguments": {
    "id": "…",
    "nodes": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The ROOT mind-map node uid (from get_whiteboard) |
| `nodes` | array of object | yes |  |
| `target_epic_id` | string | no | Epic uid, required with role "existing_epic" on the root |

## Retrospectives

### list_retrospectives

List a project's retrospective meetings, most recent first (uid, name, date, url). Use get_retrospective for a board's columns and items. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "list_retrospectives",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |

### create_retrospective

Create a retrospective meeting. The board is seeded with the standard columns (Kudos, Liked, Disliked, Questions, Discussion, Actions) and their uids are returned, so add_retro_items can be called immediately. Pass previous_retrospective_id to carry the previous meeting's Actions column over as a read-only "Past actions" view (nothing is copied — the link is live). Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "create_retrospective",
  "arguments": {
    "project_id": "<uid>",
    "name": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |
| `name` | string | yes | Meeting name |
| `starts_at` | string | no | Meeting date, ISO-8601 (YYYY-MM-DD); defaults to today |
| `previous_retrospective_id` | string | no | Optional uid of an earlier retrospective in this project (from list_retrospectives) |

### get_retrospective

Read a retrospective meeting: its columns (with uids — the handles add_retro_items and move_retro_item take), every item with its votes, the read-only "Past actions" carried over from the linked previous meeting, and live timer state. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "get_retrospective",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The unique identifier of the retrospective meeting |

### add_retro_items

Add items to a retrospective board, several at once. Each item is { column, text }: column is a column name (Kudos, Liked, Disliked, Questions, Discussion, Actions — case-insensitive) or a column uid from get_retrospective; items are appended in the given order. PARTIAL failure: valid items are created, invalid ones are reported per index — check the "failed" array. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "add_retro_items",
  "arguments": {
    "retrospective_id": "<uid>",
    "items": [
      {}
    ]
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `retrospective_id` | string | yes | The retrospective meeting uid |
| `items` | array of object | yes |  |

### move_retro_item

Move a retrospective item to another column of its retro board. Item uids come from get_retrospective; column is a name (case-insensitive) or column uid. Only works on retrospective boards — use move_card for kanban cards. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "move_retro_item",
  "arguments": {
    "id": "…",
    "column": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The retro item uid (from get_retrospective) |
| `column` | string | yes | Target column name or uid |
| `position` | integer | no | Position in the target column; omit for the top |

## Roadmap

### list_roadmap_slots

List a project's roadmap slots overlapping a date window (default: this month through five months out). A slot schedules an epic between two dates and can carry assignees; one epic may hold several slots, overlaps included — that is by design. Returns at most 200 slots — narrow the window if capped. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "list_roadmap_slots",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |
| `start_date` | string | no | Window start, ISO-8601 (YYYY-MM-DD); default: start of this month |
| `end_date` | string | no | Window end, ISO-8601; default: start_date + 6 months |

### create_roadmap_slot

Schedule an epic on the project roadmap: a slot from start_date to end_date, optionally with assignees. An epic may hold several slots and overlaps are allowed by design — check list_roadmap_slots first if you mean to extend an existing slot rather than add one. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "create_roadmap_slot",
  "arguments": {
    "project_id": "<uid>",
    "epic_id": "<uid>",
    "start_date": "…",
    "end_date": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier of the project |
| `epic_id` | string | yes | Epic uid (from list_epics); must belong to this project |
| `start_date` | string | yes | ISO-8601 (YYYY-MM-DD) |
| `end_date` | string | yes | ISO-8601; same day as start_date is allowed |
| `assigned_to` | array of string | no | User uids to assign (project members — see list_project_users) |

### update_roadmap_slot

Update a roadmap slot: reschedule or resize (start_date/end_date), move it to another epic of the same project (epic_id), or set its assignees. Only supplied fields change, EXCEPT assigned_to which REPLACES the full assignee set — read the slot first and send everyone who should remain. Slot uids come from list_roadmap_slots. Requires a Pro or trial workspace.

*Pro or trial*

```json
{
  "name": "update_roadmap_slot",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The roadmap slot uid |
| `epic_id` | string | no | New epic uid (same project) |
| `start_date` | string | no | ISO-8601 (YYYY-MM-DD) |
| `end_date` | string | no | ISO-8601 |
| `assigned_to` | array of string | no | REPLACES all assignees (user uids, project members); [] clears |

### delete_roadmap_slot

PERMANENTLY delete a roadmap slot (and its assignee links). This cannot be undone — there is no trash for roadmap slots. The epic itself is not touched; to reschedule, prefer update_roadmap_slot. Requires a Pro or trial workspace.

*destructive · Pro or trial*

```json
{
  "name": "delete_roadmap_slot",
  "arguments": {
    "id": "…"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | The roadmap slot uid (from list_roadmap_slots) |

## Metrics and attention

### list_attention_cards

List the cards needing attention on a project's kanban board — the same lists as the product's Metrics pages. Kinds: stuck (sitting in a column, not backlog/Done, unmoved for over 7 days; longest-stuck first), blocking (undone cards that other cards are blocked by), overdue (due within the next 7 days or already past due; soonest first). kind selects one list or 'all' (default). Optionally filter by an assignee uid or the literal 'unassigned'. Each requested section returns card summaries ready for get_card / move_card / update_card, capped at limit with the full total_count. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "list_attention_cards",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |
| `kind` | enum: stuck \| blocking \| overdue \| all | no | Which attention list to return (default 'all' = every list as its own section) |
| `assignee_id` | string | no | Only cards assigned to this user uid, or 'unassigned' for cards with no assignee |
| `limit` | integer | no | Max cards per section, 1-100 (default 50) |

### get_metrics_summary

One-call counts of the cards needing attention on a project's kanban board: overdue_cards_count, blocking_cards_count and stuck_cards_count — the same definitions as list_attention_cards, which returns the cards behind each count. Cheap; call this first to decide whether a deeper look is worth it. Requires a Pro or trial workspace.

*read-only · Pro or trial*

```json
{
  "name": "get_metrics_summary",
  "arguments": {
    "project_id": "<uid>"
  }
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | yes | The unique identifier (uid) of the project |
