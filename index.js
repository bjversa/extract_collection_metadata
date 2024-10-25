import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY;

async function getCollectionData(collectionSlug) {
  const url = `https://api.opensea.io/api/v2/collections/${collectionSlug}`;
  const headers = {
    accept: 'application/json',
    'x-api-key': API_KEY
  };

  const response = await axios.get(url, { headers });

  return response.data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function functionFetchAllNFTsFromCollection({
  contracts,
  totalSupply
}) {
  const mainContract = contracts[0];
  const { address, chain } = mainContract;

  const nfts = [];
  const errors = [];

  for (let i = 1; i <= totalSupply; i++) {
    const url = `https://api.opensea.io/api/v2/chain/${chain}/contract/${address}/nfts/${i}`;
    const headers = {
      accept: 'application/json',
      'x-api-key': API_KEY
    };

    try {
      console.log(`Fetching NFT ${i}...`);
      const response = await axios.get(url, { headers });
      console.log(`Fetched NFT ${i}\n`);
      nfts.push(response.data);
    } catch (error) {
      console.error(`Error fetching NFT:`, error.message);
      errors.push(i + 1);
    }

    await sleep(1000);
  }

  return {
    nfts,
    errors
  }
}

const collectionData = await getCollectionData("the-official-azuki-ape");

const totalSupply = collectionData.total_supply;

const {
  nfts,
  errors
} = await functionFetchAllNFTsFromCollection({
  contracts: collectionData.contracts,
  totalSupply
});

fs.writeFileSync("nfts2.json", JSON.stringify(nfts, null, 2));
fs.writeFileSync("errors.json", JSON.stringify(errors, null, 2));