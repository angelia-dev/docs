# Policies

A watch's policy decides which new versions become events, and when. It is evaluated once, in the core, the
same way for every source.

```yaml
watches:
  - name: react
    source: npm
    coordinates: { name: react }
    policy:
      prerelease: none          # none | only | include
      include: ['^1[89]\.']     # RE2 on the raw version, unanchored
      exclude: ['-canary', '-experimental']
      constraint: ">=18 <20"    # compared with the watch's scheme
      bump: [major, minor]      # major | minor | patch
      cooldown: 72h             # wait, and drop it if yanked meanwhile
```

| Key | Default | What it does |
|---|---|---|
| `prerelease` | `none` | `none` drops pre-releases, `only` keeps nothing else, `include` keeps both. The source's own flag wins (GitHub, npm dist-tags), otherwise the scheme decides (`1.0.0-rc.1`, `1.0rc1`). |
| `include` | all | keep a version only if its **raw** string matches one pattern (at most 16) |
| `exclude` | none | drop a version that matches any pattern; exclude wins over include |
| `constraint` | any | a range: `>=2 <3`, `>=2,<3`, `<1 || >=2 <3`. No `^`, `~` or `1.x`. |
| `bump` | all | keep only these bumps, measured against the greatest earlier version |
| `cooldown` | `0` | hold the version until it is this old, then emit it unless it was yanked |
| `baseline` | `true` | the versions found at the first check are recorded without events |

!!! note "The first check is always a baseline"
    `baseline: false` is accepted but not honoured yet: a new watch never floods you with the history of a
    package. Your first event is the first version released after the watch was created.

## Version schemes

Each source kind has a default scheme; set `scheme:` on a watch to override it.

| Scheme | For | Example |
|---|---|---|
| `semver` | npm, crates, most GitHub projects | `2.3.0-rc.1` |
| `pep440` | PyPI | `2.0rc1`, `1.0.post1` |
| `calver` | date-versioned projects (Home Assistant, Ubuntu) | `2026.11.1`, `2026.12.0b0` |
| `lexical` | anything else: plain string order | `build-417` |

## Cooldown, the supply-chain brake

A cooldown turns "first to upgrade" into "upgrade once it has survived a few days". The version is held as a
pending event; if upstream yanks it during the hold, it is dropped, and you never saw it.

```yaml
policy:
  cooldown: 72h
```

The hold survives restarts. A subscription can add its own, longer cooldown (CI immediately, chat after
three days); see [Subscriptions](subscriptions.md).

## Common recipes

=== "Only security-relevant patch lines"

    ```yaml
    policy:
      constraint: ">=4.2 <4.3"
      bump: [patch]
    ```

=== "Every release candidate, for CI"

    ```yaml
    policy:
      prerelease: only
    ```

=== "Majors only, a week late"

    ```yaml
    policy:
      bump: [major]
      cooldown: 168h
    ```

=== "Ignore nightlies"

    ```yaml
    policy:
      exclude: ['nightly', '-dev', '\.dev\d+$']
    ```
