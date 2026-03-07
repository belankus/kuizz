# Kuizz Docs

Documentation site for [Kuizz](https://kuizz.my.id) — the interactive quiz platform.

Built with **Next.js**, **Fumadocs**, **TypeScript**, **TailwindCSS**, and **pnpm**.

🌐 Live: [docs.kuizz.my.id](https://docs.kuizz.my.id)

---

## Getting Started

### Requirements

- Node.js ≥ 20
- pnpm ≥ 9

### Running Locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
docs/
 ├─ app/
 │   ├─ api/search/        # Full-text search API
 │   ├─ docs/
 │   │   ├─ layout.tsx     # Docs layout (sidebar, nav)
 │   │   └─ [[...slug]]/   # Dynamic page renderer
 │   ├─ layout.tsx         # Root layout (RootProvider)
 │   └─ page.tsx           # Redirects to /docs
 ├─ components/
 │   ├─ Callout.tsx        # Callout component
 │   └─ mdx-components.tsx # MDX component registry
 ├─ content/docs/          # MDX documentation files
 ├─ lib/
 │   └─ source.ts          # Fumadocs source loader
 ├─ source.config.ts       # Fumadocs MDX collection
 ├─ next.config.mjs        # Next.js config
 ├─ Dockerfile             # Production Docker build
 └─ Caddyfile.example      # Reverse proxy config
```

---

## Adding Documentation Pages

1. Create a new `.mdx` file inside `content/docs/<section>/`:

   ```
   content/docs/getting-started/my-new-page.mdx
   ```

2. Add frontmatter at the top:

   ```mdx
   ---
   title: My New Page
   description: A brief description for SEO and search.
   ---

   # My New Page
   ```

3. Add the page to the section's `meta.json` in the `pages` array:

   ```json
   {
     "title": "Getting Started",
     "pages": ["installation", "first-quiz", "my-new-page"]
   }
   ```

The sidebar will update automatically.

---

## Editing Sidebar Navigation

The sidebar is driven by `meta.json` files inside `content/docs/`:

- `content/docs/meta.json` — top-level sections
- `content/docs/<section>/meta.json` — pages within a section

Order in `meta.json` controls the order in the sidebar.

---

## Available MDX Components

In any `.mdx` file, you can use:

| Component | Usage |
|-----------|-------|
| `<Callout>` | Highlighted info/warning/tip boxes |
| `<Steps>` / `<Step>` | Numbered step lists |
| `<Tabs>` / `<Tab>` | Tabbed content panels |

Example:

```mdx
<Callout variant="tip" title="Pro Tip">
  This is a tip!
</Callout>

<Steps>
  <Step>First step</Step>
  <Step>Second step</Step>
</Steps>
```

---

## Building for Production

```bash
pnpm build
pnpm start
```

---

## Docker Deployment

```bash
# Build the image
docker build -t kuizz-docs .

# Run the container
docker run -p 3000:3000 kuizz-docs
```

### With Docker Compose

Add to your `docker-compose.yml`:

```yaml
docs:
  image: ghcr.io/username/kuizz-docs:latest
  restart: unless-stopped
  networks:
    - kuizz-network
```

### Caddy Reverse Proxy

See `Caddyfile.example` for the reverse proxy configuration.

---

## Contributing

To improve the documentation:

1. Fork the repository
2. Edit files in `content/docs/`
3. Open a pull request

Each documentation page has an **"Edit this page on GitHub"** link.
