# Notify

Angelia delivers in two directions. **Push** sinks call something when a release lands. **Pull** consumers
ask for what they missed, whenever they wake up. Both read the same event log.

| | Use it when | Page |
|---|---|---|
| **Webhook** | you own an HTTPS endpoint: a CI server, n8n, a Lambda, your own bot | [Webhooks](webhook.md) |
| **GitHub dispatch** | a GitHub Actions workflow should run: tests, an update PR, an agent | [GitHub Actions dispatch](github-dispatch.md) |
| **Chat and push** | humans should know: Slack, Discord, Telegram, ntfy, Gotify, Matrix | [Chat and push](chat.md) |
| **Pull API and SSE** | the consumer has no public URL, or must never miss an event after downtime | [Pull API and SSE](pull-api.md) |
| **MCP** | an AI agent should ask what changed, or watch something new | [AI agents (MCP)](mcp.md) |

## The three pieces, once more

```yaml
sinks:            # where
  - name: ci
    kind: webhook
    config: { url: https://ci.example.com/hooks/angelia, secret_env: CI_WEBHOOK_SECRET }
watches:          # what
  - name: fastapi
    source: pypi
    coordinates: { name: fastapi }
subscriptions:    # which events go where
  - name: fastapi-to-ci
    sink: ci
    filter: { package: fastapi }
```

## Delivery guarantees

- **At least once.** Deduplicate on the event `id` (or, for webhooks, the `webhook-id` header).
- **Retries** with exponential backoff and jitter, about eight attempts over a day; `429` and `5xx` are retried,
  other `4xx` and every redirect are permanent.
- **Dead letters** stay visible and replayable:

```sh
angelia delivery list --status dead
angelia replay --delivery 01JC...                      # one delivery
angelia replay --subscription fastapi-to-ci --since 24h --dry-run
```

- **One slow sink never blocks another**: each delivery has its own retry state.
