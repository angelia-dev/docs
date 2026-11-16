# Instance configuration

The instance configuration describes one Angelia process. Every key can also be set with an `ANGELIA_*`
environment variable.

```yaml title="angelia.yaml"
instance:
  name: homelab                    # appears in event sources: angelia://homelab/watches/...
listen: ":8080"                    # API, /healthz, /readyz, /metrics, /mcp
roles: [all]                       # or api, scheduler, worker, dispatcher
database:
  dsn: sqlite:///var/lib/angelia/angelia.db    # or postgres://...
log:
  format: json                     # or text
sources:
  github-release:
    token_env: GITHUB_TOKEN        # 5,000 requests an hour instead of 60
http:
  allow_networks: []               # private ranges sinks and sources may reach (default: none)
  allow_http_hosts: []             # hosts allowed over plain http (default: none)
  ca_file: ""                      # extra CA bundle for private registries
api:
  bootstrap_token_file: ""         # first admin token for unattended installs
```

## Sections

| Section | What it controls |
|---|---|
| `instance`, `listen`, `roles` | identity, address, which roles this process runs |
| `database` | SQLite or Postgres; replicas need Postgres |
| `sources.<kind>` | `base_url`, `token_env` or `auth` for a source kind or a named instance |
| `http` | the SSRF guard's allowlists, per-host rate limits, CA bundle |
| `api` | bootstrap token, `allowed_env` for sinks created through the API |
| `secrets` | the key that encrypts stored secrets at rest |
| `tracing` | OpenTelemetry export |

## Stored secrets

```sh
angelia secrets keygen                 # on the instance, once
angelia secret set NAME --from-file f --host api.github.com
angelia secret list
```

A stored secret is encrypted at rest and can be bound to the hosts it may be sent to; a delivery to any other host
fails before anything is sent. Sinks and sources name it with a `*_ref` key.

The full list of keys, defaults and environment variables is in
[configuration.md](https://github.com/angelia-dev/angelia/blob/main/docs/configuration.md).
