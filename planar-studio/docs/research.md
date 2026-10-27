# Research and implementation choices

Research checked on 27 October 2026. Planar Studio is a bounded, interactive space-planning example: a room, up to 60 furniture objects, editable dimensions, direct manipulation, history, and portable documents. Its purpose is to provide a small base that can be adapted into other 2D configurators. The room theme and scene limit are example choices.

## Choose the representation around the product

| Foundation            | Useful capabilities                                                                         | Decision for this example                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Native SVG with React | Vector shapes in the DOM, transforms, text, browser events, portable SVG output             | Selected for a modest object count and explicit geometry; no separate rendering engine is required |
| Konva / React Konva   | Canvas scene graph, hit testing, drag interactions, transform controls                      | Evaluate when a canvas-based editor and its interaction helpers better fit the product             |
| Fabric.js             | Interactive objects, selection, controls, viewport management, JSON and image/vector export | Evaluate for a richer graphics/design editor with extensive object-editing requirements            |
| PixiJS                | GPU rendering, scene graph, assets, pointer interaction, visual effects                     | Evaluate for demanding or animated scenes; document rules and editing workflows still need owners  |

This table is a design assessment, not a benchmark. Native SVG does not remove the need to implement coordinate conversion, constraints, history, and keyboard/touch behavior. Measure realistic documents before changing representation for performance. [SVG reference](https://developer.mozilla.org/en-US/docs/Web/SVG), [Konva overview](https://konvajs.org/docs/overview.html), [Fabric core concepts](https://www.fabricjs.com/docs/core-concepts/), [PixiJS introduction](https://pixijs.com/8.x/guides/getting-started/intro).

Konva's official [React transform example](https://konvajs.org/docs/react/Transformer.html) shows selection and transformation while explicitly converting the transform scale back into stored dimensions. That distinction matters in any editor: a display transform is not automatically a valid domain measurement. Planar stores dimensions and rotation directly instead of preserving accumulated renderer scale.

Fabric's documentation describes object selection, serialization, and export as separate concerns. It also notes that SVG import/export is not perfectly symmetrical. Supporting an export format does not prove that every object, control, or visual effect round-trips through it. Planar therefore treats JSON as the editable document and SVG as a presentation export. [Fabric exports](https://www.fabricjs.com/docs/core-concepts/).

## Document state and history

Konva recommends saving the application data that creates the scene rather than treating a complex renderer tree as the document. Event handlers, images, filters, and decorative nodes make raw scene serialization an awkward source of truth. Planar applies that principle with a plain, versioned document containing the room and furniture. [Konva serialization guidance](https://konvajs.org/docs/data_and_serialization/Best_Practices.html).

An editor's undo history should represent completed user actions. Drag previews can update locally while the durable document remains unchanged; pointer-up commits once, and cancellation discards the preview. A new action after undo removes the abandoned redo branch. Bounded snapshots are an appropriate starting point for this small document; commands or patches can be considered if measured memory cost requires them. [Konva React undo example](https://konvajs.org/docs/react/Undo-Redo.html), [grouped editor history](https://konvajs.org/docs/posts/canvas-undo-redo.html).

## Coordinate and pointer details

`getScreenCTM()` supplies the transform associated with an SVG element. Applying its inverse to the client pointer position gives coordinates in that element's space. The element must be the world-coordinate owner, not a rotated furniture child. This avoids guessing offsets from CSS width or dividing movement only by a zoom number. [SVG screen matrix](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getScreenCTM), [matrix inverse](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrixReadOnly/inverse).

Pointer capture keeps subsequent events targeted at the gesture owner even after a pointer leaves its visual bounds. A completed pointer-up and an interrupted pointer-cancel have different meanings for a document editor. Cancellation can result from browser gesture handling, a device interruption, or other causes; it must not silently commit an unfinished move. The app also cancels on lost capture, Escape, window blur, and page hiding. [Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture), [pointer cancellation](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointercancel_event).

Planar's centimetre units, center-based furniture coordinates, rotated bounding-box constraint, and 10 cm snap are application decisions. They are shared across interaction paths so an inspector edit cannot bypass a constraint enforced during dragging. Pan and zoom change only the viewport. They do not enter document history or alter exported dimensions.

## Export and scope

Export must use a presentation-only tree with its styles and definitions included. It must omit selection handles, pointer state, viewport pan/zoom, and application controls. An XML/SVG serializer or escaped component output is safer than concatenating imported labels into markup. React documents that `renderToStaticMarkup` produces non-interactive output and works in browsers, while discouraging its use in client code; browser export implementations should consider that bundle and lifecycle tradeoff explicitly. Planar deliberately lazy-loads this serializer on export to reuse its pure artwork components with escaped text, while keeping it out of the initial editor chunk. [React static markup API](https://react.dev/reference/react-dom/server/renderToStaticMarkup).

A measured visual plan is not, by itself, a construction document. This example does not implement structural analysis, regulatory checks, furniture collision detection, or arbitrary wall topology. Those are separate domain capabilities. Adding them requires appropriate data and validation rather than changing the visual style alone.

## Reuse and assets

The linked examples are research references. Planar's editor and procedural furniture are original repository code; no third-party editor application is copied wholesale. Source and original art use the repository's MIT license. Library dependencies retain their own licenses.

The interface bundles [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope) and [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans). Preserve their local SIL Open Font License notices in `public/fonts`. Fonts and artwork are served locally. When adding textures, icons, photos, or symbol sets, record the source, license, attribution, and local filename; availability online does not establish reuse rights.
