# Assets and licenses

The room, furniture silhouettes, plan marks, library illustrations and application icon are original
SVG/CSS artwork in this repository, covered by the root MIT license. No downloaded floor plans,
third-party furniture drawings, textures or remote images are required.

The interface bundles Manrope and DM Sans from the [Google Fonts repository](https://github.com/google/fonts).
Source families: [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope) and
[DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans). Their SIL Open Font License notices
are included in `public/fonts/manrope-OFL.txt` and `public/fonts/dmsans-OFL.txt`. Fonts are served
locally; exported SVG uses system-font fallbacks and needs no font URL.

Interface icons are from [Lucide](https://github.com/lucide-icons/lucide), under its ISC license.
React, Vite and the other installed dependencies retain their upstream licenses. Desktop server
helpers derive from the Beacon example; their copyright notice is retained in the root license.

Record source, author, license and required attribution here when adding artwork. Avoid external
images in portable exports unless their source is controlled and the export includes them. Never
load arbitrary uploaded SVG as active markup; Planar imports its validated JSON document format.
