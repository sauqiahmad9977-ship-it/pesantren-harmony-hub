import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- VERCEL CUSTOM BUILD START ---');
try {
  console.log('1. Building Vite app...');
  execSync('npm run build-vite', { stdio: 'inherit' });
  
  console.log('2. Preparing Vercel Output API folder...');
  const vercelOut = path.join(process.cwd(), '.vercel', 'output');
  if (fs.existsSync(vercelOut)) fs.rmSync(vercelOut, { recursive: true, force: true });
  fs.mkdirSync(path.join(vercelOut, 'static'), { recursive: true });
  
  console.log('3. Copying dist to Vercel static folder...');
  const dist = path.join(process.cwd(), 'dist');
  function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(file => copyDir(path.join(src, file), path.join(dest, file)));
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  copyDir(dist, path.join(vercelOut, 'static'));
  
  console.log('4. Generating Vercel config.json...');
  const config = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  };
  fs.writeFileSync(path.join(vercelOut, 'config.json'), JSON.stringify(config, null, 2));
  console.log('--- VERCEL CUSTOM BUILD SUCCESS ---');
} catch (error) {
  console.error('BUILD FAILED:', error);
  process.exit(1);
}
