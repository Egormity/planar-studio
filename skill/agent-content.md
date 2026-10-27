# Interactive 2D visualization

Build or extend interactive 2D layouts, spatial previews, diagrams, and configurators. Preserve the
user's domain and interaction goals; a room planner is one example. Establish what the user can
select, change, measure, save, and export. Do not substitute a static illustration for requested editing.

## Working reference

[Planar Studio](https://github.com/Egormity/planar-studio) is a reusable React/TypeScript/SVG room and
furniture planner with editable dimensions, selection/placement, rotation, pan/zoom, history, local
saving, validated JSON import/export, and SVG presentation export. It may require repository access.
If it cannot be fetched, use available project files and the principles below; do not claim inspection.
No public production preview has been supplied. An authenticated editor link is not a public preview.

Read only the reference relevant to the work:

- [Architecture](https://github.com/Egormity/planar-studio/blob/feature/codex/planar-studio/2026-10-27/docs/architecture.md) for document, viewport, gesture, and history ownership.
- [Extension guide](https://github.com/Egormity/planar-studio/blob/feature/codex/planar-studio/2026-10-27/docs/extending.md) for new objects, constraints, or domains.
- [Research](https://github.com/Egormity/planar-studio/blob/feature/codex/planar-studio/2026-10-27/docs/research.md) for renderer choices and primary sources.
- [Amazi integration](https://github.com/Egormity/planar-studio/blob/feature/codex/planar-studio/2026-10-27/docs/amazi.md) for import and deployment.

Planar chooses native SVG for a bounded scene of up to 60 objects. Keep an existing suitable renderer.
Konva can supply canvas interaction tools; Fabric can fit a rich graphics editor; PixiJS can fit
GPU-heavy presentation. None replaces the application's document rules. Ordinary charts and playable
games need foundations matching those requests; do not force them into a furniture-editor template.

## Structure the reusable base

Keep these owners distinct at the scale the product needs:

- A plain, versioned document holds stable IDs, domain units, geometry, and editable properties.
- Pure geometry/validation functions define legal state and reusable constraints.
- Editor commands own document changes, selection, bounded history, and persistence.
- Presentation maps the document into shapes; viewport and gesture previews stay transient.
- DOM controls provide inspection, commands, error feedback, and keyboard/touch alternatives.

Planar uses `src/model`, `src/editor`, `src/scene`, and `src/ui`. Add focused data and behavior before
building a generic editor framework. Renderer nodes, selected handles, and event listeners are not
the saved document. A template is data plus domain-specific presentation, not a replacement for rules.

## Units, geometry, and viewport

Choose and document a single world-unit convention, origin, and rotation anchor. Planar uses
centimetres, a room-local origin, and furniture centers. Convert to display units only at UI boundaries.
Pan, zoom, CSS sizing, and device pixels must not alter stored dimensions or document history.

Convert client coordinates through the actual inverse world transform. For SVG, use the world
owner's `getScreenCTM().inverse()` with a client-space point; handle a missing or non-invertible matrix.
Do not compute drag distance from CSS width alone or use the selected rotated child's coordinate space.
Test after zoom, pan, resize, and scrolling. Cancel or rebase an active gesture when layout or zoom
changes invalidate its captured transform. Provide a reliable fit/reset view.

Apply the same constraints through dragging, keyboard, inspector, duplication, import, and room changes.
For rotated rectangular items, clamp using their rotated extents, not unrotated width/depth. Define how
oversized objects and snapping at boundaries are handled. Reject or explicitly normalize invalid
imports before replacing state. Distinguish containment, overlap prevention, alignment, and engineering
validation: implementing one does not establish the others.

## Gestures and history

Treat direct manipulation as a transaction: capture the starting document, preview locally, and commit
one change when completed. Cancellation restores the starting state without adding history. Handle
pointer-cancel, lost capture, Escape, focus/visibility interruption, and unmount as appropriate. Guard
against a second pointer taking over an active gesture. Pointer capture keeps a drag coherent outside
its initial target; scope touch-action so the surrounding page remains usable.

History records document operations, not every pointer-move or camera change. Ignore no-op commits,
remove the redo branch after a new edit, and bound memory. Keep imported/replaced documents and active
gestures coherent: cancel an old preview before it can overwrite a newer document. Scope shortcuts
away from text/numeric inputs and preserve normal button focus. Do not require precise canvas clicking
for every command; expose a readable object list and inspector where useful.

## Saving and export

Validate file size, schema version, types, finite numbers, ranges, enums, colors, object counts, and
unique IDs before accepting a document. Parse only the supported data format; do not execute imported
markup or reuse renderer deserialization as a substitute for domain validation. Failed import leaves
the current document intact. Treat malformed or unavailable local storage as a recoverable state;
avoid silently overwriting the only saved copy. Local storage is browser-specific, so provide portable
export when saving matters.

Keep editable JSON and presentation exports distinct. Export a clean, complete scene with explicit
styles and required definitions, without handles, UI, selection, or the current viewport crop. Escape
user labels through safe DOM/component serialization. Open the exported file independently and verify
geometry, rotation, labels, bounds, and missing-resource behavior. If using raster images, account for
asset loading and origin restrictions. Record asset sources/licenses and preserve required notices.

Render on state changes; an idle document editor does not need a permanent animation loop. Measure
realistic scene sizes before adding caching, virtualization, workers, or a different renderer. Clean up
observers, temporary URLs, listeners, and interrupted gestures. Respect reduced motion for UI effects.

## Amazi and verification

Keep package files, lockfile, Vite config, source, assets, and Dockerfile at the allocated application
root. A single root app can use source path `.`. GitHub synchronization does not register an application;
preserve the path returned by Amazi when importing into an existing project. Honor injected `PORT`,
`0.0.0.0`, Node 22 compatibility, the pinned package manager, and the Docker runtime contract.

Test geometry, validation, history, and persistence separately. Then exercise real pointer and keyboard
input: select, drag after zoom/pan, cancel, rotate near a boundary, edit dimensions, undo/redo, import,
export, reload, and narrow-screen touch. Verify the saved document and exported artifact, not just the
rendered appearance. Follow the project's authorized browser-testing workflow and report actual limits.

For construction-related products, name the supported precision and domain checks. A visual layout alone
does not establish structural correctness or construction-document fidelity; add those capabilities
explicitly if requested.
