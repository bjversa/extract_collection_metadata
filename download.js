import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImages() {
  const nfts = JSON.parse(fs.readFileSync("nfts.json", "utf-8"));

  const images = [];

  const downloadPromises = nfts.map(async nft => {
    const { image_url, identifier } = nft.nft;

    try {
      const response = await axios.get(image_url, { responseType: "stream" });
      const filePath = path.resolve(__dirname, "images", `${identifier}.png`);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          images.push(filePath);
          resolve();
        });
        writer.on("error", reject);
      });
    } catch (err) {
      // console.log(err)
      console.error(`Error downloading image for NFT ${identifier}`);
    }
  });

  await Promise.all(downloadPromises);

  console.log(`Downloaded ${images.length} images`);
}

downloadImages();