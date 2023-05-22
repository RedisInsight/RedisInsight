import * as fs from 'fs';
import { workingDirectory} from '../helpers/conf';
import axios from 'axios';

const dbPath = `${workingDirectory}/redisinsight.db`;

const sqlite3 = require('sqlite3').verbose();

/**
 * Update controlNumber parameter into local DB
 * @param controlNumber Control Number of user
 */
export function updateControlNumberInDB(controlNumber: Number): void {
    console.log(dbPath);
    const db = new sqlite3.Database(dbPath);
    const query = `UPDATE features_config SET controlNumber = ${controlNumber}`;

    db.run(query, function(err: { message: string }) {
        if (err) {
            return console.log(`error during changing controlNumber: ${err.message}`);
        }
        db.get('SELECT controlNumber FROM features_config', (err: { message: string }, row: { controlNumber: number }) => {
            if (err) {
                return console.log(`error during retrieving controlNumber: ${err.message}`);
            }
            console.log('Updated controlNumber:', row.controlNumber);
        });
        db.get('SELECT data FROM features_config', (err: { message: string }, row: { data: string }) => {
            if (err) {
                return console.log(`error during retrieving data: ${err.message}`);
            }
            console.log('Updated data:', row.data);
        });
    });
    db.close();
}

/**
 * Update features-config file in static server
 * @param filePath Path to feature config json
 */
export async function modifyFeaturesConfigJson(filePath: string): Promise<void> {
  const url = 'http://static-server:5551/remote/features-config.json';

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    await axios.put(url, data);
    console.log('Features config file updated successfully.');
  } catch (error) {
    console.error('Error updating features config file:', error.message);
  }
}