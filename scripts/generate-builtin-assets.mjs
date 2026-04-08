import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const themes = {
  merida: {
    lightFill: "#fbf7ef",
    darkFill: "#1b1b1f",
    accent: "#d18b47",
    stroke: "#3d2c1f",
    boarder: 2.4,
  },
  alpha: {
    lightFill: "#f7fbff",
    darkFill: "#10243c",
    accent: "#4f9dff",
    stroke: "#173a62",
    boarder: 2.2,
  },
  cburnett: {
    lightFill: "#fff8f1",
    darkFill: "#231f20",
    accent: "#c23b22",
    stroke: "#5e2218",
    boarder: 2.8,
  },
  cheq: {
    lightFill: "#f5fff7",
    darkFill: "#133321",
    accent: "#4ecb71",
    stroke: "#1f5f36",
    boarder: 2.1,
  },
  leipzig: {
    lightFill: "#fff8fd",
    darkFill: "#34153f",
    accent: "#c56ee0",
    stroke: "#5a2f69",
    boarder: 2.5,
  },
};

const pieces = {
  K: `
    <rect x="38" y="44" width="24" height="9" rx="3" />
    <rect x="46" y="23" width="8" height="24" rx="2" />
    <rect x="35" y="31" width="30" height="8" rx="2" />
    <path d="M26 69h48l-5 11H31z" />
    <path d="M33 69V56c0-13 9-23 19-23s19 10 19 23v13z" />
  `,
  Q: `
    <circle cx="28" cy="33" r="5" />
    <circle cx="40" cy="26" r="5" />
    <circle cx="52" cy="24" r="5" />
    <circle cx="64" cy="31" r="5" />
    <path d="M26 69h48l-4 11H30z" />
    <path d="M30 66l6-26 12 12 12-15 4 29z" />
  `,
  R: `
    <rect x="29" y="23" width="42" height="11" rx="2" />
    <rect x="33" y="18" width="8" height="10" rx="1" />
    <rect x="46" y="18" width="8" height="10" rx="1" />
    <rect x="59" y="18" width="8" height="10" rx="1" />
    <path d="M32 69h40l-4 11H36z" />
    <rect x="35" y="34" width="30" height="35" rx="4" />
  `,
  B: `
    <circle cx="50" cy="22" r="6" />
    <path d="M40 27c8 2 16 10 16 21 0 6-2 11-6 16H34l6-10c2-4 3-7 3-12 0-5-2-9-3-15z" />
    <path d="M54 36l8 8" stroke-linecap="round" />
    <path d="M26 69h48l-4 11H30z" />
  `,
  N: `
    <path d="M34 66c0-17 4-31 16-42 5-5 13-8 18-6-2 4-3 8-2 12 4 2 7 6 8 11-5 0-9 1-13 4 4 5 6 12 6 21H34z" />
    <circle cx="61" cy="33" r="2.5" />
    <path d="M26 69h48l-4 11H30z" />
  `,
  P: `
    <circle cx="50" cy="26" r="10" />
    <path d="M37 69V58c0-9 6-17 13-17s13 8 13 17v11z" />
    <path d="M26 69h48l-4 11H30z" />
  `,
};

function svg(themeName, pieceKey) {
  const theme = themes[themeName];
  const isWhite = pieceKey.startsWith("w");
  const piece = pieces[pieceKey[1]];
  const fill = isWhite ? theme.lightFill : theme.darkFill;
  const accent = isWhite ? theme.accent : theme.lightFill;
  const stroke = isWhite ? theme.stroke : theme.accent;
  const filterId = `${themeName}-${pieceKey}-shadow`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <defs>
    <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
    </filter>
  </defs>
  <rect x="12" y="12" width="76" height="76" rx="14" fill="${isWhite ? "#ffffff00" : "#ffffff08"}"/>
  <g fill="${fill}" stroke="${stroke}" stroke-width="${theme.boarder}" filter="url(#${filterId})">
    ${piece}
  </g>
  <g fill="none" stroke="${accent}" stroke-width="2">
    <path d="M30 82h40" stroke-linecap="round" />
  </g>
</svg>
`;
}

for (const themeName of Object.keys(themes)) {
  const themeDir = join(process.cwd(), "assets", "themes", themeName);
  await mkdir(themeDir, { recursive: true });

  for (const pieceKey of [
    "wK",
    "wQ",
    "wR",
    "wB",
    "wN",
    "wP",
    "bK",
    "bQ",
    "bR",
    "bB",
    "bN",
    "bP",
  ]) {
    await writeFile(join(themeDir, `${pieceKey}.svg`), svg(themeName, pieceKey), "utf8");
  }
}
