# Planar Studio

A reusable interactive 2D space planner and visualization foundation. The public template is maintained on `main`.

## Repository layout

```text
web/                  Standalone application
  package.json        App dependencies and commands
  pnpm-lock.yaml      App-owned frozen dependency lock
  Dockerfile          App-owned production build and startup
  src/                Source code
  public/             Bundled assets
  docs/               Architecture, extensions, and Amazi setup
skill/                Amazi custom skill instructions and catalog metadata
```

Every application-owned file lives inside `web/`. The repository root is not an application or a package workspace. The app can be copied, installed, built, tested, and deployed independently of `skill/` or any parent files.

## Run and verify

Use Node 22.12+ and the pinned pnpm 11.7.0. From the repository root:

```bash
pnpm --dir web install --frozen-lockfile
pnpm --dir web dev
```

Open `http://localhost:4440`. For verification:

```bash
pnpm --dir web format:check
pnpm --dir web typecheck
pnpm --dir web test
pnpm --dir web build
pnpm --dir web test:browser
```

The [application guide](web/README.md) covers controls, desktop launch, and remaining limitations. Read [architecture](web/docs/architecture.md), [extension guidance](web/docs/extending.md), and [Amazi setup](web/docs/amazi.md) for implementation and deployment.

## Use in Amazi

The intended project layout places this application at `web/`, with production build context `application` and Dockerfile `web/Dockerfile`. Amazi application registration is separate from Git files. To import, create an `empty_application` and transfer only the contents of the template's `web/` into its returned source path. Preserve that allocated path and other applications. If a new project must use the name `web`, configure the empty allocated directory to that path before copying, while the target does not yet exist; changing a source path moves the directory rather than registering an existing populated folder. Runtime commands run inside the actual registered application directory.

A GitHub connection synchronizes project files; it does not register applications. This public reference already uses `main`; see the [separate synchronization requirements](web/docs/amazi.md).

[The Amazi skill](skill/agent-content.md) and its [localized catalog metadata](skill/catalog.json) describe the development workflow and link back to this example.
