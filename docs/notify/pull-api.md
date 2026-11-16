# Pull API and SSE

Not every consumer has a public URL. A laptop script, a CI job that runs once a night, an agent inside a private
network: they **pull**. Every event has a monotonic sequence number (`seq`), so a consumer that was down for a
week resumes exactly where it stopped, without missing or repeating anything.

All of this needs an API token; `read` is enough to read.

## Read after a cursor

```sh
curl -s -H "Authorization: Bearer $ANGELIA_TOKEN" \
  "https://angelia.example.com/v1/events?after=0&source=pypi&type=release.published&limit=50"
```

```json
{ "items": [ { "seq": 4180, "event": { "specversion": "1.0", "...": "..." } } ],
  "next_after": 4180, "has_more": false }
```

Keep `next_after` and send it as `after` next time.

## Named consumers keep the cursor for you

```sh
# create once, with a stored filter
curl -X PUT -H "Authorization: Bearer $ANGELIA_TOKEN" -H "Content-Type: application/json" \
  https://angelia.example.com/v1/consumers/nightly-bot \
  -d '{"filter": {"source": ["pypi", "npm"]}, "start": "earliest"}'

# read what is new for it
curl -s -H "Authorization: Bearer $ANGELIA_TOKEN" \
  "https://angelia.example.com/v1/events?consumer=nightly-bot"

# acknowledge what you processed (monotonic, safe to repeat)
curl -X POST -H "Authorization: Bearer $ANGELIA_TOKEN" -H "Content-Type: application/json" \
  https://angelia.example.com/v1/consumers/nightly-bot/ack -d '{"seq": 4180}'
```

Reading never moves the cursor; only `ack` does. Crash between reading and acknowledging, and you get the
events again: at-least-once, by design.

## Follow the stream

`GET /v1/events/stream` is a server-sent events stream with the same filters. The CLI reconnects and resumes on
its own:

```sh
angelia event stream --server https://angelia.example.com
angelia event list --after 4100 -o json | jq '.items[].event.subject'
```

## Example: a nightly job that upgrades what changed

```sh
#!/bin/sh -eu
EVENTS=$(curl -fsS -H "Authorization: Bearer $ANGELIA_TOKEN" "$ANGELIA/v1/events?consumer=nightly-bot")
echo "$EVENTS" | jq -r '.items[].event.data | "\(.package)==\(.version)"' | while read -r pin; do
  echo "would upgrade $pin"
done
LAST=$(echo "$EVENTS" | jq '.next_after')
curl -fsS -X POST -H "Authorization: Bearer $ANGELIA_TOKEN" -H "Content-Type: application/json" \
  "$ANGELIA/v1/consumers/nightly-bot/ack" -d "{\"seq\": $LAST}"
```
