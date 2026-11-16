# Your first event

A webhook sink, one watch, one subscription, and a 30-line receiver that checks the signature. By the end you
will have seen a signed CloudEvent arrive.

## 1. Make a signing secret

```sh
angelia webhook secret new
# whsec_3q2+7w...=
```

It is printed once and stored nowhere. Keep it in an environment variable of the Angelia process and give the
same value to the receiver. It never goes into a file Angelia reads.

## 2. Describe the wiring

```yaml title="watches.yaml"
version: 1

sinks:
  - name: my-webhook
    kind: webhook
    config:
      url: http://127.0.0.1:9000/hook
      secret_env: MY_WEBHOOK_SECRET   # the name of the variable, never the value

watches:
  - name: requests
    source: pypi
    coordinates: { name: requests }
    interval: 1h

subscriptions:
  - name: requests-to-my-webhook
    sink: my-webhook
```

A subscription without a `filter` receives every event of every watch.

## 3. Allow the local receiver, for this test only

Angelia refuses to call loopback or private addresses (its SSRF guard) and plain `http://`. Real receivers use
`https://` on a public name and need nothing. For a local test, allow the one address in the instance
configuration:

```yaml title="angelia.yaml"
http:
  allow_networks: ["127.0.0.1/32"]
  allow_http_hosts: ["127.0.0.1"]
```

!!! warning "Remove it afterwards"
    `allow_networks: 127.0.0.1/32` lets every sink and source reach every loopback service, Angelia's own API
    included. Delete the whole `http:` block once the sink points at a real `https://` receiver.

## 4. Run a receiver that verifies the signature

```python title="receiver.py"
import base64, hashlib, hmac, json, os, time
from http.server import BaseHTTPRequestHandler, HTTPServer

SECRETS = [base64.b64decode(v.removeprefix("whsec_")) for v in os.environ["MY_WEBHOOK_SECRET"].split()]

class Hook(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        msg_id, ts = self.headers.get("webhook-id", ""), self.headers.get("webhook-timestamp", "")
        signed = f"{msg_id}.{ts}.".encode() + body
        wants = [base64.b64encode(hmac.new(k, signed, hashlib.sha256).digest()).decode() for k in SECRETS]
        given = [s.removeprefix("v1,") for s in self.headers.get("webhook-signature", "").split() if s.startswith("v1,")]
        fresh = ts.isdigit() and abs(time.time() - int(ts)) <= 300
        ok = fresh and any(hmac.compare_digest(w, g) for w in wants for g in given)
        print("signature", "OK" if ok else "INVALID", msg_id, flush=True)
        if ok:
            print(json.dumps(json.loads(body), indent=2), flush=True)
        self.send_response(204 if ok else 503)   # 503: Angelia retries; a 401 would be final
        self.end_headers()

HTTPServer(("127.0.0.1", 9000), Hook).serve_forever()
```

```sh
export MY_WEBHOOK_SECRET=whsec_...     # the value from step 1
python3 receiver.py
```

## 5. Start Angelia with the same secret

```sh
export MY_WEBHOOK_SECRET=whsec_...
angelia serve --config angelia.yaml --watches watches.yaml
```

## 6. Wait for a release, or see it now

The first check only records the existing versions. The first event is the next new version, which for a busy
package is hours away. To see the whole path without waiting, run the repository's end-to-end check, which
uses a fake registry:

```sh
git clone --depth 1 https://github.com/angelia-dev/angelia.git && cd angelia
deploy/compose/ci/run.sh
```

When a release lands, the receiver prints `signature OK` and the [release event](../concepts/release-event.md).
A delivery that fails is retried with backoff, then kept as a dead letter you can [replay](../reference/cli.md).
