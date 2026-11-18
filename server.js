/* Startdatei für Plesk (Phusion Passenger): Passenger startet diese Datei
   statt „next start“. Vorher einmal „npm run build“ ausführen. */
const { createServer } = require("node:http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Bereit auf Port ${port}`);
  });
});
