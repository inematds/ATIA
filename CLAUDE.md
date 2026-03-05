# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ATIA (Aprendizado em Tecnologias de Inteligencia Artificial) is a free online course about AI and digital opportunities. It's a static website hosted on GitHub Pages at https://inematds.github.io/ATIA/.

## Development Commands

```bash
# Start local dev server (required - CORS blocks file:// access to markdown)
npm start          # http://localhost:8080
npm run dev        # same but auto-opens browser
```

No build step, linting, or test suite exists. The site is pure static files served as-is.

## Architecture

**JAMstack static site** using vanilla JavaScript + Tailwind CSS (CDN) + Markdown content. No frameworks, no build tools, no backend.

### Page Structure

- `index.html` - Landing page
- `nivel-fundamentos.html`, `nivel-aplicacao.html`, `nivel-estrategico.html` - Level pages listing chapters for each of the 3 course levels
- `capitulo.html` - Single chapter template that dynamically loads markdown content via `?id=` query parameter

### Content Flow

1. User navigates to `capitulo.html?id=capitulo-01-tsunami-ia`
2. `js/markdown-loader.js` fetches `content/<id>.md` via `fetch()`
3. Content is parsed with `marked.js` (loaded from CDN in HTML)
4. Custom post-processing converts `### TOPICO: Title` patterns into expandable/collapsible topic widgets
5. Video references from `data/video-references.json` are loaded and rendered below the chapter content

### Key JavaScript Files

- `js/app.js` - Mobile menu, smooth scroll, scroll animations (IntersectionObserver), external link handling
- `js/markdown-loader.js` - Core content engine: markdown loading/rendering, expandable topics system, video references, reading progress bar, TOC generation, localStorage-based reading position and chapter completion tracking

### Styling

- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com">`) - configured inline in each HTML file
- `css/main.css` - Custom styles (animations, component styles, FEP style guide base)
- Color scheme per level: Fundamentos=#10B981 (green), Aplicacao=#3B82F6 (blue), Estrategico=#8B5CF6 (purple)

### Data

- `content/capitulo-*.md` (14 chapters) - Course content in Portuguese
- `data/video-references.json` - Curated YouTube video references per chapter
- `doc/` - Project documentation, images, and the original course manual

## Language

All content and UI is in Brazilian Portuguese (pt-BR). Maintain this convention.

## BMad Method

The project uses [BMad Method](https://github.com/nickmaldaner/bmad-method) for development workflow. BMad commands are available under `.claude/commands/BMad/` providing agent roles (architect, dev, pm, qa, etc.) and tasks (create stories, QA gates, etc.).
