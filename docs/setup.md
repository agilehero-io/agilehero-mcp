# Connecting a client to the AgileHero MCP server

<!-- generated from data/mcp-docs.json by scripts/generate-docs.mjs — do not edit -->

| | |
|---|---|
| Endpoint | `https://mcp.agilehero.io/mcp` |
| Transport | Streamable HTTP (POST) |
| Authentication | OAuth 2.1 — you sign in with your own AgileHero account from the client. There is no API key or token to paste. The client must support Client ID Metadata Documents. |
| Permissions | The agent acts as you and can do exactly what your account can do. |
| Plans | Every plan including Free. Wiki, whiteboard, retrospective and roadmap tools need a workspace on Pro or on the 14-day trial. |
| Daily limit | 500 tool calls per user per workspace per day on Free, 5,000 on Pro or trial, reset 00:00 UTC. |

## Supported clients

### Claude Code

Run once in a terminal; Claude Code stores the server in your user-level config and signs in through your browser.

```bash
claude mcp add --transport http --scope user agilehero https://mcp.agilehero.io/mcp
```
- All flags must come before the server name.
- Then run `/mcp` inside a Claude Code session and choose Authenticate (or run `claude mcp login agilehero`) and approve the sign-in in your browser.

**Verify:** Run `claude mcp list` — agilehero should show as connected. If it shows "needs authentication", run `claude mcp login agilehero`.

### VS Code (GitHub Copilot)

Add to .vscode/mcp.json in a workspace, or run "MCP: Open User Configuration" for all workspaces. A browser window opens for the sign-in the first time the server starts.

File: `.vscode/mcp.json`

```json
{
  "servers": {
    "agilehero": {
      "type": "http",
      "url": "https://mcp.agilehero.io/mcp"
    }
  }
}
```
- "type": "http" is required — without it VS Code treats the URL as a command to run.

**Verify:** Run "MCP: List Servers", start agilehero, complete the sign-in in the browser, and check that its tools appear in the Chat view.

### Codex

Add from the terminal, then sign in — the config is shared by the Codex CLI, the IDE extension, and the ChatGPT desktop app.

```bash
codex mcp add agilehero --url https://mcp.agilehero.io/mcp
codex mcp login agilehero
```
- Codex does not start the sign-in on its own — run `codex mcp login agilehero` after adding the server.

**Verify:** Run `codex mcp list` — agilehero should show as authenticated; then ask Codex to list your AgileHero projects.

### Zed

Add to settings.json, or use Settings → AI → MCP Servers → Add Remote Server; Zed prompts you to sign in.

File: `~/.config/zed/settings.json`

```json
{
  "context_servers": {
    "agilehero": {
      "url": "https://mcp.agilehero.io/mcp"
    }
  }
}
```
- Leave headers out — Zed starts the sign-in only when no Authorization header is configured.

**Verify:** Restart Zed, approve the sign-in in your browser when asked, and ask it to list your AgileHero projects — the first successful call confirms the connection.

### GitHub Copilot CLI

Add to ~/.copilot/mcp-config.json, or .mcp.json inside a repository.

File: `~/.copilot/mcp-config.json`

```json
{
  "mcpServers": {
    "agilehero": {
      "type": "http",
      "url": "https://mcp.agilehero.io/mcp"
    }
  }
}
```
- Needs GitHub Copilot CLI 1.0.83 or newer (Client ID Metadata Document support).
- Copilot CLI opens the sign-in when the server first asks for it; you can also run `/mcp auth agilehero` inside a session.

**Verify:** Run `/mcp` inside Copilot CLI — agilehero should be listed as connected with its tools.

### Claude (web, desktop, Cowork)

Add AgileHero as a custom connector and sign in; the connector is available in Claude on the web, Claude Desktop, Cowork, and the mobile apps.

```text
Settings → Connectors → Add custom connector
Name: AgileHero
URL: https://mcp.agilehero.io/mcp
Sign in now
```
- The connector also appears in Claude Code when it is signed in with the same Claude account.
- Free plan: one custom connector. Team and Enterprise: an Owner adds the connector, and every member signs in with their own AgileHero account.

**Verify:** Start a new chat — AgileHero is listed under connectors, and asking Claude to list your AgileHero projects works.

### ChatGPT

Create a connector in Developer mode and sign in with OAuth.

```text
Settings → Connectors → Create (Developer mode)
Name: AgileHero
MCP server URL: https://mcp.agilehero.io/mcp
Authentication: OAuth
```
- Available on Plus, Pro, Business, Enterprise and Edu with Developer mode enabled; in a workspace an admin or owner publishes the connector for members.

**Verify:** Open a new chat with the AgileHero connector enabled and ask ChatGPT to list your AgileHero projects.

### Other client

Any MCP client that supports OAuth with Client ID Metadata Documents: add the endpoint as a remote (Streamable HTTP) server and approve the sign-in in your browser.

```text
Transport: Streamable HTTP
URL: https://mcp.agilehero.io/mcp
Authentication: OAuth (sign in when the client asks)
```
- Clients that only support static tokens or headers cannot connect — AgileHero uses OAuth sign-in only.

**Verify:** Restart the client, approve the sign-in in your browser when asked, and ask it to list your AgileHero projects — the first successful call confirms the connection.

## Not supported yet

These clients cannot complete the sign-in because they do not implement Client ID
Metadata Documents, or they do not support remote MCP servers at all.

- **Cursor** — Cursor does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **OpenCode** — OpenCode does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **Gemini CLI** — Gemini CLI does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **Cline** — Cline does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **Google Antigravity** — Google Antigravity does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **Amp** — Amp does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **Raycast AI** — Raycast AI does not support Client ID Metadata Documents yet (its OAuth sign-in needs Dynamic Client Registration or a pre-registered client), so it cannot connect to AgileHero for now.
- **Kiro** — Kiro signs in with a Client ID Metadata Document URL that you supply, and AgileHero does not host a Client ID Metadata Document for it yet.
- **Warp** — Warp has no OAuth sign-in for user-added servers yet, so it cannot connect to AgileHero for now.
- **JetBrains AI Assistant** — JetBrains AI Assistant has no OAuth sign-in for remote servers, and the mcp-remote bridge would need a hosted client document — AgileHero does not host a Client ID Metadata Document for it yet.
- **Continue** — Continue has no OAuth sign-in for Streamable HTTP servers, and the mcp-remote bridge would need a hosted client document — AgileHero does not host a Client ID Metadata Document for it yet.
