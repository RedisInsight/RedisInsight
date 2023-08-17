const fs = require('fs');
const { exec } = require('child_process');
const { last } = require('lodash');

const folderName = 'licenses';
const packageJsons = [
  {
    fileName: 'ui+electron',
    path: './'
  },
  {
    fileName: 'electron',
    path: './redisinsight'
  },
  {
    path: './redisinsight/api'
  },
  {
    path: './redisinsight/tests/e2e'
  },
  {
    path: "./redisinsight/ui/src/packages/redisearch",
  },
  {
    path: "./redisinsight/ui/src/packages/redisgraph",
  },
  {
    path: "./redisinsight/ui/src/packages/redistimeseries-app",
  },
  {
    path: "./redisinsight/ui/src/packages/ri-explain",
  },
  {
    path: "./redisinsight/ui/src/packages/clients-list",
  },
];

async function createFolderIfNotExists() {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(`Failed to create folder ${folderName}, error:`, err);
    process.exit(1);
  }
}

async function runLicenseCheck({ fileName, path }) {
  const name = fileName || last(path.split('/'));

  const command = `license-checker --start ${path} --csv --out ./${folderName}/licenses-${name}.csv`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed command: ${command}, error:`, stderr);
        reject(error);
      }
      resolve();
    });
  });
}

async function main() {
  await createFolderIfNotExists();

  try {
    await Promise.all(packageJsons.map(runLicenseCheck));
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
