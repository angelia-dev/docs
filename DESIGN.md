---
name: Angelia
description: The self-hosted release event bus, presented as a news-wire room.
colors:
  midnight: "#14123a"
  ink: "#1e1b4b"
  night: "#0d0b2a"
  indigo: "#4338ca"
  indigo-soft: "#c7d2fe"
  gold-deep: "#b45309"
  gold: "#f59e0b"
  gold-mid: "#fbbf24"
  canary: "#fde68a"
  canary-pale: "#fef6d3"
  paper: "#fffcef"
  flash: "#e0452b"
  wire-ink: "#2a2614"
  moonlight: "#e6e7fb"
  moonlight-dim: "#cfd2f6"
  docs-ink: "#1b1938"
  code-paper: "#f7efcd"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.2vw, 5.4rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 66"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 4vw, 3.2rem)"
    fontWeight: 820
    lineHeight: 1
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 70"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 850
    fontVariation: "'wdth' 70"
  docs-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.3em"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.6
  docs-body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.66rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0"
  slip: "2px"
  dot: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 3.5rem)"
  section: "clamp(3.5rem, 8vw, 6.5rem)"
  column-gap: "clamp(1.5rem, 4vw, 4rem)"
  container: "76rem"
components:
  button-gold:
    backgroundColor: "{colors.gold-mid}"
    textColor: "{colors.midnight}"
    rounded: "{rounded.slip}"
    padding: "0.85rem 1.35rem"
  button-gold-hover:
    backgroundColor: "{colors.canary}"
    textColor: "{colors.midnight}"
  button-line:
    textColor: "#ffffff"
    rounded: "{rounded.slip}"
    padding: "0.85rem 1.35rem"
  button-line-hover:
    textColor: "{colors.canary}"
  button-docs-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.slip}"
  button-docs-primary-hover:
    backgroundColor: "{colors.indigo}"
  slip-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canary}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
  code-panel:
    backgroundColor: "{colors.night}"
    textColor: "#dfe3ff"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "1.4rem 1.5rem"
  teletype-paper:
    backgroundColor: "{colors.canary-pale}"
    textColor: "{colors.wire-ink}"
    rounded: "{rounded.none}"
---

# Design System: Angelia

## Overview

**Creative North Star: "The Release Wire"**

Angelia is drawn as a news-wire room after hours: a midnight indigo ground, canary wire-copy paper for anything that is a bulletin, and a punched five-hole Baudot tape in gold as the one recurring rule. Every release is a bulletin with a slug, a priority stamp and a dateline, routed to desks. The landing page alternates ink and canary-paper bands; the docs are paper pages framed by the midnight wire-room header.

Type does the shouting. Archivo's variable width axis is squeezed (66 to 72 percent) for slugs and headings and left at normal width for reading; JetBrains Mono appears only where the wire itself speaks: code, slugs, data, stamps, column heads. Corners are square or nearly so (2px), depth is a single drop of shadow under paper and code, and colour is reserved: gold marks the path and the action, canary marks the copy.

**Key Characteristics:**
- Midnight and ink grounds; canary-pale paper bands for bulletin content.
- Gold Baudot tape as divider, title underline and tab rule.
- Condensed heavy Archivo headings; mono only for wire data.
- Square slips and panels, never rounded cards.
- Priority stamps (FLASH, BULLETIN, ROUTINE) as the native status vocabulary.

## Colors

A two-temperature palette: cold indigo night for the room, warm gold and canary for the paper and the signal.

### Primary
- **Herald Gold** (gold-mid): primary actions, the accent word in the hero, step counters, the Baudot tape ground on titles, focus rings in docs dark mode.
- **Tape Gold** (gold): the moving tape, route dots, active-nav pip, the top rule on code panels, routing strikes in the teletype, global focus outline.
- **Burnt Gold** (gold-deep): gold that must read on light paper: the docs accent, slugs on canary sections, table column heads on paper.

