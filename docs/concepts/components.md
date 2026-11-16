# Components

Angelia is **one binary with several roles**. A homelab runs all of them in one process; a larger install
runs more replicas of the busy ones against Postgres. The internal boundaries are Go packages, not network hops,
so there is no broker to run.

```sh
angelia serve --roles=all                       # the default
angelia serve --roles=api                       # one process per role, on Postgres
angelia serve --roles=scheduler,dispatcher
```

## The roles

API
:   The REST API (`/v1/`), the SSE event stream and the MCP endpoint, all behind bearer tokens. It also applies
    the watch file at startup. Contract-first: the [OpenAPI document](https://github.com/angelia-dev/spec) is the
    source of truth, and the CLI is a client of it.

Scheduler
:   Every target has a `next_check_at`. The scheduler leases due targets from the database and asks the source
    for its versions, with per-host rate limits, jitter, backoff and conditional requests (an `ETag` answered
    `304` costs almost nothing). Fifty watches on `pypi:requests` mean **one** fetch: watches share a target.

Diff and policy engine
:   Compares the fetched versions with the known set, so it catches *every* new version, including a backport
    such as `1.9.4` released after `2.0.0`. Parses each version with its scheme (SemVer, PEP 440, calver,
    lexical), computes the bump, applies the [policy](policies.md), and writes the event and one delivery per
    matching subscription **in the same transaction**.

Dispatcher
:   Leases due deliveries and hands them to sinks. At-least-once, exponential backoff with jitter (eight
    attempts over about a day), then a dead letter you can inspect and [replay](../reference/cli.md).
    Each delivery carries the idempotency key `<event id>:<subscription id>`.

## Sources and sinks

Sources are deliberately dumb: they list raw upstream versions and an opaque fetch state. Everything clever
(diffing, parsing, filtering, cooldown) happens once, in the core, the same way for every ecosystem.

| Built in today | |
|---|---|
| Sources | `pypi`, `npm`, `crates`, `github-release`, `github-tag`, `gitlab-release`, and any of them pointed at a [private registry](../sources/private-registries.md) |
| Sinks | `webhook`, `github-dispatch`, `shoutrrr` (Slack, Discord, Telegram, ntfy, Gotify, Matrix) |
| Pull | `GET /v1/events` with consumer cursors, `GET /v1/events/stream` (SSE), MCP |

!!! info "Planned, not shipped"
    OCI images, Maven, the Go module proxy, generic HTTP JSON and regex sources, NATS and MQTT sinks, and
    third-party plugins (WASM) are on the roadmap in the
    [architecture document](https://github.com/angelia-dev/angelia/blob/main/docs/architecture.md). They do
    not exist in v0.2.0.

## Storage

| Store | When |
|---|---|
| SQLite | the default: one process, one file, nothing to run |
| Postgres | several replicas: scheduler and dispatcher lease with `FOR UPDATE SKIP LOCKED` |

The event log is append-only. Events and deliveries are separate rows: one event, many deliveries, each with its
own retry state, so a slow chat service never delays your CI.

## Observability

`/healthz` and `/readyz` for probes, Prometheus metrics at `/metrics` on the same port, JSON logs by default,
and OpenTelemetry tracing. A Grafana dashboard ships in
[`deploy/grafana`](https://github.com/angelia-dev/angelia/tree/main/deploy/grafana).
