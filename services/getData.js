import puppeteer from "puppeteer";

// Fetch a la pagina de inicio
export async function scrapeHomePage(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto("https://www.futuretools.io/");

    const data = await fetchData(page);

    return JSON.stringify(data);
  } catch (error) {
    console.error("Error al ejecutar el scraping:", error);
    return null;
  }
}

// Función para extraer los datos de la página por parametros
async function fetchData(page) {
  const data = await page.evaluate(() => {
    let result = [];

    result = Array.from(document.querySelectorAll(".div-block-58")).map( 
      (el) => { 
        const link = el.querySelector("a");
        const image = link?.querySelector("img");
        const textElement = el.querySelector(".div-block-59 a");
        const description = el.querySelector('.tool-item-description-box---new')
        
        const block = el.querySelector(".div-block-59");
        let url
        const cajaDebajoText = block.querySelector(".tool-item-new-window---new")?.href || "";

        // De la url obtenida, se queda con el texto luego de ultima barra /
        if (cajaDebajoText.length > 0) {
          const urlSplits = cajaDebajoText.split("/");
          url = `https://${(urlSplits[urlSplits.length - 1].replace(/-/g, "."))}`;
        }

        const data = {
          text: textElement?.textContent?.trim() || "",
          href: url || "",
          src: image?.src,
          description: description?.textContent?.trim() || "",
        };
        return data;
      }
    );

    return result;
  });

  return data;
}