### Secondary
- **Wire Indigo** (indigo): links on day pages, docs primary button hover, scrollbar, BULLETIN stamp.
- **Soft Indigo** (indigo-soft): muted labels and hairlines on the dark ground.

### Tertiary
- **Flash Red** (flash): the live-wire blink only. FLASH is the one alarm colour; it is not decoration.

### Neutral
- **Wire-Room Midnight** (midnight): the landing ground, the docs header, day-mode footer.
- **Night Ink** (ink): tabs bar, ink sections, admonition slug bands, docs primary buttons, filename bars.
- **Deep Night** (night): code and terminal panels, film frames, dark-mode footer.
- **Canary Pale** (canary-pale): landing paper sections and the teletype paper.
- **Wire Paper** (paper): the day-mode docs page ground; **Code Paper** (code-paper) under code and table heads.
- **Canary** (canary): text on ink (live label, filename bars, slug bands, dark-mode links) and the selection highlight.
- **Moonlight** (moonlight) and **Moonlight Dim** (moonlight-dim): body and lede text on midnight. **Docs Ink** (docs-ink) is day-mode body text; **Wire Ink** (wire-ink) is type on the teletype paper.

### Named Rules
**The Paper Means Copy Rule.** Canary paper carries bulletins, routes, routing tables and ledgers: content that is the wire's output. Chrome stays midnight or ink.

**The Gold Is the Path Rule.** Gold marks where the signal runs (tape, route dots, strikes, the active pip) and the one primary action per block. It does not fill large surfaces other than the tape.

## Typography

**Display Font:** Archivo (variable width 62 to 125, weight 300 to 900), with ui-sans-serif, system-ui
**Body Font:** Archivo at normal width
**Label/Mono Font:** JetBrains Mono (400, 500, 700), with ui-monospace, SFMono-Regular, Menlo

**Character:** A condensed, heavy news-slug face against a plain technical mono; the squeeze of the width axis is the headline voice, the mono is the teleprinter.

### Hierarchy
- **Display** (850, clamp 2.6 to 5.4rem, 0.92, width 66%): the landing hero line only; one word or phrase may turn Herald Gold.
- **Headline** (820, clamp 1.9 to 3.2rem, 1.0, width 70%): landing section heads, balanced wrap.
- **Title** (850, 1.55rem, width 70%): route steps and desk names (desk names 800, 1.3rem, width 75%).
- **Docs Title** (800, 2.3em, 1.05, width 72%): page h1, sitting on the gold tape. h2 is 750 at 1.45em, width 82%; h3 700 at 1.1em.
- **Body** (400, 1.08rem landing / 0.8rem docs, 1.6 to 1.65): docs paragraphs capped at 72ch, landing subs at 42rem.
- **Label** (mono 700, 0.62 to 0.72rem, 0.06 to 0.14em tracking, uppercase): admonition slugs, table heads, nav section heads, the teletype header, ledger heads.

### Named Rules
**The Wire Speaks Mono Rule.** Mono is for code, identifiers, slugs, data and stamps. Running prose, ledes and notes stay in Archivo, even inside the teletype frame.

**The Squeeze Rule.** Headings get heavier as they get narrower (66 to 85 percent width); body text is never condensed.

## Layout

A single 76rem container with a fluid gutter (clamp 1 to 3.5rem). Landing sections are full-bleed bands with fluid vertical padding (clamp 3.5 to 6.5rem), alternating midnight, canary-pale paper and ink. Content splits on asymmetric fr grids (5:6 hero and story, 7:5 anatomy, 4:7 install) with fluid column gaps. The hero uses named areas so the teletype sits beside head and body on desktop and between them on narrow screens. At 60em every split collapses to one column and the horizontal route becomes a vertical rail; at 30em the teletype shortens to 17rem. Docs pages keep Material's three-column layout.

## Elevation & Depth

