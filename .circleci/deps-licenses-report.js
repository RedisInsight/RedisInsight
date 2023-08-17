const fs = require('fs');
const { join } = require('path');
const { last } = require('lodash');
const { exec } = require('child_process');

const licenseFolderName = 'licenses';

async function main() {
  const folderPath = './';
  const packageJsons = findPackageJsonFiles(folderPath);

  console.log('All package.jsons was found', packageJsons);

  if (!fs.existsSync(licenseFolderName)) {
    fs.mkdirSync(licenseFolderName);
  }

  try {
    await Promise.all(packageJsons.map(runLicenseCheck));
    console.log('All csv files was generated');
    await mergeCsvFiles()
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();

function findPackageJsonFiles(folderPath) {
  const packageJsonPaths = [];
  const packageJsonName = 'package.json';
  const excludeFolders = ['dist', 'node_modules', 'static'];

  function searchForPackageJson(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory() && !excludeFolders.includes(file)) {
        searchForPackageJson(filePath);
      } else if (file === packageJsonName) {
        packageJsonPaths.push(`./${filePath.slice(0, -packageJsonName.length - 1)}`);
      }
    }
  }

  searchForPackageJson(folderPath);
  return packageJsonPaths;
}

async function runLicenseCheck(path) {
  const name = last(path.split('/')) || 'root';

  const command = `license-checker --start ${path} --csv --out ./${licenseFolderName}/${name}.csv`;

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

async function mergeCsvFiles() {
  const outputFilePath = `./${licenseFolderName}/licenses.csv`;

  const outputStream = fs.createWriteStream(outputFilePath);
  const files = fs.readdirSync(licenseFolderName);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = join(licenseFolderName, file);
    const fileData = fs.readFileSync(filePath, 'utf-8');

    const lines = fileData.trim().split('\n');
    lines.shift(); // Remove the first line (header)

    if (i !== 0) {
      outputStream.write('\n'); // Add a new line separator between files
    }
    outputStream.write(`File: ${file}\n`); // Write file name as a separator
    // outputStream.write(lines.join('\n')); // Write the modified file data

    for (const line of lines) {
      if (!line.startsWith('redisinsight@')) {
        outputStream.write(line + '\n'); // Write the line to the output
      }
    }

    console.log(`Merged ${file}`);

    // Delete the merged file after merging
    fs.unlinkSync(filePath);
  }

  outputStream.end(); // Close the output stream when all files have been processed

  outputStream.on('finish', () => {
    console.log('Merging complete.');
  });

  outputStream.on('error', err => {
    console.error('Error writing to output file:', err);
  });
}

