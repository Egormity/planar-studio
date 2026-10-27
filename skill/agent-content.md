# Interactive 2D visualization

Build or extend interactive 2D layouts, spatial previews, diagrams, and configurators. Preserve the
user's domain and interaction goals; a room planner is one example. Establish what the user can
select, change, measure, save, and export. Do not substitute a static illustration for requested editing.

## Working reference

[Planar Studio](https://github.com/Egormity/planar-studio) is a reusable React/TypeScript/SVG room and
furniture planner with editable dimensions, selection/placement, rotation, pan/zoom, history, local
saving, validated JSON import/export, and SVG presentation export. The public template is maintained on `main`.
If it cannot be fetched, use available project files and the principles below; do not claim inspection.
No public production preview has been supplied. An authenticated editor link is not a public preview.

Read only the reference relevant to the work:

- [Architecture](https://github.com/Egormity/planar-studio/blob/main/docs/architecture.md) for document, viewport, gesture, and history ownership.
- [Extension guide](https://github.com/Egormity/planar-studio/blob/main/docs/extending.md) for new objects, constraints, or domains.
- [Research](https://github.com/Egormity/planar-studio/blob/main/docs/research.md) for renderer choices and primary sources.
- [Amazi integration](https://github.com/Egormity/planar-studio/blob/main/docs/amazi.md) for import and deployment.

Planar chooses native SVG for a bounded scene of up to 60 objects. Keep an existing suitable renderer.
Konva can supply canvas interaction tools; Fabric can fit a rich graphics editor; PixiJS can fit
GPU-heavy presentation. None replaces the application's document rules. Ordinary charts and playable
games need foundations matching those requests; do not force them into a furniture-editor template.

## Development flow

1. Inspect the existing app, document model, renderer, asset licenses and runtime. Define a short capability map: viewing, editing, measurement, constraints, simulation, effects, persistence and export. Mark each requested capability as implemented, to build or out of scope; the reference is not a complete engine for every domain.
2. Establish one representative end-to-end slice with real data: load an object, inspect/manipulate it, apply the domain rule, and save/reload or export the result. Set units, precision, target devices and realistic scene sizes before expanding the UI.
3. Implement and test domain rules independently. Add one complex system at a time with explicit ownership and lifecycle, debug views, adjustable parameters and a small reproducible fixture. Preserve existing interactions while replacing illustrative data with the user's actual domain.
4. Add polished rendering, physics or particles only after the core slice works. Profile representative stress scenes, tune quality to the target device and verify fallbacks. A successful build or attractive screenshot does not prove simulation stability or usable frame pacing.
5. Verify the complete interaction and recovery loop: input, cancellation, reset, import validation, persistence, export, resource disposal and deployment asset paths. Prove an extension by adding a representative object or rule through the documented boundaries; report exactly which systems are present and which remain extension guidance.

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

## Collisions, gravity and advanced animation

Choose the model from the requested behavior. Static placement constraints, animated explanatory diagrams and physical simulations need different owners. Planar itself is an SVG editor with room containment; it does not ship item collisions, gravity, particles, joints or a simulation loop.

- For overlap or clearance rules, keep logical footprints separate from artwork. Use broad-phase bounds then the needed narrow-phase test (circles, oriented rectangles/SAT or polygons). Define contact tolerance, allowed overlaps/layers and advisory versus enforced constraints. Use spatial indexing only when measured scene sizes need it. Reuse rules for every edit/import path; a hit-test for clicking is not collision response.
- For gravity, bouncing, stacking or mechanisms, choose a maintained 2D physics engine such as Rapier 2D or Matter.js after checking the installed version. Define the document-to-physics unit conversion, gravity direction, mass/density, friction and restitution. A top-down plan usually has no gravity in its drawing plane. Distinguish fixed, dynamic and kinematic objects; use sensors for detection without response and joints for constrained relative motion.
- Keep authoring data separate from simulation state. Provide play/pause/reset when the product needs a simulation mode. Simulating must not append an undo entry every frame or overwrite a saved layout silently; baking the result is an explicit document command. A simulated drag needs a kinematic target or controlled constraint rather than two systems fighting over position.
- Give one runtime owner a fixed simulation step with bounded catch-up and frame-time clamping; interpolate presentation when useful. Reset accumulated time after tab suspension. Render snapshots without making DOM/React layout decide physics. Test fast objects, thin obstacles, large mass ratios and repeated resets; consider continuous collision detection or substeps for demonstrated tunneling.
- Treat particles as a separate bounded presentation system unless individual particles truly affect domain behavior. Define emitter rate, lifetime, maximum live count, seeded randomness for tests, pooling and cleanup. Avoid one React component or rigid body per decorative spark. For dense animated scenes, Canvas/PixiJS and batched particles can be more appropriate than thousands of SVG nodes; keep the document and commands reusable when changing renderer. Reduced-motion can remove decoration without changing the underlying data.
- Graph/flow simulations, force-directed layouts, spring systems, field plots, cloth and fluids are separate numerical models. Choose a solver matching the requested accuracy, convergence and scale; do not label a generic particle effect as validated fluid or structural analysis. Long computations may belong in a worker, with versioned messages and cancellation to avoid applying stale results.

Read [Rapier bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/), [colliders and sensors](https://rapier.rs/docs/user_guides/javascript/colliders/) and [scene queries](https://rapier.rs/docs/user_guides/javascript/scene_queries/) when adding physical interactions. [PixiJS particles](https://pixijs.com/8.x/guides/components/scene-objects/particle-container) describes a rendering option, not a physics solver; check its version-specific API.

## Amazi and verification

Keep package files, lockfile, Vite config, source, assets, and Dockerfile at the allocated application
root. A single root app can use source path `.`. GitHub synchronization does not register an application;
load the current `project-application-configuration` guidance and use `empty_application` for imported
source. Preserve the source path returned by Amazi instead of replacing another application. See
[Amazi applications](https://docs.amazi.pro/en/applications) and
[publishing](https://docs.amazi.pro/en/publishing-and-domains) for the public workflow. Honor injected `PORT`,
`0.0.0.0`, Node 22 compatibility, the pinned package manager, and the Docker runtime contract.

Test geometry, validation, history, and persistence separately. Then exercise real pointer and keyboard
input: select, drag after zoom/pan, cancel, rotate near a boundary, edit dimensions, undo/redo, import,
export, reload, and narrow-screen touch. Verify the saved document and exported artifact, not just the
rendered appearance. Follow the project's authorized browser-testing workflow and report actual limits.

For construction-related products, name the supported precision and domain checks. A visual layout alone
does not establish structural correctness or construction-document fidelity; add those capabilities
explicitly if requested.
