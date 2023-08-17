const fs = require('fs');
const { join } = require('path');
const { last } = require('lodash');
const { exec } = require('child_process');

const licenseFolderName = 'licenses';

// Main function
async function main() {
  const folderPath = './';
  const packageJsons = findPackageJsonFiles(folderPath); // Find all package.json files in the given folder

  console.log('All package.jsons was found', packageJsons);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(licenseFolderName)) {
    fs.mkdirSync(licenseFolderName);
  }

  try {
    await Promise.all(packageJsons.map(runLicenseCheck));
    console.log('All csv files was generated');
    await mergeCsvFiles();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();

// Function to find all package.json files in a given folder
function findPackageJsonFiles(folderPath) {
  const packageJsonPaths = [];
  const packageJsonName = 'package.json';
  const excludeFolders = ['dist', 'node_modules', 'static', 'electron'];

  // Recursive function to search for package.json files
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

// Function to run license check for a given package.json file
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

// Function to merge generated CSV files
async function mergeCsvFiles() {
  const outputFilePath = `./${licenseFolderName}/licenses.csv`;

  const outputStream = fs.createWriteStream(outputFilePath);
  const files = fs.readdirSync(licenseFolderName);

  // Loop through all generated CSV files
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = join(licenseFolderName, file);
    const fileData = fs.readFileSync(filePath, 'utf-8');

    const lines = fileData.trim().split('\n');
    lines.shift();

    // Write file name as a separator
    outputStream.write(`File: ${file}\n`);

    // Loop through each line and write to the output if it doesn't start with '"redisinsight'
    for (const line of lines) {
      if (!line.startsWith('"redisinsight')) {
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
