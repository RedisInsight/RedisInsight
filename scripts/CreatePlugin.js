const path = require('path');
const fs = require('fs-extra');

const PLUGINS_DIR = path.join(__dirname, '..', 'redisinsight', 'ui', 'src', 'packages');
const BIOLERPLATE_DIR = path.join(PLUGINS_DIR, '_plugin-boilerplate')

const _createPluginProject = (pluginName, pluginPath) => {
  fs.copySync(BIOLERPLATE_DIR, pluginPath, { overwrite: true });
  fs.readFile(path.join(pluginPath, 'package.json'), (err, data) => {
    if (err) throw err;

    let packageJsonObj = JSON.parse(data);
    packageJsonObj.name = pluginName;
    packageJsonObj.visualizations = _getVisualization(pluginName)
    packageJsonObj = JSON.stringify(packageJsonObj, null, 2);

    fs.writeFile(path.join(NEW_PLUGIN_PATH, 'package.json'), packageJsonObj);
  });
}

const _getVisualization = (pluginName) => ([
  {
    "id": pluginName,
    "name": pluginName,
    "activationMethod": `renderPlugin`,
    "matchCommands": [
      "info"
    ],
    "description": "Example of plugin",
    "default": true
  }
])

try {
  const args = process.argv.slice(2);
  const pluginName = args[0] || 'new-plugin'
  const pluginPath = path.join(PLUGINS_DIR, pluginName);
  const isExist = fs.existsSync(pluginPath)

  if (isExist) {
    console.error(`Plugin with name '${pluginName}' is already exist`)
  } else {
    _createPluginProject(pluginName, pluginPath)
  }
} catch (e) {
  console.error(e)
}
