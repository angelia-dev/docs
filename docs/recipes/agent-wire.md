# An agent that reads the wire

An AI agent that starts each morning by asking "what changed upstream since yesterday, and does it matter for
this repository?". It reads through a named consumer, so it never misses a day and never reads one twice.

## 1. A consumer and a token

```sh
angelia token create --name morning-agent --scope write --expires-in 90d   # write: it acknowledges
curl -X PUT -H "Authorization: Bearer $ANGELIA_TOKEN" -H "Content-Type: application/json" \
  https://angelia.example.com/v1/consumers/morning-agent \
  -d '{"filter": {"type": ["release.published"]}}'
```

## 2. Connect it

```sh
claude mcp add angelia -- angelia mcp      # reads ~/.config/angelia/config.yaml
```

## 3. The prompt

> Read new release events with `events_since` for the consumer `morning-agent`. For each package, check whether
> this repository depends on it (`pyproject.toml`, `package.json`) and at which version. Write a short table:
> package, our version, new version, bump, and whether the changelog mentions something that affects us.
> When the table is written, call `ack_event` with the last `seq`.

The agent only reads the event fields as data; the tool descriptions tell it so. If it should act on what it
finds, prefer the [dispatch pattern](home-assistant-agentic.md), where the job that runs the model has no write
access and a human approves the change.
