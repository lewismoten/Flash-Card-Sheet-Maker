import fs from 'node:fs/promises';
import { DEFAULT_CONFIG } from "./DEFAULT_CONFIG.js";
import { deepMerge } from './deepMerge.js';

export const loadConfig = async configPath => {
  const json = JSON.parse(await fs.readFile(configPath, 'utf8'));
  return deepMerge(structuredClone(DEFAULT_CONFIG), json);
}