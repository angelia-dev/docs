# Recipes

Complete, copy-paste setups for real jobs. Each one is a watch file plus whatever sits on the other end.

| Recipe | Sources | Sinks |
|---|---|---|
| [Home Assistant to an agentic PR](home-assistant-agentic.md) | GitHub releases | GitHub dispatch, then Claude in GitHub Actions |
| [Chat digest of major releases](chat-majors.md) | PyPI, npm, crates | Slack, Discord, ntfy |
| [Test against every pre-release](prerelease-ci.md) | PyPI, npm | GitHub `workflow_dispatch` |
| [An agent that reads the wire](agent-wire.md) | any | MCP, pull API |
