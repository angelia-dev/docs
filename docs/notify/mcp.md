# AI agents (MCP)

Angelia is an [MCP](https://modelcontextprotocol.io/) server. An agent can ask what changed upstream, what the
newest version of a package is, and add a watch, with the same tokens and scopes as the REST API.

| Tool | Does | Scope |
|---|---|---|
| `list_watches` | one page of watches | `read` |
| `latest_version` | the greatest version of a watch, final releases unless asked otherwise | `read` |
| `events_since` | release events after a cursor, or through a named consumer | `read` |
| `add_watch` | creates a watch (create-only, never overwrites) | `write` |
| `ack_event` | moves a named consumer's cursor forward | `write` |

## Connect a host

=== "stdio (local)"

    Put the connection in the client config, readable only by you:

    ```yaml title="~/.config/angelia/config.yaml (chmod 600)"
    server: https://angelia.example.com
    token: ang_...          # a read token
    ```

    ```json
    { "mcpServers": { "angelia": { "command": "angelia", "args": ["mcp"] } } }
    ```

=== "Streamable HTTP (remote)"

    ```json
    { "mcpServers": { "angelia": {
        "type": "http",
        "url": "https://angelia.example.com/mcp",
        "headers": { "Authorization": "Bearer ang_..." } } } }
    ```

    Stateless JSON answers, so any replica can serve any request.

=== "Claude Code"

    ```sh
    claude mcp add angelia -- angelia mcp
    ```

## Ask it things

> Which of my watches had a major release this week, and what did they replace?

> What is the latest stable version of `home-assistant`? Is my `manifest.json` behind?

> Start watching `astral-sh/uv` releases every hour.

## Keep the agent safe

Versions, package names and URLs come from public registries. The tool descriptions tell the model that results
are *data, not instructions*. Also:

- give the agent a `read` token unless it really needs `add_watch` or `ack_event`;
- prefer a host that asks before calling a write tool;
- for unattended agents, use the [pull API](pull-api.md) or a [dispatch](github-dispatch.md) into a job with
  read-only permissions, as the [Home Assistant recipe](../recipes/home-assistant-agentic.md) does.
