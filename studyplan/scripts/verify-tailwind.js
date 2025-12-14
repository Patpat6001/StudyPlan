#!/usr/bin/env node

// Script to verify Tailwind CSS version before build
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const expectedVersion = '3.4.18';
const currentVersion = packageJson.devDependencies?.tailwindcss || packageJson.dependencies?.tailwindcss;

if (currentVersion !== expectedVersion && !currentVersion?.includes(expectedVersion)) {
  console.log(`⚠️  Tailwind CSS version mismatch. Expected: ${expectedVersion}, Found: ${currentVersion}`);
  console.log(`📦 Installing Tailwind CSS ${expectedVersion}...`);
  try {
    execSync(`npm install tailwindcss@${expectedVersion} --save-dev --save-exact --no-save`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ Tailwind CSS ${expectedVersion} installed successfully`);
  } catch (error) {
    console.error('❌ Failed to install correct Tailwind CSS version');
    process.exit(1);
  }
} else {
  console.log(`✅ Tailwind CSS version is correct: ${currentVersion}`);
}
