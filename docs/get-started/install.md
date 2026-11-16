# Install

Angelia is one static binary (Linux, macOS and Windows, amd64 and arm64) or one distroless container image.
It keeps its state in SQLite by default, or in Postgres when you run several replicas.

=== "Binary"

    Every [release](https://github.com/angelia-dev/angelia/releases) ships one archive per platform, a
    `checksums.txt`, its cosign bundle and SBOMs.

    ```sh
    TAG=v0.2.0
    VERSION=${TAG#v}
    OS=linux ARCH=amd64          # darwin / windows, arm64
    BASE=https://github.com/angelia-dev/angelia/releases/download/$TAG
    curl -fsSLO "$BASE/angelia_${VERSION}_${OS}_${ARCH}.tar.gz"
    curl -fsSLO "$BASE/checksums.txt"
    curl -fsSLO "$BASE/checksums.txt.sigstore.json"
    ```

    **Verify before you run it.** The checksums are signed keyless with cosign, and the archive carries a
    GitHub build attestation. All three checks must pass:

    ```sh
    IDENTITY="https://github.com/angelia-dev/angelia/.github/workflows/release.yml@refs/tags/${TAG}"
    cosign verify-blob --bundle checksums.txt.sigstore.json \
      --certificate-identity "$IDENTITY" \
      --certificate-oidc-issuer https://token.actions.githubusercontent.com checksums.txt
    sha256sum --ignore-missing -c checksums.txt     # macOS: shasum -a 256 -c --ignore-missing checksums.txt
    gh attestation verify "angelia_${VERSION}_${OS}_${ARCH}.tar.gz" --repo angelia-dev/angelia
    ```

    ```sh
    tar -xzf "angelia_${VERSION}_${OS}_${ARCH}.tar.gz" angelia
    sudo install -m 0755 angelia /usr/local/bin/angelia
    angelia version
    ```

=== "Container"

    The image is `ghcr.io/angelia-dev/angelia:<version>`: linux/amd64 and arm64, distroless, no shell, uid 65532.
    The repository has two Compose stacks in
    [`deploy/compose`](https://github.com/angelia-dev/angelia/tree/main/deploy/compose):

    | Stack | What it runs |
    |---|---|
    | `sqlite/` | one container, SQLite on a named volume. Start here. |
    | `full/` | Angelia with Postgres. |

    ```sh
    cd deploy/compose/sqlite
    docker run --rm ghcr.io/angelia-dev/angelia:0.2.0 token generate > bootstrap-token && chmod 0644 bootstrap-token
    docker compose up -d
    ```

    The port is published on `127.0.0.1` only. Put a reverse proxy with TLS in front before you expose it, and
    deploy by digest in production after [verifying the image](https://github.com/angelia-dev/angelia/blob/main/docs/operations/release.md#verify-a-release).

=== "Kubernetes"

    Helm charts live in [angelia-dev/helm-charts](https://github.com/angelia-dev/helm-charts). They are not
    published yet: use the container image with your own manifests until they are.

## Two files

Angelia reads two YAML files, and they never share a key.

| File | Describes | Flag |
|---|---|---|
| [Instance configuration](../reference/configuration.md) | this process: listen address, database, outgoing HTTP rules, source credentials | `--config` |
| [Watch file](../reference/watch-file.md) | the data it manages: watches, sinks, subscriptions | `--watches` |

The smallest useful pair:

```yaml title="/etc/angelia/angelia.yaml"
instance:
  name: homelab
listen: "127.0.0.1:8080"
database:
  dsn: sqlite:///var/lib/angelia/angelia.db
```

```yaml title="/etc/angelia/watches.yaml"
version: 1
watches:
  - name: requests
    source: pypi
    coordinates: { name: requests }
    interval: 1h
```

Check both without touching a database or the network, then start:

```sh
angelia config check --config /etc/angelia/angelia.yaml --watches /etc/angelia/watches.yaml
angelia serve        --config /etc/angelia/angelia.yaml --watches /etc/angelia/watches.yaml
```

`serve` reads the watch file once, at startup: edit it and restart, or manage watches through the
[API and CLI](../reference/cli.md) instead.

## Run it as a service

```ini title="/etc/systemd/system/angelia.service"
[Unit]
Description=Angelia release event bus
After=network-online.target
Wants=network-online.target

[Service]
User=angelia
Group=angelia
StateDirectory=angelia
# Signing secrets and tokens, e.g. GH_DISPATCH_TOKEN=... (mode 0600, owner root)
EnvironmentFile=-/etc/angelia/angelia.env
ExecStart=/usr/local/bin/angelia serve --config /etc/angelia/angelia.yaml --watches /etc/angelia/watches.yaml
Restart=on-failure
TimeoutStopSec=30
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```sh
sudo useradd --system --no-create-home --shell /usr/sbin/nologin angelia
sudo systemctl daemon-reload && sudo systemctl enable --now angelia
journalctl -u angelia -f
```

The full hardened unit is in the repository's
[install guide](https://github.com/angelia-dev/angelia/blob/main/docs/install.md#as-a-systemd-service).

## Your first API token

Everything under `/v1/`, the CLI client commands and MCP take a bearer token (`ang_…`) with one scope:
`read`, `write` or `admin`. Only a hash is stored, so a token is shown once.

```sh
angelia token create --local --name me --config /etc/angelia/angelia.yaml   # on the instance, prints the token
export ANGELIA_TOKEN=ang_...
angelia watch list --server http://127.0.0.1:8080
angelia token create --name ci --scope write --expires-in 90d                # more tokens, through the API
```

Give agents a `read` token (or `write` if they add watches), never `admin`.

## Postgres

Point `database.dsn` at Postgres to run several `scheduler` and `dispatcher` replicas of the same binary; they
lease work with `SELECT … FOR UPDATE SKIP LOCKED`, so no external queue is needed.

```yaml
database:
  dsn: postgres://angelia@db.internal:5432/angelia?sslmode=verify-full
```

See [Instance configuration](../reference/configuration.md) for roles and replicas.
