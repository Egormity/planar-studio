# Extend Planar Studio

Start with [architecture](architecture.md). The room and furniture example establishes the document, geometry, editor, and presentation boundaries. Reuse those boundaries for another visualization without requiring the new product to remain a room planner.

## Add a furniture type or layout

A new layout can be a `PlanTemplate` in `src/model/templates.ts`: give it stable item IDs, a supported room, and valid center-based furniture geometry. Run it through `validateDocument`. The catalog and layout selectors consume data; adding a layout should not require a second editor instance.

For a furniture kind, extend `FurnitureKind` in `src/model/types.ts`, add its defaults to `src/model/catalog.ts`, and add the corresponding presentation in `src/scene`. Keep its footprint explicit. Cushions, leaves, shadows, or a decorative label must not silently change placement bounds. Add a catalog icon or illustration in the UI when the existing generic presentation is insufficient.

The validator derives supported kinds from the catalog, but the renderer still needs to understand the kind. If a new entity is not rectangular, do not pretend its footprint is a rectangle merely to reuse code without checking the consequences. A conservative rectangular envelope can be an intentional first approximation; a circle, polygon, or connector may justify a different geometry type and suitable constraints.

When evolving saved data, choose whether the change is additive within the current schema or requires a new version and an explicit migration. Do not accept arbitrary new properties silently or reinterpret old measurements. Keep example documents, tests, export, and import aligned with the new version.

## Add a domain rule

For example, a clearance area around furniture needs a definition before drawing it: is it advisory or a placement prohibition, which sides need clearance, and what can intersect it? Store the relevant domain data, calculate the clearance in a pure geometry module, and present the result separately.

If the rule prevents placement, enforce it through every mutation path: pointer placement, numeric fields, keyboard movement, duplicate/add, room resize, and import. Decide whether an invalid edit is clamped, rejected, or shown as an advisory. Keep the behavior consistent and include a useful explanation in the UI. A red outline alone is not an enforced constraint.

For a different product such as a warehouse rack layout or construction component preview, retain document/history/import boundaries while replacing the domain vocabulary and geometry as needed. A connected diagram also needs stable edges and connection rules; replacing furniture artwork with rectangles does not provide graph behavior.

## Add a gesture

A resize or rotation handle should be a transaction, just like dragging:

1. Capture the initial item and document when the gesture begins.
2. Convert the pointer through the world transform, then into item-local coordinates only if the operation needs them.
3. Calculate a candidate using pure geometry, constrain it, and display a transient preview.
4. Commit one complete item change on pointer-up, or restore the initial state on cancellation.

Keep the item anchor convention explicit so rotation or resizing cannot unexpectedly move its center. Reconcile document changes during a gesture; an old preview must not overwrite a newly imported layout. Test the operation after pan/zoom, at room edges, on a narrow screen, and when pointer capture is lost.

Pan and zoom remain viewport operations. Adding camera movement to undo history would make geometry undo unpredictable. Provide a fit/reset command when expanding the viewport's freedom. Multi-touch pinch, lasso selection, and multi-object transforms are separate features; each needs its own ownership and cancellation rules rather than borrowing a single-pointer drag accidentally.

## Extend commands and history

Put document mutations in `src/editor/commands.ts` or a focused adjacent module. `usePlanner` can expose a corresponding action, while the UI decides how the user invokes it. Avoid mutating SVG nodes as the permanent implementation of a command.

One user action should normally create one history entry. Batch edits that belong together, such as duplicating a group, into one document commit. If documents grow enough that 50 full snapshots are expensive, measure that cost and introduce reversible commands or patches deliberately. Preserve no-op suppression, redo branching, and cancellation behavior.

Selection and camera state are transient in this example. If the product needs them restored with undo or persisted across visits, make that policy explicit rather than accidentally serializing an entire component tree.

## Export a new format

Editable JSON and view exports serve different purposes. Keep JSON tied to the validated domain schema. For an SVG or image export, render a clean document presentation with defined bounds and local styles; exclude selection handles, control labels, active previews, and camera cropping.

If adding PNG export, choose output dimensions and device-pixel policy, wait for fonts/images as necessary, and test origin restrictions for any external image. If adding PDF or print scale, explicitly define physical page units and scaling; an SVG viewBox alone does not prove a drawing will print at a particular construction scale.

New user-supplied text must remain text through safe serialization. Imported JSON must not become raw SVG/HTML markup. Keep the import byte limit and validation before replacement, and test that a rejected file leaves the current plan unchanged.

## Finish the change

Run focused unit tests for geometry, commands, validation, and history, then typecheck and build. For interaction changes, use the repository's browser suite and real pointer input. Check drag and cancellation, undo/redo, selection from DOM controls, the new entity at rotated room boundaries, import/export, and reload.

Open the exported SVG independently of the editor and compare its geometry and labels. Check the document itself after view changes to prove zoom and pan did not alter dimensions. Preserve the [Amazi runtime contract](amazi.md), and keep assets and their licenses local and documented.
