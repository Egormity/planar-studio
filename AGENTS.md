# Planar Studio repository

- The standalone application is in `web/`. Read [its instructions](web/AGENTS.md) before changing application source.
- Keep runtime source, assets, package files, tests, documentation, and Docker packaging inside `web/`; it must build without files from the repository parent.
- Repository-level `skill/` contains Amazi catalog metadata and agent guidance, not runtime dependencies. Keep its source links and import instructions aligned with `web/`.
- Run application commands with `pnpm --dir web` from this directory, or change into `web/`.
