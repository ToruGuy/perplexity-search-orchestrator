# Tauri Build Issue - Next.js App Router + Dynamic Routes

## The Problem

Tauri requires static HTML/CSS/JS files (no Node.js server). The official Tauri docs say to use `output: 'export'` for Next.js.

**However**: Next.js App Router with `output: 'export'` does NOT support:
- Dynamic routes like `/topics/[id]` with client components
- Client-only pages (`"use client"`) with `generateStaticParams`

## Why This Happens

1. **Tauri** = Static file server (like nginx) + Rust backend
2. **Next.js App Router** = Designed for SSR/SSG with Node.js runtime
3. **Our app** = Uses dynamic routes (`/topics/[id]`, `/results/[id]`) with client-side data loading via Tauri commands

## Current Status

✅ **Dev mode works perfectly**: `npm run tauri dev`
- Next.js dev server runs
- Dynamic routes work
- Tauri commands work
- Everything functions as expected

❌ **Production build fails**: `npm run tauri build`
- Next.js `output: 'export'` requires `generateStaticParams` for dynamic routes
- Can't use `generateStaticParams` with `"use client"` directive
- Build fails

## Solutions

### Option 1: Use Dev Mode (Quick Fix)
**Keep current setup, only run in dev mode**
```bash
./dev.sh  # Works perfectly
```
- ✅ Everything works
- ❌ No standalone .app/.dmg bundle

### Option 2: Switch to Next.js Pages Router
**Migrate from App Router (`app/`) to Pages Router (`pages/`)**
- ✅ Better static export support
- ✅ Works with dynamic routes
- ❌ Need to rewrite all pages
- ❌ Pages Router is legacy (Next.js moving away from it)

### Option 3: Switch to Vite + React
**Replace Next.js with Vite**
- ✅ Designed for SPA/static builds
- ✅ Perfect for Tauri
- ✅ Simpler, no SSR complexity
- ❌ Need to rewrite routing (use React Router)
- ❌ Lose Next.js features (not using most of them anyway)

### Option 4: Use Next.js Standalone + Sidecar
**Bundle Next.js server as a Tauri sidecar**
- ✅ Keeps everything as-is
- ✅ Full Next.js features
- ❌ Complex setup
- ❌ Larger bundle size
- ❌ Need to manage Node.js runtime

### Option 5: Hybrid Approach
**Static pages + client-side routing for dynamic routes**
- Export static index/settings/history pages
- Use client-side routing (like React Router) for dynamic routes
- ❌ Complex, mixing two routing systems

## Recommendation

**For this project**: **Option 3 - Switch to Vite + React**

**Why?**
1. This is a **desktop app**, not a website - we don't need SSR/SEO
2. All data comes from **Tauri Rust backend** (not API routes)
3. We're using Next.js like a SPA anyway (all pages are `"use client"`)
4. Vite is **simpler and faster** for this use case
5. Migration is straightforward - same React components, just different routing

**What changes:**
- Replace `app/` directory structure with `src/` + React Router
- Keep all components, hooks, and logic the same
- Replace Next.js routing with React Router
- Simplified build process

## Next Steps

**If staying with Next.js:**
- Remove `output: 'export'`
- Accept that we can't build production bundles yet
- Research Next.js standalone + sidecar approach

**If switching to Vite:**
- Create new Vite project structure
- Migrate pages to React Router
- Copy components/lib as-is
- Update Tauri config for Vite

## Resources

- [Tauri Next.js Guide](https://v2.tauri.app/start/frontend/nextjs/)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Tauri Vite Guide](https://v2.tauri.app/start/frontend/vite/)
- [Why Vite for Tauri](https://v2.tauri.app/start/frontend/)

