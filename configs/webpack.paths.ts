const path = require('path');

const rootPath = path.join(__dirname, '..');

const riPath = path.join(rootPath, 'redisinsight');

const apiPath = path.join(riPath, 'api');
const uiPath = path.join(riPath, 'ui');
const apiSrcPath = path.join(apiPath, 'src');
const uiSrcPath = path.join(uiPath, 'src');
const electronPath = path.join(riPath, 'electron');
const srcMainPath = path.join(electronPath, 'main');

const dllPath = path.join(electronPath, 'dll');

const releasePath = path.join(rootPath, 'release');
const appPackagePath = path.join(riPath, 'package.json');
const appNodeModulesPath = path.join(releasePath, 'node_modules');
const buildAppPackagePath = path.join(releasePath, 'package.json');
const srcNodeModulesPath = path.join(apiPath, 'node_modules');

const distPath = path.join(riPath, 'dist');
const distMainPath = path.join(distPath, 'main');
const distRendererPath = path.join(distPath, 'renderer');


export default {
  rootPath,
  dllPath,
  apiPath,
  uiPath,
  riPath,
  apiSrcPath,
  uiSrcPath,
  srcMainPath,
  releasePath,
  electronPath,
  appPackagePath,
  appNodeModulesPath,
  srcNodeModulesPath,
  distPath,
  distMainPath,
  distRendererPath,
  buildAppPackagePath,
  buildPath: releasePath,
};
