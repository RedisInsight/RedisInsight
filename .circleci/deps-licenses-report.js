const fs = require('fs');
const { join } = require('path');
const { last } = require('lodash');
const { google } = require('googleapis');
const { exec } = require('child_process');
const csvParser = require('csv-parser');

const licenseFolderName = 'licenses';
const spreadsheetId = process.env.SPREADSHEET_ID;
const outputFilePath = `./${licenseFolderName}/licenses.csv`;

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

  return await Promise.all(COMMANDS.map((command) =>
    new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Failed command: ${commandProd}, error:`, stderr);
          reject(error);
        }
        resolve();
      });
    })
  ));
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
    const csvFiles = fs.readdirSync(licenseFolderName).filter(file => file.endsWith('.csv')).sort();

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
                resource: {
                  requests: [
                    {
                      addSheet: {
                        properties: {
                          title: sheetName,
                        },
                      },
                    },
                  ],
                },
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
