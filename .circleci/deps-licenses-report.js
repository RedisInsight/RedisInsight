const fs = require('fs');
const { exec } = require("child_process");

const folderName = 'licenses'
const packageJsons = [
  {
    name: 'ui+electron',
    path: './'
  },
  {
    name: 'electron',
    path: './redisinsight'
  },
  {
    name: 'api',
    path: './redisinsight/api'
  },
  {
    name: 'e2e',
    path: './redisinsight/tests/e2e'
  },
]

async function main() {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(`create a folder failed ${folderName}, error:`, err);
    process.exit(1);
  }

  await Promise.all(packageJsons.map(async ({name, path}) => {
    const licenses = await new Promise((resolve, reject) => {
      const command = `license-checker --start ${path} --csv --out ./${folderName}/licenses-${name}.csv`
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`failed command: ${command}, error`, stderr);
          reject();
          process.exit(1);
        }
        resolve();
      })
    })
  }))

}

main();
