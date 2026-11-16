# Subscriptions and filters

A subscription connects events to one sink. Without a filter it receives every event of every watch.

```yaml
subscriptions:
  - name: platform-to-ci
    sink: ci-webhook
    filter:
      labels: { team: platform }

  - name: web-majors-to-chat
    sink: team-chat
    filter:
      source: [npm, github-release]
      bump: [major, minor]
      package: "re*"
    policy:
      prerelease: none
      cooldown: 72h
    template: |
      {{.data.package}} {{.data.version}} is out{{with .data.previous_version}} (was {{.}}){{end}}
```

## Filter keys

All given keys must match.

| Key | Matches |
|---|---|
| `source` | the source kind: `pypi`, `npm`, `crates`, `github-release`, `github-tag`, `gitlab-release` |
| `labels` | the watch carries all these labels with equal values |
| `bump` | `major`, `minor`, `patch` |
| `package` | a glob on the package name (`@types/*`, `re*`) |
| `type` | `release.published` (default), `release.prerelease`, `release.yanked` |

## A subscription can only narrow

A subscription receives what its watch's policy admitted, then applies its own rules. It can receive less,
and later, never more.

| Key | Effect |
|---|---|
| `filter.bump` | must pass the watch's `bump` **and** this one |
| `policy.prerelease` | intersected with what the watch admitted |
| `policy.cooldown` | counted from the same start as the watch's: the hold is the longer of the two |

This is how one watch serves two consumers well: CI wants every patch now, chat wants minors after three days.

## Labels are the routing key

Put ownership on watches, route on labels:

```yaml
watches:
  - name: django
    source: pypi
    coordinates: { name: django }
    labels: { team: backend, tier: critical }
subscriptions:
  - name: backend-critical-pager
    sink: ntfy-oncall
    filter:
      labels: { team: backend, tier: critical }
      bump: [major, minor]
```
