import http from "http";
import { scrapeHomePage } from "./services/getData.js";
import { promises as fs } from "fs";
import { DATA_FILE, PORT } from "./src/config.js";

// Extrae los datos de la pagina de inicio y los guarda en un archivo JSON
export async function generateDataFile() {
  // Si existe el archivo, lo leo y lo retorno
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return data;

  } catch (err) {
    const scrapedData = await scrapeHomePage();
    await fs.writeFile(DATA_FILE, scrapedData, null, 2);

    return scrapedData;
  }
}

// Crea el servidor
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "GET" && req.url === "/data") {
    try {
      const data = await generateDataFile();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);

    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      console.error("Error al ejecutar el scraping:", error);
      res.end(JSON.stringify({ error: "Error al ejecutar el scraping" }));
    }

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    console.log("Error: Ruta no encontrada");
    res.end(JSON.stringify({ error: "Error al encontrar la ruta" }));
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
