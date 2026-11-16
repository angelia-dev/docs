# GitHub Actions dispatch

The `github-dispatch` sink starts a GitHub Actions workflow when a release lands. It is the shortest path from
"upstream released" to "my tests run against it", and the entry point for agentic workflows that prepare an
update pull request.

Two GitHub APIs, one sink:

| `mode` | Calls | Workflow trigger |
|---|---|---|
| `repository_dispatch` (default) | `POST /repos/{repo}/dispatches` | `on: repository_dispatch` |
| `workflow_dispatch` | `POST /repos/{repo}/actions/workflows/{workflow}/dispatches` | `on: workflow_dispatch` with inputs |

## 1. Make a token

A fine-grained personal access token (or a GitHub App installation token) restricted to the target repository:

| Mode | Repository permission |
|---|---|
| `repository_dispatch` | **Contents: Read and write** |
| `workflow_dispatch` | **Actions: Read and write** |

## 2. Give it to Angelia, never to a file

```sh
# stored, encrypted at rest, only ever sent to api.github.com
angelia secret set gh-dispatch-token --from-file token.txt --host api.github.com
```

or keep it in the process environment (`GH_DISPATCH_TOKEN=github_pat_...` in `/etc/angelia/angelia.env`) and use
`token_env`.

## 3. Wire it

=== "repository_dispatch"

    ```yaml
    sinks:
      - name: app-ci
        kind: github-dispatch
        config:
          repo: octo-org/octo-app
          token_ref: gh-dispatch-token
          event_type: 'release.{{.data.source}}'     # a template; default angelia.release.published
    subscriptions:
      - name: deps-to-app-ci
        sink: app-ci
        filter: { labels: { consumer: octo-app } }
    ```

    The workflow receives a flat `client_payload`:

    | Key | Value |
    |---|---|
    | `event_id` | the event id, the same on every retry and replay |
    | `source` | `pypi`, `npm`, `github-release`, ... |
    | `package`, `version` | what was released |
    | `previous_version`, `bump` | what it replaces, and how big the step is (or `null`) |
    | `purl`, `release_url` | identifiers and the release page (or `null`) |
    | `watch` | the watch's name |

=== "workflow_dispatch"

    ```yaml
    sinks:
      - name: bump-workflow
        kind: github-dispatch
        config:
          mode: workflow_dispatch
          repo: octo-org/octo-app
          token_env: GH_DISPATCH_TOKEN
          workflow: bump.yml
          ref: main
          inputs:
            package: '{{.data.package}}'
            version: '{{.data.version}}'
    ```

    The workflow must declare every input under `on.workflow_dispatch.inputs`, or GitHub answers `422`.
    Use this mode when the same workflow should also be runnable by hand from the Actions tab.

## 4. The workflow

```yaml title=".github/workflows/on-release.yml"
name: react-to-release
on:
  repository_dispatch:
    types: [release.pypi, release.npm]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test against the new version
        env:                                    # never interpolate payload values into run:
          PACKAGE: ${{ github.event.client_payload.package }}
          VERSION: ${{ github.event.client_payload.version }}
        run: |
          pip install "$PACKAGE==$VERSION"
          pytest
```

!!! danger "The payload is attacker-controllable"
    Whoever publishes a package controls its name and version. Pass every `client_payload` value through `env:`
    and quote it, as above, following
    [GitHub's script-injection guidance](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections).

!!! note "Default branch only"
    GitHub runs a `repository_dispatch` workflow only from the repository's default branch. Merge the workflow
    before you test it.

## What can go wrong

| GitHub answers | Angelia | Usually means |
|---|---|---|
| `204` | delivered | |
| `404` | dead at once | the token does not reach the repository |
| `422` | dead at once | an undeclared input, or a `ref` that does not exist |
| `401`, plain `403` | dead at once | bad token, missing permission |
| `403`/`429` rate limit, `5xx`, timeout | retried, respecting `Retry-After` | |

Fix the cause, then replay: `angelia replay --subscription deps-to-app-ci --since 24h`.

`repository_dispatch` has no idempotency key: a retry after a timeout can start the workflow twice. Deduplicate on
`client_payload.event_id` when it matters (a `concurrency:` group keyed on it does the job).

See it end to end, with an AI review and an update PR, in the
[Home Assistant recipe](../recipes/home-assistant-agentic.md).
