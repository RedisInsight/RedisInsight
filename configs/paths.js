// paths.js

// Paths will export some path variables that we'll
// use in other Webpack config and server files

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  appAssets: resolveApp('ui/src/assets'), // For images and other assets
  appBuild: resolveApp('ui/dist'), // Prod built files end up here
  appConfig: resolveApp('ui/config'), // App config files
  appSrc: resolveApp('ui/src'), // App source
};
