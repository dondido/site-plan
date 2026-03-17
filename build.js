const fs = require('fs');
const path = require('path');
const rmw = require('read-modify-write');
const terser = require('terser');
const cleanCss = require('clean-css');
const uglify = c => terser.minify(c).then(({ code }) => code);
const clean = c => new cleanCss().minify(c).styles;
const move = filePath => filePath.replace('src', 'docs');
const filterJs = c => c.endsWith('.js');
const filterCss = c => c.endsWith('.css');

function wipeDirSync(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      wipeDirSync(entryPath);
      fs.rmdirSync(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }
}

function copyDirSync(src, dest, skipNames = []) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipNames.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, skipNames);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyProjectFolders() {
  const sourceRoot = 'src/projects';
  const targetRoot = 'docs';
  const globalSrcRoot = 'src';

  // wipe docs folder before writing new project outputs
  wipeDirSync('docs');
  fs.mkdirSync('docs', { recursive: true });

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const projectName = entry.name;
    const projectSrc = path.join(sourceRoot, projectName);
    const projectDest = path.join(targetRoot, projectName);

    // create project destination and copy all non-projects from global src
    fs.mkdirSync(projectDest, { recursive: true });
    copyDirSync(globalSrcRoot, projectDest, ['projects']);

    // copy project-specific contents inside the same output folder
    copyDirSync(projectSrc, projectDest);
  }
}

function buildAndMinify() {
  copyProjectFolders();
  rmw('docs', move, filterJs, uglify);
  rmw('docs', move, filterCss, clean);
}

buildAndMinify();

// Watch for changes in src and re-trigger project copy
let watchTimer = null;
function watchSrcChanges() {
  if (!fs.existsSync('src')) return;

  fs.watch('src', { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    console.log(`src change detected: ${eventType} ${filename}`);

    if (watchTimer) clearTimeout(watchTimer);
    watchTimer = setTimeout(() => {
      console.log('Re-syncing docs from src...');
      buildAndMinify();
      watchTimer = null;
    }, 150);
  });
}

watchSrcChanges();