import * as fs from 'fs';
import { workingDirectory} from '../helpers/conf';

const dbPath = `${workingDirectory}/redisinsight.db`;

const sqlite3 = require('sqlite3').verbose();

/**
 * Update controlNumber parameter into local DB
 * @param controlNumber Control Number of user
 */
export function updateControlNumberInDB(controlNumber: Number): void {
    const db = new sqlite3.Database(dbPath);
    const query = `UPDATE features_config SET controlNumber = ${controlNumber}`;

    db.run(query, function(err: { message: string }) {
        if (err) {
            return console.log(`error during changing controlNumber: ${err.message}`);
        }
        db.get('SELECT controlNumber FROM features_config', (err: { message: string }, row: { controlNumber: string }) => {
            if (err) {
                return console.log(`error during retrieving controlNumber: ${err.message}`);
            }
            console.log('Updated controlNumber:', row.controlNumber);
        });
    });
    db.close();
}

/**
 * Update version into local features-config file
 * @param filePath Path to config file
 * @param version New version for features-config
 */
export function updateFeaturesConfigVersion(filePath: string, newVersion: Number): void {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    jsonData.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
}
