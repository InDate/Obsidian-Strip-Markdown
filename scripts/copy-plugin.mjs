import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const pluginDir = path.resolve(__dirname, '..');
const obsidianPluginsDir = process.env.OBSIDIAN_PLUGINS_DIR || '';

console.log(`Directory ${pluginDir} being copied to ${obsidianPluginsDir}`);

// Create the destination directory if it doesn't exist
fs.mkdirSync(obsidianPluginsDir, { recursive: true });

// Files to be copied
const filesToCopy = ['main.js', 'manifest.json', 'styles.css'];

// Copy each file to the Obsidian plugins directory
filesToCopy.forEach((file) => {
	const sourcePath = path.join(pluginDir, file);
	const destinationPath = path.join(obsidianPluginsDir, file);
	fs.copyFile(sourcePath, destinationPath, (err) => {
		if (err) {
			console.error(`Error copying ${file}:`, err);
		} else {
			console.log(`Copied ${file} to ${destinationPath}`);
		}
	});
  });
  
console.log('Plugin files copied to Obsidian plugins directory.');
