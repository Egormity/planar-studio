# Planar Studio

An interactive 2D space planner and reusable visualization example.

- Keep the plain document, units, geometry, validation and history in `src/model`; editor state, persistence and commands in `src/editor`; SVG presentation and gestures in `src/scene`; React controls in `src/ui`.
- Document coordinates and dimensions are centimetres. Viewport transforms never mutate saved geometry.
- Commit one history entry per completed user action. Pointer cancellation must restore the initial document.
- Validate imported documents before replacing state. Reuse shared geometry constraints for pointer, keyboard, inspector, import and room resize.
- Keep rendering declarative and idle when nothing changes. Do not introduce an animation loop for this editor.
- Preserve local storage failure handling, plain JSON export and standalone SVG export without editor controls.
- Preserve Amazi's root Dockerfile, injected PORT, Node 22 and pinned package manager.
- Run focused unit tests and build; use browser checks for gestures, controls, responsive layout, import/export and history.
- Keep files under 300 lines where practical; split anything over 500 lines.
