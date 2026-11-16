# Quickstart

Five minutes, one container, SQLite on a volume. You will run Angelia, give it a watch, and read what it knows
through the API.

**You need:** Docker with Compose, `git`.

## 1. Get the compose file

```sh
git clone --depth 1 https://github.com/angelia-dev/angelia.git
cd angelia/deploy/compose/sqlite
```

The folder holds three files: `compose.yaml` (one `angelia` service, loopback only), `angelia.yaml` (the
[instance configuration](../reference/configuration.md)) and `watches.yaml` (the [watch file](../reference/watch-file.md)).

## 2. Make the first admin token

The REST API, the CLI client and MCP take a bearer token. Make one before the first start; Angelia stores it as
the admin token `bootstrap`:

```sh
docker run --rm ghcr.io/angelia-dev/angelia:0.2.0 token generate > bootstrap-token
chmod 0644 bootstrap-token     # the container user (uid 65532) must read it
```

## 3. Say what to watch

Replace `watches.yaml` with something you care about:

```yaml title="watches.yaml"
version: 1
watches:
  - name: requests
    source: pypi
    coordinates: { name: requests }
    interval: 1h
  - name: home-assistant
    source: github-release
    coordinates: { repo: home-assistant/core }
    scheme: calver
    interval: 30m
```

## 4. Start it

```sh
docker compose up -d
docker compose ps            # "healthy" after the first probe
curl -s http://127.0.0.1:8080/healthz
```

On its first check Angelia records the versions that exist today as the **baseline**, without events. From now
on, every new version becomes one event.

## 5. Ask it what it knows

```sh
export ANGELIA_TOKEN=$(cat bootstrap-token)
curl -s -H "Authorization: Bearer $ANGELIA_TOKEN" http://127.0.0.1:8080/v1/watches | jq '.items[].name'
curl -s -H "Authorization: Bearer $ANGELIA_TOKEN" \
  "http://127.0.0.1:8080/v1/watches/home-assistant/versions?limit=3" | jq '.items[].version'
```

## Next

- Deliver the events somewhere: [Notify](../notify/index.md).
- Run it for real, as a verified binary under systemd: [Install](install.md).
- Give an agent access: [MCP](../notify/mcp.md).
- Once you have a named admin token, revoke `bootstrap`: `angelia token revoke bootstrap`.
