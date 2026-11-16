# Private registries

Any source kind can point at a mirror or a private registry: Artifactory, Nexus, Verdaccio, devpi, pypiserver,
GitHub Enterprise, self-managed GitLab. The registry belongs to the **instance configuration**, never to a watch,
so whoever edits watches cannot redirect credentials.

## One registry of a kind

```yaml title="angelia.yaml"
sources:
  pypi:
    base_url: https://artifactory.example.com/api/pypi/pypi-remote
    auth:
      type: basic
      username: angelia
      password_ref: artifactory-password     # a stored secret
```

```sh
angelia secret set artifactory-password --from-file pw.txt --host artifactory.example.com
```

## Several registries of one kind

Name an instance and give it a `kind`; watches select it by name:

```yaml title="angelia.yaml"
sources:
  npm-internal:
    kind: npm
    base_url: https://npm.internal.example.com
    token_env: NPM_INTERNAL_TOKEN
```

```yaml title="watches.yaml"
- name: design-system
  source: npm-internal
  coordinates: { name: "@acme/design-system" }
```

## Simple-API-only Python indexes

pypiserver and some proxies only speak the Simple API (PEP 503 / PEP 691):

```yaml
sources:
  pypi-local:
    kind: pypi
    api: simple
    base_url: https://pypi.internal.example.com/simple
```

Private addresses need `http.allow_networks`; a custom CA goes in `http.ca_file`. Full details:
[private-registries.md](https://github.com/angelia-dev/angelia/blob/main/docs/private-registries.md).
