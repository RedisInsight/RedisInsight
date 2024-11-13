const fs = require('fs');
const { join } = require('path');
const { last, set } = require('lodash');
const { google } = require('googleapis');
const { execFile } = require('child_process');
const csvParser = require('csv-parser');
const { stringify } = require('csv-stringify');

const licenseFolderName = 'licenses';
const spreadsheetId = process.env.SPREADSHEET_ID;
const outputFilePath = `./${licenseFolderName}/licenses.csv`;
const summaryFilePath = `./${licenseFolderName}/summary.csv`;
const allData = [];
let csvFiles = [];


// Main function
async function main() {
  const folderPath = './';
  const packageJsons = findPackageJsonFiles(folderPath); // Find all package.json files in the given folder

  console.log('All package.jsons was found:', packageJsons);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(licenseFolderName)) {
    fs.mkdirSync(licenseFolderName);
  }

  try {
    await Promise.all(packageJsons.map(runLicenseCheck));
    console.log('All csv files was generated');
    await generateSummary()
    await sendLicensesToGoogleSheet()
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
  const excludeFolders = ['dist', 'node_modules', 'static', 'electron', 'redisgraph'];

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
  const name = last(path.split('/')) || 'electron';

  const COMMANDS = [
    `license-checker --start ${path} --csv --out ./${licenseFolderName}/${name}_prod.csv --production`,
    `license-checker --start ${path} --csv --out ./${licenseFolderName}/${name}_dev.csv --development`,
  ]

  return await Promise.all(COMMANDS.map((command) => {
    const [cmd, ...args] = command.split(' ');
    return new Promise((resolve, reject) => {
      execFile(cmd, args, (error, stdout, stderr) => {
        if (error) {
          console.error(`Failed command: ${command}, error:`, stderr);
          reject(error);
        }
        resolve();
      });
    });
  }));
}

async function sendLicensesToGoogleSheet() {
  try {
    const serviceAccountKey = JSON.parse(fs.readFileSync('./gasKey.json', 'utf-8'));

    // Set up JWT client
    const jwtClient = new google.auth.JWT(
      serviceAccountKey.client_email,
      null,
      serviceAccountKey.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets('v4');

    // Read all .csv files in the 'licenses' folder
    csvFiles.forEach((csvFile) => {
      // Extract sheet name from file name
      const sheetName = csvFile.replace('.csv', '').replaceAll('_', ' ');

      const data = [];
      fs.createReadStream(`./${licenseFolderName}/${csvFile}`)
        .pipe(csvParser({ headers: false }))
        .on('data', (row) => {
          data.push(Object.values(row));
        })
        .on('end', async () => {
          const resource = { values: data };

          try {
            const response = await sheets.spreadsheets.get({
              auth: jwtClient,
              spreadsheetId,
            });

            const sheet = response.data.sheets.find((sheet) => sheet.properties.title === sheetName);
            if (sheet) {
              // Clear contents of the sheet starting from cell A2
              await sheets.spreadsheets.values.clear({
                auth: jwtClient,
                spreadsheetId,
                range: `${sheetName}!A1:Z`, // Assuming Z is the last column
              });
            } else {
              // Create the sheet if it doesn't exist
              await sheets.spreadsheets.batchUpdate({
                auth: jwtClient,
                spreadsheetId,
                resource: set({}, 'requests[0].addSheet.properties.title', sheetName),
              });
            }
          } catch (error) {
            console.error(`Error checking/creating sheet for ${sheetName}:`, error);
          }

          try {
            await sheets.spreadsheets.values.batchUpdate({
              auth: jwtClient,
              spreadsheetId,
              resource: {
                valueInputOption: 'RAW',
                data: [
                  {
                    range: `${sheetName}!A1`, // Use the sheet name as the range and start from A2
                    majorDimension: 'ROWS',
                    values: data,
                  },
                ],
              },
            });

            console.log(`CSV data has been inserted into ${sheetName} sheet.`);
          } catch (err) {
            console.error(`Error inserting data for ${sheetName}:`, err);
          }
        });
      });
  } catch (error) {
    console.error('Error loading service account key:', error);
  }
}

// Function to read and process each CSV file
const processCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const parser = csvParser({ columns: true, trim: true });
    const input = fs.createReadStream(`./${licenseFolderName}/${file}`);

    parser.on('data', (record) => {
      allData.push(record);
    });

    parser.on('end', () => {
      resolve();
    });

    parser.on('error', (err) => {
      reject(err);
    });

    input.pipe(parser);
  });
};

// Process and aggregate license data
const processLicenseData = () => {
  const licenseCountMap = {};
  for (const record of allData) {
    const license = record.license;
    licenseCountMap[license] = (licenseCountMap[license] || 0) + 1;
  }
  return licenseCountMap;
};

// Create summary CSV data
const createSummaryData = (licenseCountMap) => {
  const summaryData = [['License', 'Count']];
  for (const license in licenseCountMap) {
    summaryData.push([license, licenseCountMap[license]]);
  }
  return summaryData;
};

// Write summary CSV file
const writeSummaryCSV = async (summaryData) => {
  try {
    const summaryCsvString = await stringifyPromise(summaryData);
    fs.writeFileSync(summaryFilePath, summaryCsvString);
    csvFiles.push(last(summaryFilePath.split('/')));
    console.log(`Summary CSV saved as ${summaryFilePath}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

// Stringify as a promise
const stringifyPromise = (data) => {
  return new Promise((resolve, reject) => {
    stringify(data, (err, csvString) => {
      if (err) {
        reject(err);
      } else {
        resolve(csvString);
      }
    });
  });
};

async function generateSummary() {
  csvFiles = fs.readdirSync(licenseFolderName).filter(file => file.endsWith('.csv')).sort();

  for (const file of csvFiles) {
    try {
      await processCSVFile(file);
    } catch (err) {
      console.error(`Error processing ${file}: ${err}`);
    }
  }

  const licenseCountMap = processLicenseData();
  const summaryData = createSummaryData(licenseCountMap);

  await writeSummaryCSV(summaryData);
}
