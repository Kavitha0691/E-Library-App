# Turbopack Error Fix

You're experiencing a Turbopack internal error. This is a known issue with Next.js 16's Turbopack bundler.

## Solution: Switch to Webpack (Stable Bundler)

### Step 1: Stop the Dev Server
Press `Ctrl+C` (or `Cmd+C` on Mac) to stop the running dev server.

### Step 2: Clear Cache
Run these commands to clear all cached files:

```bash
# Remove Next.js cache
rm -rf .next

# Remove node_modules cache (optional but recommended)
rm -rf node_modules/.cache

# On Windows, use these commands instead:
# rmdir /s /q .next
# rmdir /s /q node_modules\.cache
```

### Step 3: Start Dev Server with Webpack
The `package.json` has been updated to use Webpack by default:

```bash
npm run dev
```

This will now use Webpack instead of Turbopack, which is more stable.

### Alternative: Use Turbopack (if you want to try it again later)
```bash
npm run dev:turbo
```

## Expected Output
After running `npm run dev`, you should see:
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
✓ Ready in 2-3s
```

**Note:** Webpack is slower to start than Turbopack, but it's stable and won't crash.

## What Changed?
- Updated `package.json` to add `--turbopack=false` flag to the dev script
- Created alternative `dev:turbo` script for future Turbopack testing

## If Issues Persist
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Update to latest Next.js:
   ```bash
   npm install next@latest
   ```
