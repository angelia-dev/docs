# crates.io

Watches a Rust crate on [crates.io](https://crates.io). Yanked versions are reported as `release.yanked`.

```yaml
watches:
  - name: tokio
    source: crates
    coordinates: { name: tokio }
    interval: 2h
    policy:
      bump: [major, minor]
```

A sparse-index mirror can replace crates.io through the instance's `sources.crates.base_url`;
see [Private registries](private-registries.md).
