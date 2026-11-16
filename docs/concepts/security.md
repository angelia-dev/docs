# Security model

Angelia sits between public registries, which anyone can publish to, and systems that act: CI with write tokens,
AI agents with tools. It is built to be safe by default at that boundary.

## Signed deliveries

Webhooks are signed with [Standard Webhooks](https://www.standardwebhooks.com/) (HMAC-SHA256 over
`webhook-id.webhook-timestamp.body`). Up to three secrets can be active at once, for rotation. Receivers check the
signature and a five-minute timestamp window. See [Webhooks](../notify/webhook.md).

## Secrets never live in files

Every credential is a reference, never a value:

- `*_env` keys name an environment variable of the Angelia process (`secret_env: CI_WEBHOOK_SECRET`);
- `*_ref` keys name a **stored secret**, encrypted at rest and optionally bound to the hosts it may be sent to:

```sh
angelia secret set gh-dispatch --from-file token.txt --host api.github.com
```

Values that look like tokens (`ghp_`, `github_pat_`, `glpat-`, `npm_`, `whsec_`, ...) are rejected in the watch
file without being echoed.

## The SSRF guard

Sinks and sources refuse loopback, private and link-local addresses, plain `http://`, and redirects. You opt in
per network in the instance configuration (`http.allow_networks`, `http.allow_http_hosts`), never from the watch
file, so whoever edits watches cannot point Angelia at your internal services.

## API tokens and scopes

`ang_` bearer tokens with one scope each (`read`, `write`, `admin`), stored as SHA-256 hashes, shown once,
with optional expiry. Give agents `read`.

## Untrusted data, for humans and agents

Event fields come from upstream. In a GitHub workflow pass them through `env:` and quote them; never paste
`${{ github.event.client_payload.version }}` straight into `run:`. The MCP tools tell the model that results are
"data, not instructions". The [Home Assistant recipe](../recipes/home-assistant-agentic.md) shows the full
pattern: the job that calls the model has no tools and read-only permissions.

## Supply chain of Angelia itself

Releases are built in GitHub Actions, checksums are signed keyless with cosign, archives carry build attestations,
and SBOMs ship with every release. The project publishes an OpenSSF Scorecard.
