[20:15:06.657] Running build in Washington, D.C., USA (East) – iad1
[20:15:06.754] Cloning github.com/munnam77/cryptoprediction (Branch: v2, Commit: 531cb4a)
[20:15:06.911] Previous build caches not available
[20:15:07.059] Cloning completed: 305.000ms
[20:15:07.345] Running "vercel build"
[20:15:07.729] Vercel CLI 41.2.2
[20:15:08.292] Running "install" command: `npm install --ignore-scripts`...
[20:15:13.311] npm warn deprecated tailwindcss-filters@3.0.0: Use Tailwind's filter utilities
[20:15:13.428] npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
[20:15:13.623] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[20:15:14.022] npm warn deprecated npmlog@6.0.2: This package is no longer supported.
[20:15:14.689] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[20:15:15.078] npm warn deprecated gauge@4.0.4: This package is no longer supported.
[20:15:15.380] npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
[20:15:15.755] npm warn deprecated @npmcli/move-file@2.0.1: This functionality has been moved to @npmcli/fs
[20:15:15.809] npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
[20:15:15.838] npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
[20:15:16.406] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:15:16.590] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:15:16.618] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:15:16.739] npm warn deprecated glob@8.1.0: Glob versions prior to v9 are no longer supported
[20:15:19.759] npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
[20:15:23.881] 
[20:15:23.881] added 924 packages, and audited 925 packages in 15s
[20:15:23.881] 
[20:15:23.881] 186 packages are looking for funding
[20:15:23.881]   run `npm fund` for details
[20:15:23.898] 
[20:15:23.898] 8 vulnerabilities (6 moderate, 2 high)
[20:15:23.898] 
[20:15:23.898] To address issues that do not require attention, run:
[20:15:23.898]   npm audit fix
[20:15:23.898] 
[20:15:23.898] To address all issues (including breaking changes), run:
[20:15:23.898]   npm audit fix --force
[20:15:23.898] 
[20:15:23.899] Run `npm audit` for details.
[20:15:25.505] 
[20:15:25.506] up to date, audited 925 packages in 1s
[20:15:25.506] 
[20:15:25.506] 186 packages are looking for funding
[20:15:25.506]   run `npm fund` for details
[20:15:25.522] 
[20:15:25.523] 8 vulnerabilities (6 moderate, 2 high)
[20:15:25.523] 
[20:15:25.523] To address issues that do not require attention, run:
[20:15:25.523]   npm audit fix
[20:15:25.523] 
[20:15:25.523] To address all issues (including breaking changes), run:
[20:15:25.523]   npm audit fix --force
[20:15:25.523] 
[20:15:25.523] Run `npm audit` for details.
[20:15:25.650] 
[20:15:25.650] > crypto-prediction-app@1.0.0 build
[20:15:25.650] > vite build
[20:15:25.651] 
[20:15:25.962] (!) the `splitVendorChunk` plugin doesn't have any effect when using the object form of `build.rollupOptions.output.manualChunks`. Consider using the function form instead.
[20:15:26.008] [36mvite v5.4.14 [32mbuilding for production...[36m[39m
[20:15:26.273] transforming...
[20:15:35.635] [32m✓[39m 2944 modules transformed.
[20:15:35.642] [31mx[39m Build failed in 9.40s
[20:15:37.284] 
[20:15:37.285] PWA v0.17.5
[20:15:37.285] mode      generateSW
[20:15:37.285] precache  2 entries (0.00 KiB)
[20:15:37.285] files generated
[20:15:37.285]   dist/sw.js
[20:15:37.285]   dist/workbox-54d0af47.js
[20:15:37.285] warnings
[20:15:37.285]   One of the glob patterns doesn't match any files. Please remove or fix the following: {
[20:15:37.285]   "globDirectory": "/vercel/path0/dist",
[20:15:37.285]   "globPattern": "**/*.{js,wasm,css,html}",
[20:15:37.285]   "globIgnores": [
[20:15:37.285]     "**/node_modules/**/*",
[20:15:37.285]     "sw.js",
[20:15:37.285]     "workbox-*.js"
[20:15:37.285]   ]
[20:15:37.285] }
[20:15:37.285] 
[20:15:37.286] [31merror during build:
[20:15:37.286] [31mCould not resolve entry module "chart.js".[31m
[20:15:37.286]     at getRollupError (file:///vercel/path0/node_modules/rollup/dist/es/shared/parseAst.js:395:41)
[20:15:37.286]     at error (file:///vercel/path0/node_modules/rollup/dist/es/shared/parseAst.js:391:42)
[20:15:37.286]     at ModuleLoader.loadEntryModule (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:20027:20)
[20:15:37.286]     at async Promise.all (index 0)
[20:15:37.286]     at async Promise.all (index 0)[39m
[20:15:37.330] Error: Command "npm install --ignore-scripts && npm run build" exited with 1
[20:15:37.727] 