import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Astro Build Process', () => {
  const distDir = path.join(process.cwd(), 'dist');
  
  beforeAll(() => {
    // Clean and run build before tests
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    const buildResult = spawnSync('npm', ['run', 'build'], { encoding: 'utf-8' });
    if (buildResult.status !== 0) {
      console.error('Build output:', buildResult.stdout, buildResult.stderr);
      throw new Error('Build failed');
    }
  });

  test('dist directory exists', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  test('index.html is generated', () => {
    const indexPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('Cerebruh');
  });

  test('404.html is generated for Cloudflare Pages', () => {
    const notFoundPath = path.join(distDir, '404.html');
    expect(fs.existsSync(notFoundPath)).toBe(true);
    
    const content = fs.readFileSync(notFoundPath, 'utf-8');
    expect(content).toContain('404 - Not Found');
  });

  test('build output directory structure', () => {
    const files = fs.readdirSync(distDir);
    console.log('Build directory contents:', files);
    
    // More flexible asset directory check
    const hasAssets = files.some(file => {
      const stats = fs.statSync(path.join(distDir, file));
      return stats.isDirectory() && (
        file.startsWith('_astro') || 
        file === 'assets' || 
        file === 'static'
      );
    });
    
    if (!hasAssets) {
      console.log('No asset directory found. Full directory listing:');
      listDirectoryContents(distDir);
    }
    
    expect(hasAssets).toBe(true);
  });
});

describe('Cloudflare Pages Compatibility', () => {
  test('package.json has correct build command', () => {
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    expect(pkgJson.scripts.build).toBe('astro build');
  });

  test('astro.config.mjs has correct output configuration', () => {
    const config = fs.readFileSync(
      path.join(process.cwd(), 'astro.config.mjs'),
      'utf-8'
    );
    expect(config).toContain("output: 'static'");
  });
});

// Helper function to recursively list directory contents
function listDirectoryContents(dir: string, indent: string = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      console.log(indent + '[DIR] ' + file);
      listDirectoryContents(fullPath, indent + '  ');
    } else {
      console.log(indent + '[FILE] ' + file);
    }
  });
}