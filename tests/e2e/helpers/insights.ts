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
    });
    db.close();
}
