// Extrahiert die eingebetteten Bilder (Logo, Portraet, Siegel) aus der
// Original-HTML-Datei nach public/.
// Aufruf: npm run extract-assets -- pfad/zu/foerderplan-konsole.artifact.html
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Pfad zur Original-HTML angeben: npm run extract-assets -- datei.html");
  process.exit(1);
}
const html = readFileSync(resolve(src), "utf8");

const assets = [
  ["logo.svg", /class="brandplate"><img src="data:image\/svg\+xml;base64,([^"]+)"/],
  ["oscar.jpg", /OSCAR_FOTO = "data:image\/jpeg;base64,([^"]+)"/],
  ["siegel-azav.png", /azav: "data:image\/png;base64,([^"]+)"/],
  ["siegel-iso.png", /iso: "data:image\/png;base64,([^"]+)"/],
];

let fehler = 0;
for (const [name, re] of assets) {
  const m = html.match(re);
  if (!m) {
    console.error(`Nicht gefunden: ${name}`);
    fehler++;
    continue;
  }
  const buf = Buffer.from(m[1], "base64");
  writeFileSync(resolve("public", name), buf);
  console.log(`public/${name} (${buf.length} Bytes)`);
}
process.exit(fehler ? 1 : 0);
