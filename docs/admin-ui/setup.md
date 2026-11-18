# Set up the admin UI

The UI is off by default. Turning it on takes four things: a public `https://` address, a sign-in provider,
an access list, and the `ui:` section in the instance configuration (`angelia.yaml`). It needs v0.3.0 or later.

## 1. Give the instance an https address

Angelia serves plain HTTP on its `listen` address (`:8080` by default). Put a reverse proxy in front of it that
holds the certificate: Traefik, Caddy, nginx, or your platform's proxy (Coolify, Kubernetes ingress). The UI's
session cookie is `Secure`, so the address people open must be `https://`.

The UI lives under `/ui/` on that address, and `/` redirects to it once the UI is on.

## 2. Register a GitHub OAuth App

Do this once per instance, in **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**:

| Field | Value |
|---|---|
| Application name | anything, such as `Angelia (homelab)` |
| Homepage URL | your public URL, `https://angelia.example.com` |
| Authorization callback URL | `https://angelia.example.com/ui/auth/callback/github`, exactly: same scheme and host, no trailing slash |

Copy the **Client ID**, then **Generate a new client secret** and copy it now: GitHub shows it once. Angelia
asks GitHub for no scope; it reads the public profile and drops the token.

Prefer your own identity provider? Use OpenID Connect instead of, or next to, GitHub: see
[OpenID Connect](#openid-connect) below.

## 3. Write the `ui:` section

```yaml title="angelia.yaml (excerpt)"
ui:
  enabled: true
  public_url: https://angelia.example.com        # the URL people open; no path
  github:
    client_id: Ov23liEXAMPLE                     # from the OAuth App
    client_secret_env: ANGELIA_UI_GITHUB_CLIENT_SECRET   # the variable's name, never the secret
  access:
    - github_id: 583231        # a numeric GitHub account id (preferred: it never changes)
      role: admin
    - github_user: octocat     # a login, pinned to its account id at the first sign-in
      role: viewer
```

- **The client secret** is never written in the file. `client_secret_env` names an environment variable of the
  Angelia process; `client_secret_file` names a file of one line (mode `0600`). An inline `client_secret` is
  refused, even with the UI off.
- **`access`** must hold at least one `admin`. Find a numeric id at `https://api.github.com/users/<login>`
  (the `id` field). Anyone not in the list who signs in sees "Not authorised".
- **Sessions** end after 12 hours idle or 7 days in all by default (`ui.session.idle_timeout`,
  `ui.session.max_lifetime`).

Then give the process the secret and check the file before restarting:

```sh
export ANGELIA_UI_GITHUB_CLIENT_SECRET=...      # or set it in your platform's secret store
angelia config check --config angelia.yaml
```

`config check` names any key it refuses and never prints a secret.

## 4. Restart and sign in

Open `https://angelia.example.com/ui/`, choose **Sign in with GitHub**, approve the app once, and you land on
the [Overview](index.md#overview-the-sorting-rack). Your role is shown next to your login, top right.

The access list is read once, at start: after editing it, restart Angelia. Open sessions follow the new list at
their next request.

## Deploy notes

=== "Docker Compose"

    Add the secret to `.env` next to `compose.yaml`, pass it to the container, and keep the port on loopback
    for the proxy on the same host:

    ```yaml title="compose.yaml (excerpt)"
    services:
      angelia:
        image: ghcr.io/angelia-dev/angelia:0.3.0
        environment:
          ANGELIA_UI_GITHUB_CLIENT_SECRET: ${ANGELIA_UI_GITHUB_CLIENT_SECRET:?set it in .env}
        ports:
          - "127.0.0.1:8080:8080"
    ```

=== "Coolify"

    1. Set the service's domain to `https://angelia.example.com`, forwarded to port `8080`. Coolify's proxy
       obtains the certificate.
    2. Add `ANGELIA_UI_GITHUB_CLIENT_SECRET` as an environment variable, marked secret.
    3. Put the `ui:` section in the mounted `angelia.yaml` and redeploy.
    4. Keep the persistent volume on `/var/lib/angelia`: sessions and sign-in pins live in the database.

=== "Kubernetes"

    Mount the client secret from a Secret as a file and point `client_secret_file` at it; route the ingress
    host to the `api` role's port. With several replicas, sessions work on all of them: each request reads the
    session from the shared database.

## OpenID Connect

Each provider in `ui.oidc` gets a sign-in button and a callback, `<public_url>/ui/auth/callback/<name>`, to
register as the redirect URI of a confidential client at the provider.

```yaml title="angelia.yaml (excerpt)"
ui:
  enabled: true
  public_url: https://angelia.example.com
  oidc:
    - name: authentik                     # lower-case letters, digits, hyphens; not "github"
      display_name: Company SSO           # the button's label
      issuer: https://auth.example.com/application/o/angelia/
      client_id: angelia
      client_secret_env: ANGELIA_UI_OIDC_SECRET
  access:
    - provider: authentik
      subject: 5f1c0a7e-8a3b-4c3e-9d70-2b1f0c9e1a11   # the ID token's sub (preferred)
      role: admin
    - provider: authentik
      email: alice@example.com           # a verified email, pinned to its sub at the first sign-in
      role: editor
```

| Provider | `issuer` |
|---|---|
| Authentik | `https://HOST/application/o/<application slug>/` (with the trailing slash) |
| Keycloak | `https://HOST/realms/<realm>` |
| GitLab | `https://gitlab.com` or your instance; the application needs `openid`, `email`, `profile` |
| Google | `https://accounts.google.com` |

## When it does not work

| You see | Check |
|---|---|
| GitHub reports a callback URL error | The OAuth App's callback must equal `<public_url>/ui/auth/callback/github` exactly. |
| "Sign-in failed: the identity provider could not confirm who you are" | The client id and secret; the `WARN` line in the log. |
| "Not authorised" | The account is not in `ui.access`, its login is pinned to another account, or Angelia was not restarted after the change. |
| The sign-in does not stick, or actions fail with `403 csrf` | `public_url` must be the exact `https://` URL the browser opens. |
| `/ui/` answers 404 | `ui.enabled` is false, or the instance is older than v0.3.0. |

---

Source: angelia-dev/angelia [ADR 0033](https://github.com/angelia-dev/angelia/blob/main/docs/adr/0033-admin-web-ui.md),
[ADR 0034](https://github.com/angelia-dev/angelia/blob/main/docs/adr/0034-generic-oidc-sign-in.md) and
[docs/admin-ui.md](https://github.com/angelia-dev/angelia/blob/main/docs/admin-ui.md).