Mostly flat: grounds are separated by tone, not shadow. Depth appears only where an object is physically paper or a screen lying on the desk (teletype paper, code and terminal panels, the film frame), as a long, soft, downward drop. Docs slips get a near-invisible lift.

### Shadow Vocabulary
- **Paper drop** (`0 30px 60px -30px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.25)`): the teletype paper.
- **Panel drop** (`0 24px 48px -28px rgba(0,0,0,0.8)`): code, terminal and film panels.
- **Slip lift** (`0 1px 2px rgba(20,18,58,0.06)`): docs admonitions.
- **Action glow** (`0 6px 18px -8px rgba(251,191,36,0.6)`): the gold button only.

### Named Rules
**The Objects Only Rule.** Only things that are paper or screens cast shadows. Bands, tables, nav and text never do.

## Shapes

Square by default. Panels, slips, tables, code blocks and filename bars have no radius; buttons, inline code and the search field take a 2px slip corner. Circles appear only as punched holes and signal dots: tape holes, tractor-feed margins, route stops, the active-nav pip, the live blink. Rules are hard lines (1 to 3px) or the tape itself.

## Components

### Buttons
- **Shape:** almost square (2px).
- **Gold:** Herald Gold ground, midnight text, condensed 750 Archivo at 1rem, padding 0.85 x 1.35rem, optional trailing arrow icon; hover goes to canary and lifts 1px (160ms, cubic-bezier(.2,.8,.2,1)).
- **Line:** white text inside a 1.5px soft-indigo inset rule; hover turns rule and text canary.
- **Docs primary:** ink fill, indigo on hover; in night mode it becomes gold-mid with midnight text.

### Wire Slips (admonitions)
- Square, 1px hairline border, paper ground, a full-width ink slug band with canary mono uppercase title and a gold icon.
- A tilted (-3deg) outlined priority stamp at the band's right: ROUTINE by default, BULLETIN for note and info, FLASH for warning and danger.

### Code and Terminal Panels
- Deep Night ground, mono 0.8rem, generous padding, the panel drop. Code panels carry a 3px gold top rule; highlighted fields get a faint gold wash with a gold outline. Terminal prompts are gold-mid and unselectable.
- In docs, filename bars are ink with canary mono.

### Tables
- Docs: 1px hairline frame, mono uppercase heads on code paper. Landing routing slip: borderless rows with hairline separators, condensed heavy desk names, burnt-gold mono heads, gold-wash row hover.

### Navigation
- Midnight header, ink tabs bar underlined by a running gold tape (7px). Tabs are condensed 600 at 78% opacity; active and hover go full opacity canary. Sidebar section heads are mono uppercase; the active link is bold with a gold dot.

### The Teletype (signature)
- Canary-pale paper with dotted tractor-feed margins, labelled as sample, on which a canvas types bulletins in mono, drops tilted priority stamps and strikes gold routing lines to four desk tags. A moving gold tape runs beneath; reduced motion stops the feed and the blink.

### Baudot Tape
- The recurring divider: a gold strip with a repeating five-hole SVG pattern (72 x 14 on the landing, 52 x 10 under docs titles, 36 x 7 under tabs).

## Do's and Don'ts

### Do:
- **Do** put bulletin content on canary paper and chrome on midnight or ink.
- **Do** use the gold Baudot tape as the divider and title rule instead of plain lines.
- **Do** condense headings with Archivo's width axis (66 to 85 percent) at 750 to 850 weight.
- **Do** use the FLASH / BULLETIN / ROUTINE stamp vocabulary for status and severity.
- **Do** keep one gold primary action per block, paired with a line button.

### Don't:
- **Don't** use rounded cards or feature-card grids; use slips, routing tables, rails and ledgers.
- **Don't** set prose in JetBrains Mono; mono is for code, slugs, data and stamps.
- **Don't** round anything beyond 2px except holes and signal dots.
- **Don't** shadow bands, tables or text; only paper and screens cast shadows.
- **Don't** add coloured side stripes to slips; severity lives in the stamp.
