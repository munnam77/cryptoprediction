[20:07:44.196] Running build in Washington, D.C., USA (East) – iad1
[20:07:44.289] Cloning github.com/munnam77/cryptoprediction (Branch: v2, Commit: d6203bf)
[20:07:44.452] Previous build caches not available
[20:07:44.607] Cloning completed: 313.000ms
[20:07:44.891] Running "vercel build"
[20:07:45.276] Vercel CLI 41.2.2
[20:07:45.822] Installing dependencies...
[20:07:50.851] npm warn deprecated tailwindcss-filters@3.0.0: Use Tailwind's filter utilities
[20:07:51.004] npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
[20:07:51.140] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[20:07:51.437] npm warn deprecated npmlog@6.0.2: This package is no longer supported.
[20:07:52.117] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[20:07:52.584] npm warn deprecated gauge@4.0.4: This package is no longer supported.
[20:07:52.894] npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
[20:07:53.219] npm warn deprecated @npmcli/move-file@2.0.1: This functionality has been moved to @npmcli/fs
[20:07:53.321] npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
[20:07:53.321] npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
[20:07:53.899] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:07:54.041] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:07:54.093] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:07:54.230] npm warn deprecated glob@8.1.0: Glob versions prior to v9 are no longer supported
[20:07:56.790] npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
[20:08:04.064] npm error code 1
[20:08:04.064] npm error path /vercel/path0/node_modules/gl
[20:08:04.064] npm error command failed
[20:08:04.064] npm error command sh -c prebuild-install || node-gyp rebuild
[20:08:04.064] npm error prebuild-install warn install No prebuilt binaries found (target=22.14.0 runtime=node arch=x64 libc= platform=linux)
[20:08:04.064] npm error gyp info it worked if it ends with ok
[20:08:04.064] npm error gyp info using node-gyp@9.4.1
[20:08:04.064] npm error gyp info using node@22.14.0 | linux | x64
[20:08:04.064] npm error (node:181) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
[20:08:04.064] npm error (Use `node --trace-deprecation ...` to show where the warning was created)
[20:08:04.064] npm error gyp info find Python using Python version 3.12.2 found at "/usr/local/bin/python3"
[20:08:04.064] npm error gyp http GET https://nodejs.org/download/release/v22.14.0/node-v22.14.0-headers.tar.gz
[20:08:04.064] npm error gyp http 200 https://nodejs.org/download/release/v22.14.0/node-v22.14.0-headers.tar.gz
[20:08:04.064] npm error gyp http GET https://nodejs.org/download/release/v22.14.0/SHASUMS256.txt
[20:08:04.064] npm error gyp http 200 https://nodejs.org/download/release/v22.14.0/SHASUMS256.txt
[20:08:04.065] npm error gyp info spawn /usr/local/bin/python3
[20:08:04.065] npm error gyp info spawn args [
[20:08:04.065] npm error gyp info spawn args   '/vercel/path0/node_modules/node-gyp/gyp/gyp_main.py',
[20:08:04.065] npm error gyp info spawn args   'binding.gyp',
[20:08:04.065] npm error gyp info spawn args   '-f',
[20:08:04.065] npm error gyp info spawn args   'make',
[20:08:04.065] npm error gyp info spawn args   '-I',
[20:08:04.065] npm error gyp info spawn args   '/vercel/path0/node_modules/gl/build/config.gypi',
[20:08:04.065] npm error gyp info spawn args   '-I',
[20:08:04.065] npm error gyp info spawn args   '/vercel/path0/node_modules/node-gyp/addon.gypi',
[20:08:04.065] npm error gyp info spawn args   '-I',
[20:08:04.065] npm error gyp info spawn args   '/vercel/.cache/node-gyp/22.14.0/include/node/common.gypi',
[20:08:04.065] npm error gyp info spawn args   '-Dlibrary=shared_library',
[20:08:04.065] npm error gyp info spawn args   '-Dvisibility=default',
[20:08:04.065] npm error gyp info spawn args   '-Dnode_root_dir=/vercel/.cache/node-gyp/22.14.0',
[20:08:04.065] npm error gyp info spawn args   '-Dnode_gyp_dir=/vercel/path0/node_modules/node-gyp',
[20:08:04.065] npm error gyp info spawn args   '-Dnode_lib_file=/vercel/.cache/node-gyp/22.14.0/<(target_arch)/node.lib',
[20:08:04.065] npm error gyp info spawn args   '-Dmodule_root_dir=/vercel/path0/node_modules/gl',
[20:08:04.065] npm error gyp info spawn args   '-Dnode_engine=v8',
[20:08:04.065] npm error gyp info spawn args   '--depth=.',
[20:08:04.065] npm error gyp info spawn args   '--no-parallel',
[20:08:04.065] npm error gyp info spawn args   '--generator-output',
[20:08:04.065] npm error gyp info spawn args   'build',
[20:08:04.065] npm error gyp info spawn args   '-Goutput_dir=.'
[20:08:04.065] npm error gyp info spawn args ]
[20:08:04.065] npm error Traceback (most recent call last):
[20:08:04.065] npm error   File "/vercel/path0/node_modules/node-gyp/gyp/gyp_main.py", line 42, in <module>
[20:08:04.065] npm error     import gyp  # noqa: E402
[20:08:04.065] npm error     ^^^^^^^^^^
[20:08:04.066] npm error   File "/vercel/path0/node_modules/node-gyp/gyp/pylib/gyp/__init__.py", line 9, in <module>
[20:08:04.066] npm error     import gyp.input
[20:08:04.066] npm error   File "/vercel/path0/node_modules/node-gyp/gyp/pylib/gyp/input.py", line 19, in <module>
[20:08:04.066] npm error     from distutils.version import StrictVersion
[20:08:04.066] npm error ModuleNotFoundError: No module named 'distutils'
[20:08:04.066] npm error gyp ERR! configure error 
[20:08:04.066] npm error gyp ERR! stack Error: `gyp` failed with exit code: 1
[20:08:04.066] npm error gyp ERR! stack     at ChildProcess.onCpExit (/vercel/path0/node_modules/node-gyp/lib/configure.js:325:16)
[20:08:04.066] npm error gyp ERR! stack     at ChildProcess.emit (node:events:518:28)
[20:08:04.066] npm error gyp ERR! stack     at ChildProcess._handle.onexit (node:internal/child_process:293:12)
[20:08:04.066] npm error gyp ERR! System Linux 5.10.174
[20:08:04.066] npm error gyp ERR! command "/node22/bin/node" "/vercel/path0/node_modules/.bin/node-gyp" "rebuild"
[20:08:04.066] npm error gyp ERR! cwd /vercel/path0/node_modules/gl
[20:08:04.066] npm error gyp ERR! node -v v22.14.0
[20:08:04.066] npm error gyp ERR! node-gyp -v v9.4.1
[20:08:04.066] npm error gyp ERR! not ok
[20:08:04.067] npm error A complete log of this run can be found in: /vercel/.npm/_logs/2025-03-10T11_07_46_015Z-debug-0.log
[20:08:04.170] Error: Command "npm install" exited with 1
[20:08:04.441] 