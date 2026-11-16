# Test against every pre-release

Find out that the next major breaks you **before** it ships: run your test suite against every release candidate
of the libraries you depend on.

```yaml title="watches.yaml"
version: 1

sinks:
  - name: compat-workflow
    kind: github-dispatch
    config:
      mode: workflow_dispatch
      repo: acme/api
      token_ref: gh-actions-token          # fine-grained, Actions: write on acme/api
      workflow: compat.yml
      ref: main
      inputs:
        package: '{{.data.package}}'
        version: '{{.data.version}}'

watches:
  - name: pydantic-pre
    source: pypi
    coordinates: { name: pydantic }
    interval: 30m
    policy: { prerelease: only }
  - name: fastapi-pre
    source: pypi
    coordinates: { name: fastapi }
    policy: { prerelease: only }

subscriptions:
  - name: pre-to-compat
    sink: compat-workflow
    filter:
      type: [release.prerelease]
```

```yaml title=".github/workflows/compat.yml"
name: compat
on:
  workflow_dispatch:
    inputs:
      package: { type: string, required: true }
      version: { type: string, required: true }
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - env:
          PACKAGE: ${{ inputs.package }}
          VERSION: ${{ inputs.version }}
        run: |
          pip install -e '.[test]' "$PACKAGE==$VERSION"
          pytest -q
```

The same workflow stays runnable by hand from the Actions tab, with the same inputs.
