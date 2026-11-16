# Webhooks

The `webhook` sink POSTs the [release event](../concepts/release-event.md) to an HTTPS endpoint, signed with
[Standard Webhooks](https://www.standardwebhooks.com/). It is the universal adapter: CI servers, workflow tools
such as n8n or Node-RED, serverless functions, your own service.

```yaml
sinks:
  - name: ci-webhook
    kind: webhook
    config:
      url: https://ci.example.com/hooks/angelia
      secret_env: CI_WEBHOOK_SECRET      # or secret_ref: a stored secret
      timeout: 10s
```

```sh
angelia webhook secret new         # whsec_..., give it to both sides
```

## What the receiver gets

| Header | Value |
|---|---|
| `Content-Type` | `application/cloudevents+json; charset=utf-8`, or your template's type |
| `webhook-id` | `<event id>:<subscription id>`, identical on every retry and replay |
| `webhook-timestamp` | Unix seconds of this attempt |
| `webhook-signature` | `v1,<base64 HMAC-SHA256>`, one per active secret |

The body is the CloudEvent, or the subscription's [template](../concepts/templates.md).

## Receiving it

=== "Python"

    ```python
    from standardwebhooks.webhooks import Webhook   # pip install standardwebhooks

    wh = Webhook(os.environ["CI_WEBHOOK_SECRET"])
    event = wh.verify(raw_body, request.headers)     # raises on a bad signature
    print(event["data"]["package"], event["data"]["version"])
    ```

=== "Node.js"

    ```js
    import { Webhook } from "standardwebhooks";      // npm i standardwebhooks

    const wh = new Webhook(process.env.CI_WEBHOOK_SECRET);
    const event = wh.verify(rawBody, req.headers);
    console.log(event.data.package, event.data.version);
    ```

=== "Go"

    ```go
    wh, _ := standardwebhooks.NewWebhook(os.Getenv("CI_WEBHOOK_SECRET"))
    if err := wh.Verify(body, r.Header); err != nil {
        http.Error(w, "bad signature", http.StatusUnauthorized)
        return
    }
    ```

=== "Standard library only"

    The 30-line Python receiver in [Your first event](../get-started/first-event.md#4-run-a-receiver-that-verifies-the-signature).

Rules for receivers:

- **Require a signature.** Reject unsigned requests: if someone removes the secret, only a strict receiver notices.
- **Pass the raw body** to the verifier, before parsing JSON.
- **Deduplicate on `webhook-id`.**
- **Answer `2xx` fast**, do the work later. Answer `503` to have Angelia retry; `401` and other `4xx` are final.
  Never redirect.

## Rotating the secret

The variable can hold up to three secrets separated by spaces. Add the new one on both sides, wait for in-flight
retries, then drop the old one.

```sh
CI_WEBHOOK_SECRET="whsec_new... whsec_old..."
```

## Example: trigger a Jenkins or Drone job

Point the sink at the CI's generic webhook trigger and let a small template shape the body:

```yaml
subscriptions:
  - name: deps-to-jenkins
    sink: ci-webhook
    filter: { labels: { team: platform } }
    template: |
      {"package": {{toJSON .data.package}}, "version": {{toJSON .data.version}},
       "bump": {{toJSON .data.bump}}, "event": {{toJSON .id}}}
```
