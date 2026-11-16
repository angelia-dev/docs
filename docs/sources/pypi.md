# PyPI

Watches a package on the [Python Package Index](https://pypi.org) through its JSON API. Versions are compared
with **PEP 440**, so `2.0rc1`, `1.0.post1` and `3.0.dev2` sort correctly, and yanked releases are reported as
`release.yanked` events.

```yaml
watches:
  - name: requests
    source: pypi
    coordinates: { name: requests }   # any spelling: Requests, requests, re_quests normalise to one target
    interval: 1h
```

## Examples

=== "Django security line"

    ```yaml
    - name: django-4-2
      source: pypi
      coordinates: { name: django }
      policy:
        constraint: ">=4.2 <4.3"
        bump: [patch]
    ```

=== "Pydantic pre-releases for CI"

    ```yaml
    - name: pydantic-next
      source: pypi
      coordinates: { name: pydantic }
      interval: 30m
      policy:
        prerelease: only
    ```

=== "Home Assistant on PyPI"

    ```yaml
    - name: homeassistant-pypi
      source: pypi
      coordinates: { name: homeassistant }
      policy:
        prerelease: include
    ```

Private indexes (Artifactory, Nexus, devpi, pypiserver): see [Private registries](private-registries.md).
