# Message templates

A subscription's `template` shapes the body its sink sends. Without one, webhooks receive the full
[CloudEvent](release-event.md); chat sinks need a template to say something readable.

Templates are Go [`text/template`](https://pkg.go.dev/text/template) over the event, with a small, safe function
set: nothing reads the environment, files, the network or the clock.

```yaml
template: |
  {{.data.package}} {{.data.version}} is out{{with .data.previous_version}} (was {{.}}){{end}}
  {{with .data.urls.release}}{{.}}{{end}}
```

## What a template sees

| Write | Value |
|---|---|
| `.data.package`, `.data.version`, `.data.source` | always set |
| `.data.previous_version`, `.data.bump`, `.data.purl` | string or null |
| `.data.prerelease`, `.data.backport`, `.data.yanked` | booleans |
| `.data.urls.release`, `.data.urls.changelog` | URL or null |
| `.data.watch.name`, `.data.watch.labels` | the watch |
| `.id`, `.subject`, `.time`, `.type` | CloudEvents attributes |

## Functions

`default`, `upper`, `lower`, `trim`, `trimPrefix`, `trimSuffix`, `contains`, `hasPrefix`, `hasSuffix`,
`replace`, `split`, `join`, `truncate`, `toJSON`, `date`, `print`, `printf`, `urlquery`, and the
`text/template` builtins (`eq`, `if`, `with`, `index`, ...).

## Checked when the file loads

A template is rendered against a full and a sparse sample event when the configuration loads, so mistakes fail
at startup, not at 3 a.m.:

- a misspelt key (`{{.data.pakage}}`) is an error;
- a nullable field read without a guard fails: write `{{with .data.urls.release}}{{.}}{{end}}`;
- read a label with `index`: `{{index .data.watch.labels "team" | default "none"}}`.

## Examples

=== "Chat one-liner"

    ```gotemplate
    {{if eq (.data.bump | default "") "major"}}MAJOR {{end}}{{.data.package}} {{.data.version}}{{with .data.urls.release}} {{.}}{{end}}
    ```

=== "Custom JSON body"

    ```gotemplate
    {"text": {{printf "%s %s released" .data.package .data.version | toJSON}},
     "package": {{toJSON .data.package}}, "event": {{toJSON .id}}}
    ```

    Use `toJSON` for every value in a JSON body: it quotes and escapes.

=== "Dated line"

    ```gotemplate
    {{date "2006-01-02" .data.published_at}} {{.data.source}}:{{.data.package}}@{{.data.version}}
    ```
