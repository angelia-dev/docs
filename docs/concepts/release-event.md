# The release event

The event is the product. Every consumer, whatever its sink, receives the same
[CloudEvents 1.0](https://cloudevents.io/) object, described by a JSON Schema in
[angelia-dev/spec](https://github.com/angelia-dev/spec/blob/main/docs/release-event-v1.md).

```json
{
  "specversion": "1.0",
  "id": "01JBX2A7C8D9E0F1G2H3J4K5M6",
  "source": "angelia://homelab/watches/01JBX1Z3M4N5P6Q7R8S9T0V1W2",
  "type": "dev.angelia.release.published.v1",
  "subject": "pypi:requests@2.33.0",
  "time": "2026-10-30T17:00:02.512Z",
  "datacontenttype": "application/json",
  "dataschema": "https://github.com/angelia-dev/spec/schemas/release/v1.json",
  "data": {
    "source": "pypi",
    "package": "requests",
    "version": "2.33.0",
    "normalized_version": "2.33.0",
    "previous_version": "2.32.5",
    "scheme": "pep440",
    "bump": "minor",
    "backport": false,
    "prerelease": false,
    "yanked": false,
    "published_at": "2026-10-27T14:02:11Z",
    "detected_at": "2026-10-30T17:00:00Z",
    "cooldown_satisfied_at": "2026-10-30T14:02:11Z",
    "urls": {
      "release": "https://pypi.org/project/requests/2.33.0/",
      "changelog": "https://github.com/psf/requests/blob/main/HISTORY.md",
      "artifact": null
    },
    "notes": null,
    "watch": {
      "id": "01JBX1Z3M4N5P6Q7R8S9T0V1W2",
      "name": "requests",
      "labels": { "team": "platform" }
    },
    "purl": "pkg:pypi/requests@2.33.0"
  }
}
```

## What to rely on

- **`id` is stable.** It is generated once; every retry and replay carries the same id. Delivery is
  at-least-once, so deduplicate on it.
- **Every documented field is present.** A field without a value is `null`, never missing.
- **`version` is the raw upstream string**, `normalized_version` the scheme's form. `previous_version` is the
  greatest earlier version, and `bump` (`major`, `minor`, `patch`) is the change from it.
- **`backport` is `true`** when a greater version was already known: `1.9.4` after `2.0.0`.
- **`purl`** identifies the package, so you can join with SBOMs, OSV and Renovate.
- **Ignore what you do not know.** New optional fields are a minor change.

## Types

| `type` | When |
|---|---|
| `dev.angelia.release.published.v1` | a new final version passed the policy |
| `dev.angelia.release.prerelease.v1` | a new pre-release passed the policy |
| `dev.angelia.release.yanked.v1` | a known version was yanked upstream; refers to the original event |

!!! warning "The data is untrusted"
    Package names, versions and URLs come from public registries that anyone can publish to. Treat every field
    as data: quote it in shell scripts, never paste it into a prompt as an instruction. See
    [Security model](security.md).
