import { ChessImageGenerator, renderChess, registerTheme } from "../../src";
import type { ThemeDefinition } from "../../src";

const theme: ThemeDefinition = {
  name: "custom-theme",
  displayName: "Custom Theme",
  license: "MIT",
  attribution: "Project-authored",
  pieces: {
    wK: { kind: "svg", source: "/tmp/wK.svg" },
    wQ: { kind: "svg", source: "/tmp/wQ.svg" },
    wR: { kind: "svg", source: "/tmp/wR.svg" },
    wB: { kind: "svg", source: "/tmp/wB.svg" },
    wN: { kind: "svg", source: "/tmp/wN.svg" },
    wP: { kind: "svg", source: "/tmp/wP.svg" },
    bK: { kind: "svg", source: "/tmp/bK.svg" },
    bQ: { kind: "svg", source: "/tmp/bQ.svg" },
    bR: { kind: "svg", source: "/tmp/bR.svg" },
    bB: { kind: "svg", source: "/tmp/bB.svg" },
    bN: { kind: "svg", source: "/tmp/bN.svg" },
    bP: { kind: "svg", source: "/tmp/bP.svg" },
  },
};

registerTheme(theme);

new ChessImageGenerator({
  size: 400,
  theme: "custom-theme",
});

void renderChess({
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 400,
  theme: "custom-theme",
});
