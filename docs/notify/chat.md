# Chat and push

The `shoutrrr` sink posts a short message to a chat or push service. It speaks Slack, Discord, Telegram, ntfy,
Gotify and Matrix through the [shoutrrr](https://github.com/nicholas-fedor/shoutrrr) library.

## 1. The service URL is the secret

| Service | URL | Bind the secret to |
|---|---|---|
| Slack | `slack://hook:T000-B000-XXXX@webhook` or `slack://xoxb:TOKEN@C0123456789` | `hooks.slack.com` or `slack.com` |
| Discord | `discord://TOKEN@WEBHOOK_ID` | `discord.com` |
| Telegram | `telegram://BOT_TOKEN@telegram?chats=@channel,12345` | `api.telegram.org` |
| ntfy | `ntfy://ntfy.sh/my-topic` | `ntfy.sh` or your server |
| Gotify | `gotify://gotify.example.com/APP_TOKEN` | your server |
| Matrix | `matrix://:ACCESS_TOKEN@matrix.example.com?rooms=!room:matrix.example.com` | your server |

Store it, bound to the hosts it sends to:

```sh
angelia secret set slack-releases --from-file slack-url.txt --host hooks.slack.com
```

## 2. Declare the sink and a templated subscription

```yaml
sinks:
  - name: releases-chat
    kind: shoutrrr
    config:
      url_ref: slack-releases
      service: slack

subscriptions:
  - name: majors-to-chat
    sink: releases-chat
    filter: { bump: [major] }
    policy: { cooldown: 24h }
    template: |
      {{.data.package}} {{.data.version}} is out (was {{.data.previous_version | default "new"}}). {{with .data.urls.release}}{{.}}{{end}}
```

## 3. Check before you start

```sh
angelia config check --watches watches.yaml
```

It reads each URL the way a delivery would, sends nothing, and warns about a secret without `--host`, a plain-http
server or a URL a delivery would refuse. It never prints the URL.

## Examples

=== "ntfy push to your phone"

    ```yaml
    sinks:
      - name: phone
        kind: shoutrrr
        config: { url_env: NTFY_URL, service: ntfy }   # NTFY_URL=ntfy://ntfy.sh/my-secret-topic?priority=high
    subscriptions:
      - name: critical-to-phone
        sink: phone
        filter: { labels: { tier: critical } }
        template: "{{.data.package}} {{.data.version}}"
    ```

=== "Discord, one line per release"

    ```yaml
    template: |
      **{{.data.package}}** `{{.data.version}}`{{with .data.bump}} ({{.}}){{end}} {{with .data.urls.release}}<{{.}}>{{end}}
    ```

=== "Telegram, a team channel"

    ```yaml
    sinks:
      - name: team-telegram
        kind: shoutrrr
        config: { url_ref: telegram-team, service: telegram }
    ```

Email (SMTP) and generic URLs are refused by design: use the [webhook sink](webhook.md) for anything else.
