# Changelog

All notable changes to this project will be documented in this file.

The project follows Semantic Versioning.

## [0.4.0]

- Added SVG rendering support.
- Added JPEG rendering support.
- Added functional helpers: `renderSvg`, `renderJpeg`, `renderFile`, `renderSvgFile`, and `renderJpegFile`.
- Added class methods: `toSvg`, `toSvgFile`, `toJpeg`, and `toJpegFile`.

## [0.3.1]

- Added configurable circle highlight radius.

## [0.3.0]

- Added circle highlight support.
- Added the new `highlights` API while keeping `highlightSquares` as a compatibility alias.

## [0.2.2]

- Improved inside-coordinate placement for better visual balance.

## [0.2.1]

- Added automatic coordinates mode selection.
- Added explicit `inside` and `border` coordinate modes.

## [0.2.0]

- Added board coordinates support.
- Added configurable border sizing.
- Added inside-board coordinate rendering.

## [0.1.3]

- Polished README presentation.

## [0.1.2]

- Improved README and package discoverability.
- Added npm keywords for better search visibility.

## [0.1.1]

- Replaced placeholder built-in themes with upstream-derived PNG piece packs.

## [0.1.0]

- Initial release of chess2img.
- Render chessboard PNG images from FEN, PGN, or board arrays.
- Built-in themes: merida, alpha, cburnett, cheq, leipzig.
- Theme system with custom PNG and SVG themes.
- TypeScript-first codebase with ESM/CJS builds.
- Class API and functional API.
