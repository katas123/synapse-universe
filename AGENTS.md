# Development conventions

- Keep the Japanese mobile UX and explicit offline demo status.
- Keep graph domain validation in types/graph.ts, rendering in components, and persistence/analysis in services and db.
- Never commit credentials, user graph exports, node_modules, or build output.
- Validate imported data before writes; preserve existing state when import or reset fails.
- Use IndexedDB for graph data. Do not add paid AI APIs or expose arbitrary Codex RPC.
- Use npm ci with the committed lockfile; run npm run check and npm run build before publication.
- GitHub Pages is the selected host. Keep Vite asset URLs compatible with repository subpaths.
- Do not change the existing Sites deployment as part of this migration.
