# Command line

`angelia` is both the server and a client of its own API.

## Server side

| Command | Does |
|---|---|
| `angelia serve --config C --watches W` | runs the roles; applies the watch file at startup |
| `angelia config check --config C --watches W` | validates both files, no database, no network |
| `angelia token create --local --name me` | makes an admin token directly in the database |
| `angelia token generate --out FILE` | makes a bootstrap token file |
| `angelia secrets ...` | manages the stored-secrets key |
| `angelia webhook secret new` | prints a new `whsec_` signing secret |
| `angelia healthcheck` | probes `/healthz` (the container's health check) |
| `angelia version` | version, commit, build date |

## Client side

All need `--server` (or `ANGELIA_SERVER`, or `~/.config/angelia/config.yaml`) and a token in `ANGELIA_TOKEN`
or that file.

| Command | Does |
|---|---|
| `angelia apply -f watches.yaml [--prune]` | idempotent create and update through the API (GitOps) |
| `angelia watch list / get / put / delete / versions` | watches and their known versions |
| `angelia sink ...`, `angelia sub ...` | sinks, subscriptions |
| `angelia event list --after N`, `event stream` | pull and follow events |
| `angelia delivery list --status dead` | the dead-letter view |
| `angelia replay --delivery ID` / `--event ID` / `--subscription S --since 24h` | queue deliveries again |
| `angelia secret set / list / delete` | stored secrets (values are write-only) |
| `angelia token create / list / revoke` | API tokens |
| `angelia mcp` | MCP on stdio for an agent host |

Every list takes `-o json`. Shell completion: `angelia completion bash|zsh|fish`.
