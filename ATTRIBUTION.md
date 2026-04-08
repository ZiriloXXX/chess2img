# Bundled Theme Attribution

This package vendors five built-in chess piece theme sets under [`assets/themes`](/root/Chess2img/assets/themes):

- `merida`
- `alpha`
- `cburnett`
- `cheq`
- `leipzig`

These bundled built-in assets are derived from the upstream resource packs in:

- `andyruwruw/chess-image-generator`
- upstream resource path: `src/resources/{merida,alpha,cburnett,cheq,leipzig}`

Packaging and conversion notes:

- the upstream repository stores these built-in piece packs as PNG raster assets
- this package vendors those upstream-derived PNG assets in-package under canonical internal filenames such as `wK.png` and `bQ.png`
- the filename normalization is a packaging conversion only; the piece imagery itself is derived from the upstream resource packs rather than redrawn for this rewrite

Theme provenance notes:

- no runtime or build-time third-party theme package is required to use the bundled themes
- theme names preserve the familiar public style options from the original library
- the upstream `chess-image-generator` repository is MIT-licensed
- the upstream README cites [Marcel van Kervinck](https://marcelk.net/chess/pieces/) as the source of the piece images
- the original license status of the underlying piece-pack sources could not be fully verified from the current environment, so this package does not claim independent license certainty for those underlying assets beyond the upstream repository's published metadata

If third-party themes are added later through `registerTheme(theme)`, their licensing and attribution remain the responsibility of the integrating application or package author.
