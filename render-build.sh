#!/usr/bin/env bash
# exit on error
set -o errexit

echo "====== RENDER BUILD SCRIPT ======"
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Directory contents:"
ls -la

# Create minimal package.json for installation
echo "Creating minimal package.json for initial installation..."
cp package.json package.json.backup
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const minimalPkg = {
  name: pkg.name,
  version: pkg.version,
  type: pkg.type,
  dependencies: {}, 
  devDependencies: {}
};

// Add only essential dependencies
const essentialDeps = [
  'react', 'react-dom', 'express', 'wouter',
  '@tanstack/react-query', 'date-fns', 
  'tailwindcss', 'typescript', 'vite', 'esbuild'
];

for (const dep of essentialDeps) {
  if (pkg.dependencies && pkg.dependencies[dep]) {
    minimalPkg.dependencies[dep] = pkg.dependencies[dep];
  }
  if (pkg.devDependencies && pkg.devDependencies[dep]) {
    minimalPkg.devDependencies[dep] = pkg.devDependencies[dep];
  }
}

fs.writeFileSync('./package.json', JSON.stringify(minimalPkg, null, 2));
console.log('Created minimal package.json for initial installation');
"

echo "Installing essential dependencies first..."
npm install --no-audit --ignore-scripts

echo "Restoring original package.json..."
mv package.json.backup package.json

# Create a better .npmrc file
cat > .npmrc << EOL
legacy-peer-deps=true
fund=false
audit=false
fetch-retries=5
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
fetch-timeout=300000
EOL

# Set important environment variables
export NODE_ENV=production
export ROLLUP_SKIP_NODEJS_NATIVE=1
export NODE_OPTIONS="--max-old-space-size=4096"
export npm_config_build_from_source=false

echo "Installing dependencies without @rollup/rollup-linux-x64-gnu..."
NPM_CONFIG_OPTIONAL=false npm install --legacy-peer-deps --no-optional --ignore-scripts

# Run our patching script to fix node_modules
echo "Running node_modules patching script..."
node node-modules-patch.js

# Fix for esbuild by downloading prebuilt binary
echo "Downloading prebuilt esbuild binary..."
mkdir -p node_modules/esbuild/bin
curl -L https://registry.npmjs.org/esbuild-linux-64/-/esbuild-linux-64-0.17.19.tgz | tar -xz -C node_modules/esbuild/bin --strip-components=2 package/bin/esbuild
chmod +x node_modules/esbuild/bin/esbuild

# Create a symlink for rollup
echo "Creating rollup symlink..."
mkdir -p node_modules/@rollup/rollup-linux-x64-gnu/
touch node_modules/@rollup/rollup-linux-x64-gnu/index.js
echo "module.exports = {};" > node_modules/@rollup/rollup-linux-x64-gnu/index.js

echo "Building the application with increased memory..."
npm run build

echo "Build complete!"
echo "==============================="