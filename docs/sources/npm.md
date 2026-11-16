# npm

Watches a package on the npm registry, scoped names included. The registry's dist-tags tell Angelia which
versions are pre-releases.

```yaml
watches:
  - name: react
    source: npm
    coordinates: { name: react }
  - name: types-node
    source: npm
    coordinates: { name: "@types/node" }
    policy:
      bump: [major]
```

## Examples

=== "Next.js stable minors"

    ```yaml
    - name: next
      source: npm
      coordinates: { name: next }
      policy:
        prerelease: none
        exclude: ['-canary']
        bump: [major, minor]
    ```

=== "Your own scope, behind Verdaccio"

    ```yaml
    # angelia.yaml (instance)
    sources:
      npm-internal:
        kind: npm
        base_url: https://npm.internal.example.com
        token_env: NPM_INTERNAL_TOKEN
    ```

    ```yaml
    # watches.yaml
    - name: design-system
      source: npm-internal
      coordinates: { name: "@acme/design-system" }
    ```
