# Amazi application setup

This repository contains one standalone frontend application in `web/`. Its package manifest, lockfile, Dockerfile, source, assets, tests, and app documentation belong together inside that directory. No build or runtime file is required from the repository root. Application registration lives in Amazi, not in a repository manifest.

The example repository uses `web/` as its application directory. To import, create an `empty_application` and copy only the contents of the template's `web/` into its allocated source directory. Preserve the returned path, whose name may differ, and all other applications. Do not copy the repository wrapper into the application or use the project root as its source path.

This public template uses `main` as its default branch. GitHub synchronization copies the workspace tree and does not discover or register apps. Amazi's initial connection requires a repository without `main`; use a separate repository for a new synchronization connection, or keep an existing connection.

Commands below run inside the application's registered source path. Production build context `application` uses only that directory and its Dockerfile (`web/Dockerfile` in this repository).

To keep the exact `web` name in a new project, configure the empty allocated application's source path before copying, only while the target directory does not already exist. Changing `sourcePath` moves its allocated directory and rejects an existing target; it does not register a populated directory. Keep the returned application catalog authoritative.

| Setting                        | Value                                                |
| ------------------------------ | ---------------------------------------------------- |
| Development command            | `pnpm install --ignore-scripts && exec pnpm run dev` |
| Development / production port  | `10000`                                              |
| Runtime tools                  | `node-22`, `pnpm-10`                                 |
| Preview / public URL / publish | Enabled                                              |
| Production build context       | `application`                                        |
| Production command override    | Unset; use the Dockerfile command                    |
| Editor adapter                 | `vite-jsx-source-selection`                          |
| Request adapter                | `vite-http`                                          |
| Persistent volumes             | None                                                 |

Amazi's current logical `pnpm-10` tool supplies pnpm 11.7.0; the package pins that version.
Vite binds `0.0.0.0`, honors injected `PORT`, and otherwise uses 4440/4441 locally. Invalid ports
fail startup. Amazi supplies the permitted preview hostname and source-selection integration;
do not disable host checks or add the TanStack navigation adapter to this app.

The Dockerfile builds with Node 22 and a frozen lockfile. Its production stage runs static-web-server
as UID 65532 on `PORT`, with health and SPA fallback. It accepts `AMAZI_RUNTIME_BASE_IMAGE` and
`AMAZI_BUILD_REVISION`. Optional `application_environment` BuildKit secrets supply build values;
local `.env` files never enter the build context. Only public `VITE_*` values belong in frontend code.

From the repository root:

```bash
docker build -t planar-studio ./web
docker run --rm -e PORT=10000 -p 127.0.0.1:4443:10000 planar-studio
```

Open `http://127.0.0.1:4443`. The Python launcher is a separate desktop convenience, not the
Amazi production process. The public production preview URL can be added after deployment;
an authenticated project-editor URL is not a public visualization preview.

After copying `web/` elsewhere, run the build from that application directory with `docker build -t planar-studio .`.
