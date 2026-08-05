import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Running Vite build...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Creating Vercel Build Output API structure...');
const vercelOutputDir = path.join(process.cwd(), '.vercel', 'output');
const staticDir = path.join(vercelOutputDir, 'static');

if (fs.existsSync(vercelOutputDir)) {
  fs.rmSync(vercelOutputDir, { recursive: true, force: true });
}

fs.mkdirSync(staticDir, { recursive: true });

const distDir = path.join(process.cwd(), 'dist');
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(distDir, staticDir);

const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};

fs.writeFileSync(path.join(vercelOutputDir, 'config.json'), JSON.stringify(config, null, 2));

console.log('Vercel Build Output API structure created successfully!');
