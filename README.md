# Angelia docs

The Angelia website and documentation, published at **https://angelia-dev.github.io/docs/**.

Part of [Angelia](https://github.com/angelia-dev), the self-hosted release event bus. The design documents and the
authoritative references live in the [core repository](https://github.com/angelia-dev/angelia).

## Work on it

```sh
python3 -m venv .venv && .venv/bin/pip install -r docs/requirements.txt
.venv/bin/mkdocs serve          # http://127.0.0.1:8000/docs/
.venv/bin/mkdocs build --strict # what CI runs
```

| Path | What |
|---|---|
| `docs/` | Markdown pages, styles (`stylesheets/angelia.css`), the landing's teletype (`javascripts/wire.js`) |
| `overrides/` | MkDocs Material overrides: `home.html` is the landing page |
| `docs/videos/` | narrated canvas videos (canvas-video format): `script.json` is the narration, `scenes.js` the drawing, `timing.js` and `audio/` are generated |
| `PRODUCT.md`, `DESIGN.md` | product context and the design system (the "release wire" look) |

Pushes to `main` deploy to GitHub Pages through `.github/workflows/docs.yml`.

### Videos

Narration uses [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0 voice weights). After editing a
`script.json`, re-narrate with the canvas-video skill's `narrate.py`, then check pronunciation with Whisper
(`narration-lexicon`). Pronunciation fixes live in each video's `lexicon.json`.

## License

[Apache-2.0](LICENSE)
