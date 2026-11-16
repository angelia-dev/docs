# GitLab releases

`gitlab-release` lists the releases of a GitLab project, on gitlab.com or your own instance. The `project` is
the full path with namespace, or the numeric id.

```yaml
watches:
  - name: gitlab-runner
    source: gitlab-release
    coordinates: { project: gitlab-org/gitlab-runner }
    interval: 6h
  - name: inkscape
    source: gitlab-release
    coordinates: { project: inkscape/inkscape }
```

## Self-managed GitLab and private projects

```yaml title="angelia.yaml"
sources:
  gitlab-release:
    base_url: https://gitlab.example.com
    token_env: GITLAB_TOKEN        # a token with read_api
```

A private address also needs `http.allow_networks` in the instance configuration; see
[Security model](../concepts/security.md#the-ssrf-guard).
