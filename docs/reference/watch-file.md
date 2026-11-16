# Watch file

One YAML document with `version: 1` and three lists. Angelia reconciles it by **name**: entries are created,
updated or deleted in one transaction, all-or-nothing, and every error is reported as `file: line N: path: message`.

```yaml
version: 1          # required; an empty file without it is an error, not "delete everything"
sinks: []           # where to deliver
watches: []         # what to look at
subscriptions: []   # which events go where
```

## `watches[]`

| Key | Required | Default | Notes |
|---|---|---|---|
| `name` | yes | | `^[a-z0-9][a-z0-9._-]{0,62}$` |
| `source` | yes | | a source kind, or a named source instance |
| `coordinates` | yes | | `name` (pypi, npm, crates), `repo` (github-*), `project` (gitlab-release) |
| `interval` | | `1h` | `5m` to `720h` |
| `scheme` | | by source | `semver`, `pep440`, `calver`, `lexical` |
| `labels` | | `{}` | at most 32 |
| `policy` | | defaults | [Policies](../concepts/policies.md) |

## `sinks[]`

| `kind` | Keys |
|---|---|
| `webhook` | `url`, `secret_env` or `secret_ref`, `timeout` |
| `github-dispatch` | `repo`, `token_env` or `token_ref`, `mode`, `event_type`, `workflow`, `ref`, `inputs`, `api_base_url`, `timeout` |
| `shoutrrr` | `url_env` or `url_ref`, `service`, `timeout` |

## `subscriptions[]`

| Key | Required | Notes |
|---|---|---|
| `name` | yes | |
| `sink` | yes | a sink of the same file |
| `filter` | | `source`, `labels`, `bump`, `package` (glob), `type` |
| `policy` | | `prerelease`, `cooldown`: can only narrow the watch's |
| `template` | | [Message templates](../concepts/templates.md) |

## Rules worth knowing

- Nothing is interpolated: `${VAR}` stays literal. Secrets are only ever referenced through `*_env` and `*_ref`.
- Values that look like tokens are rejected without being echoed.
- Changing a watch's `source` or `coordinates` resets its baseline; renaming is delete plus create.
- Deleting a subscription turns its pending deliveries into dead letters with a reason; history is kept.
- `angelia config check --watches FILE` validates everything with no database and no network.
