// This script patches node_modules for Render deployment
const fs = require('fs');
const path = require('path');

try {
  console.log('Patching node_modules for Render deployment...');

  // 1. Check if rollup exists
  const rollupPath = path.join(process.cwd(), 'node_modules', 'rollup');
  if (fs.existsSync(rollupPath)) {
    console.log('Rollup found at:', rollupPath);
    
    // 2. Patch dist/loadConfigFile.js to avoid requiring native dependencies
    const configFilePath = path.join(rollupPath, 'dist', 'loadConfigFile.js');
    if (fs.existsSync(configFilePath)) {
      console.log('Patching:', configFilePath);
      let content = fs.readFileSync(configFilePath, 'utf8');
      
      // Replace native dependency with a mock
      content = content.replace(
        /require\s*\(\s*['"]@rollup\/rollup-linux-x64-gnu['"]\s*\)/g,
        '(() => { console.log("Mock @rollup/rollup-linux-x64-gnu"); return {}; })()'
      );
      
      fs.writeFileSync(configFilePath, content);
      console.log('Successfully patched loadConfigFile.js');
    }
  } else {
    console.log('Rollup not found, skipping patch');
  }

  // 3. Check if vite exists
  const vitePath = path.join(process.cwd(), 'node_modules', 'vite');
  if (fs.existsSync(vitePath)) {
    console.log('Vite found at:', vitePath);
    
    // Create .npmrc in vite directory to prevent native module installation
    const viteNpmrcPath = path.join(vitePath, '.npmrc');
    fs.writeFileSync(viteNpmrcPath, 'optional=false\nbuild-from-source=false\n');
    console.log('Created .npmrc in vite directory');
  }

  console.log('Node modules patching complete');
} catch (error) {
  console.error('Error patching node_modules:', error);
  // Don't exit with an error code, let the build continue
}