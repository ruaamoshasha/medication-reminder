#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=========== RENDER BUILD SCRIPT ==========="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Create a custom .npmrc file
echo "Creating .npmrc file..."
cat > .npmrc << EOL
legacy-peer-deps=true
omit=optional
EOL

# Set CI environment variables to help with build
export CI=true
export npm_config_node_gyp=/tmp/null-node-gyp
export NODE_OPTIONS="--max-old-space-size=2048"

echo "Installing dependencies without optional dependencies..."
npm install --prefer-offline --no-audit --legacy-peer-deps

echo "Patching package.json to avoid native dependencies..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
if (pkg.optionalDependencies) delete pkg.optionalDependencies;
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('Removed optionalDependencies from package.json');
"

echo "Building the application..."
npm run build

echo "Build complete!"
echo "=========================================="