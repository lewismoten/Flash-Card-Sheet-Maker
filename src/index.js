#!/usr/bin/env node

import fs from 'node:fs/promises';
import { loadConfig } from './loadConfig.js';
import { buildCards } from './buildCards.js';
import { makePdf } from './makePdf.js';
import { assignCardOrders } from './assignCardOrders.js';

const main = async () => {
  try {
    const [
      configPath = "config.json", 
      inputPath = "input.txt", 
      outputPath = "cards.pdf"
    ] = process.argv.slice(2);

    const config = await loadConfig(configPath);
    const rawText = await fs.readFile(inputPath, 'utf8');
    const cards = assignCardOrders(buildCards(rawText, config));

    if (!cards.length) {
      throw new Error('No flash cards were generated. Check your text input and JSON settings.');
    }

    const pdfBytes = await makePdf(cards, config, inputPath);
    await fs.writeFile(outputPath, pdfBytes);

    console.log(`Created ${cards.length} cards`);
    console.log(`Saved PDF to ${outputPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log(error);
    process.exit(1);
  }
}

await main();
