# Chat digest of major releases

Your team wants to hear about **major** versions of the libraries it depends on, once they have survived a few
days, in one channel. Nobody wants patch noise.

```yaml title="watches.yaml"
version: 1

sinks:
  - name: team-slack
    kind: shoutrrr
    config: { url_ref: slack-releases, service: slack }

watches:
  - { name: django,     source: pypi,   coordinates: { name: django },     labels: { team: backend } }
  - { name: sqlalchemy, source: pypi,   coordinates: { name: sqlalchemy }, labels: { team: backend } }
  - { name: react,      source: npm,    coordinates: { name: react },      labels: { team: web } }
  - { name: vite,       source: npm,    coordinates: { name: vite },       labels: { team: web } }
  - { name: tokio,      source: crates, coordinates: { name: tokio },      labels: { team: platform } }

subscriptions:
  - name: majors-to-slack
    sink: team-slack
    filter:
      bump: [major]
    policy:
      prerelease: none
      cooldown: 72h          # held three days; dropped if yanked meanwhile
    template: |
      {{index .data.watch.labels "team" | default "all" | upper}}: {{.data.package}} {{.data.version}} (from {{.data.previous_version | default "new"}}) {{with .data.urls.release}}{{.}}{{end}}
```

```sh
angelia secret set slack-releases --from-file slack-url.txt --host hooks.slack.com
angelia config check --watches watches.yaml
```

Swap the sink for Discord, Telegram, ntfy, Gotify or Matrix by changing the URL; see [Chat and push](../notify/chat.md).
