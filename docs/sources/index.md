# Watch sources

A **watch** names one upstream object, how often to look, and a [policy](../concepts/policies.md). Sources only
list versions; diffing and filtering happen in the core, so every source behaves the same way.

| `source` | Watches | Coordinates | Default scheme |
|---|---|---|---|
| [`pypi`](pypi.md) | a Python package | `name` | `pep440` |
| [`npm`](npm.md) | an npm package, scoped or not | `name` | `semver` |
| [`crates`](crates.md) | a Rust crate | `name` | `semver` |
| [`github-release`](github.md) | the releases of a GitHub repository | `repo: owner/name` | `semver` |
| [`github-tag`](github.md#tags) | the tags of a GitHub repository | `repo: owner/name` | `semver` (lenient) |
| [`gitlab-release`](gitlab.md) | the releases of a GitLab project | `project` | `semver` |

Any of them can point at a [private registry or mirror](private-registries.md).

## The shape of a watch

```yaml
watches:
  - name: fastapi              # stable key: [a-z0-9][a-z0-9._-]*
    source: pypi
    coordinates: { name: fastapi }
    interval: 30m              # 5m to 720h, default 1h
    scheme: pep440             # optional override
    labels:                    # free routing keys for subscriptions
      team: backend
    policy:
      prerelease: none
      cooldown: 48h
```

## Three ways to add one

=== "Watch file"

    Add it to the watch file and restart `angelia serve --watches`. The file is reconciled on startup: entries are
    created, updated or deleted by name, in one transaction.

=== "CLI"

    ```sh
    angelia apply -f watches.yaml           # idempotent, through the API
    angelia watch list
    ```

=== "REST API"

    ```sh
    curl -X PUT -H "Authorization: Bearer $ANGELIA_TOKEN" -H "Content-Type: application/json" \
      http://127.0.0.1:8080/v1/watches/fastapi \
      -d '{"source":"pypi","coordinates":{"name":"fastapi"},"interval":"30m"}'
    ```

=== "An AI agent (MCP)"

    The `add_watch` tool takes the same keys. Give the agent a `write` token. See [MCP](../notify/mcp.md).

## Rate limits and coalescing

Each upstream host has its own token bucket, conditional requests are cached per target, and watches on the same
object share one fetch. For GitHub, give Angelia a token so it gets 5,000 requests an hour instead of 60
(see [GitHub](github.md#authentication)).
