# Get started

Angelia watches the places your dependencies are published, notices every new version, and tells the systems
that care. It runs as one binary or one container, keeps its state in SQLite or Postgres, and needs no queue.

Three ideas carry the whole product:

Watch
:   What to look at: a package on PyPI, npm or crates.io, the releases or tags of a GitHub repository, the
    releases of a GitLab project. Each watch has an interval and a [policy](../concepts/policies.md).

Sink
:   Where to deliver: a signed [webhook](../notify/webhook.md), a [GitHub Actions dispatch](../notify/github-dispatch.md),
    or a [chat or push service](../notify/chat.md). Consumers that cannot receive a call can
    [pull](../notify/pull-api.md) instead, or ask through [MCP](../notify/mcp.md).

Subscription
:   The wire between them: which events reach which sink, with [filters](../concepts/subscriptions.md) and
    an optional [message template](../concepts/templates.md).

## Pick your path

| You want to | Go to |
|---|---|
| See it work in five minutes, with Docker | [Quickstart](quickstart.md) |
| Install a verified binary as a service | [Install](install.md) |
| Receive and verify your first signed event | [Your first event](first-event.md) |
| Add a watch, a sink and a subscription from the admin UI | [After the first install](after-install.md) |
| Watch a narrated tour first | [Video tour](videos.md) |
| Trigger an AI agent when an upstream releases | [Home Assistant to an agentic PR](../recipes/home-assistant-agentic.md) |

!!! note "Where Angelia stands"
    Angelia is pre-1.0. **v0.2.0** is the current release: push delivery (webhooks, GitHub dispatch, chat), the
    REST API with tokens, the pull API, SSE, MCP and the Postgres store all ship in it. Sources and sinks
    listed on these pages exist today; anything planned is marked as planned.
