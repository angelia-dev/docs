# GitHub releases and tags

## Releases

`github-release` lists the releases of a repository. GitHub's own pre-release flag decides what is a
pre-release; drafts are never reported.

```yaml
watches:
  - name: gh-cli
    source: github-release
    coordinates: { repo: cli/cli }
    interval: 6h
```

### Home Assistant core, a calver project

Home Assistant versions are dates (`2026.11.1`, betas `2026.12.0b0`). Tell Angelia so with `scheme: calver`, and
decide whether betas matter:

```yaml
- name: home-assistant
  source: github-release
  coordinates: { repo: home-assistant/core }
  scheme: calver
  interval: 30m
  labels: { consumer: csnet-home }
  policy:
    prerelease: include      # betas too: test early
```

The full story, from this watch to an AI-prepared pull request, is the
[Home Assistant recipe](../recipes/home-assistant-agentic.md).

## Tags

`github-tag` lists tags, for projects that tag without publishing releases. Tags are messier, so its default
SemVer is lenient (`v1.2` reads as `1.2.0`); add `exclude` patterns for tags that are not versions.

```yaml
- name: kubernetes-tags
  source: github-tag
  coordinates: { repo: kubernetes/kubernetes }
  policy:
    exclude: ['-alpha', '-beta', '-rc']
```

## Authentication

Without a token GitHub allows 60 requests an hour per IP. Give Angelia a token, with no scopes for public
repositories, in the instance configuration:

```yaml title="angelia.yaml"
sources:
  github-release:
    token_env: GITHUB_TOKEN
  github-tag:
    token_env: GITHUB_TOKEN
```

With a token, an unchanged repository answers `304 Not Modified`, which GitHub does not count against the limit:
one token can watch thousands of repositories.

## GitHub Enterprise Server

```yaml
sources:
  github-release:
    base_url: https://ghe.example.com/api/v3
    token_env: GHE_TOKEN
```
