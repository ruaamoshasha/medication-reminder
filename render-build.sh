#!/usr/bin/env bash
# exit on error
set -o errexit

# Print debugging information
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Make script executable
chmod +x render-build.sh

# Set environment variables to skip problematic native dependencies
export ROLLUP_SKIP_NODEJS_NATIVE=1
export ESBUILD_BINARY_PATH=/tmp/esbuild

echo "Installing dependencies..."
npm config set legacy-peer-deps true

# Create a custom .npmrc file specifically for Render
cat > .npmrc << EOL
legacy-peer-deps=true
optional=false
fund=false
audit=false
@rollup:registry=https://registry.npmjs.org/
strict-peer-dependencies=false
node-linker=hoisted
EOL

# Handle specific esbuild issues on Render
ESBUILD_VERSION=0.19.11
ESBUILD_DOWNLOAD_URL="https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-${ESBUILD_VERSION}.tgz"
mkdir -p "$(dirname $ESBUILD_BINARY_PATH)"
curl -L "$ESBUILD_DOWNLOAD_URL" | tar -xz -C "$(dirname $ESBUILD_BINARY_PATH)" --no-same-owner --wildcards "*bin/esbuild"
chmod +x $ESBUILD_BINARY_PATH

# Create a temporary package installation script that works around Rollup issues
cat > install-deps.js << EOL
const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Install dependencies but skip problematic ones
  console.log('Installing dependencies...');
  execSync('npm install --no-optional --ignore-scripts', { stdio: 'inherit' });
  
  // Create a minimal package.json for postinstall
  const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const minimalPkg = {
    name: pkgJson.name,
    version: pkgJson.version,
    dependencies: {}
  };
  
  // Install specific problematic packages separately
  console.log('Installing esbuild...');
  execSync('npm install esbuild@0.25.0 --no-optional', { stdio: 'inherit' });
  
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}
EOL

# Run our custom installer
echo "Running custom dependency installer..."
node install-deps.js || npm install --no-optional --no-fund --production=false

echo "Building application..."
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

echo "Build complete!"