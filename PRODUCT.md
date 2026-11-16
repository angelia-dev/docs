# Product

<!-- impeccable:product-schema 1 -->

> Interview substitution: written on 2026-11-16 while the maintainer was away from the laptop. Facts come from the
> angelia repository (README, docs/prd.md, docs/architecture.md, docs/install.md) and the maintainer's written brief.
> Lines marked *(inferred)* were not confirmed by the maintainer.

## Platform

web

## Stack

MkDocs Material, deployed to GitHub Pages from GitHub Actions, with narrated canvas videos under `docs/videos/`
(the same stack as the maintainer's other documentation sites, e.g. mmornati.github.io/home-assistant-csnet-home).
*(inferred from the maintainer's example sites; stack choice delegated)*

## Users

- Self-hosters and platform engineers who need to know when an upstream dependency releases (PyPI, npm,
  crates.io, GitHub/GitLab releases) and want to act on it: run CI, open an update PR, post in chat.
- People building agentic workflows who want release events as a clean input for an AI agent (pull API, MCP).
- Maintainers of small open-source projects (e.g. a Home Assistant integration) who track a big upstream and
  want their tests and review to start the moment it releases. *(inferred from the brief's example)*

## Product Purpose

Angelia is the self-hosted release event bus: it watches upstream artifacts, detects every new version,
normalizes it into one signed CloudEvent, and delivers it to webhooks, GitHub Actions dispatches, chat services,
or lets consumers pull it (REST cursor API, SSE, MCP). Detect → normalize → deliver. Deciding what to do with a
release stays with the consumer.

## Positioning

One binary, self-hosted, that turns "a new version exists somewhere" into one immutable, signed, machine-readable
event with at-least-once delivery, retries, dead letters and replay, the same way for every ecosystem, and exposes
it to agents through MCP. Renovate/Dependabot open PRs in one repo; Angelia is the event layer underneath anything.

## Operating Context

Runs as a single Go binary or container (SQLite or Postgres), configured by a YAML watch file or the REST API/CLI.
Readers arrive from GitHub, evaluate in minutes, then copy-paste config. Pre-1.0: v0.2.0 is the current release.

## Capabilities and Constraints

- Sources today: `pypi`, `npm`, `crates`, `github-release`, `github-tag`, `gitlab-release` (plus private registries
  as named source instances). OCI, Maven, go-proxy etc. are planned, not shipped: never present them as available.
- Sinks today: `webhook` (Standard Webhooks signed), `github-dispatch` (repository_dispatch / workflow_dispatch),
  `shoutrrr` (slack, discord, telegram, ntfy, gotify, matrix). Pull: REST `/v1/events`, SSE, MCP (v0.2.0, token).
- Policies: prerelease, include/exclude, constraint, bump, cooldown, baseline; subscription filters and templates.
- Docs must match released behaviour; examples runnable; no real secrets in examples.

## Brand Commitments

- Name Angelia (ancient Greek for "message, news"; daughter of Hermes). Mark: the A as a rising peak with a herald's
  wing of three gold feathers and a spark. Indigo #1E1B4B → #4338CA, gold #F59E0B / #FBBF24 / #FDE68A.
  Assets: `~/Projects/angelia-.github/brand/` and the project library `release-notifier/brand/`.
- Voice: plain, precise, engineering-honest; states what is planned vs shipped.

## Evidence on Hand

- Real benchmarks in the angelia repo (`bench/`), the event contract in angelia-dev/spec, the install guide.
- A real end-to-end workflow: Angelia watching home-assistant/core and dispatching to
  mmornati/home-assistant-csnet-home, whose workflow reviews the release with Claude.
- No testimonials, users, stars or adoption numbers exist: never invent them.

## Product Principles

1. Truth over hype: shipped vs planned is always explicit.
2. Copy-paste first: every concept ends in a config block that runs.
3. The event is the product: show the CloudEvent, not abstractions.
4. Secure by default is a feature to explain, not a footnote (signing, SSRF guard, untrusted data).
