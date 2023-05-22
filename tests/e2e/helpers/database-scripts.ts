import { workingDirectory } from '../helpers/conf';

const dbPath = `${workingDirectory}/redisinsight.db`;

const sqlite3 = require('sqlite3').verbose();

/**
 * Update table column value into local DB
 * @param tableName The name of table in DB
 * @param columnName The name of column in table
 * @param value Value to update in table
 */
export async function updateColumnValueInDBTable(tableName: string, columnName: string, value: number | string): Promise<void> {
    const db = await new sqlite3.Database(dbPath);
    const query = `UPDATE ${tableName} SET ${columnName} = ${value}`;

    await db.run(query, (err: { message: string }) => {
        if (err) {
            return console.error(`error during changing ${columnName} column value:`, err.message);
        }
    });
    await db.close();
}

/**
 * Get Column value from table in local Database
 * @param tableName The name of table in DB
 * @param columnName The name of column in table
 */
export async function getColumnValueFromTableInDB(tableName: string, columnName: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT ${columnName} FROM ${tableName}`;

        db.get(query, (err: { message: string }, row: any) => {
            if (err) {
                reject(err);
                return console.error(`error during getting ${columnName} column value:`, err.message);
            }

            const columnValue = row[columnName];
            db.close();
            resolve(columnValue);
        });
    });
}

/**
 * Delete all rows from table in local DB
 * @param tableName The name of table in DB
 */
export async function deleteRowsFromTableInDB(tableName: string): Promise<void> {
    const db = await new sqlite3.Database(dbPath);
    const query = `DELETE FROM ${tableName}`;

    await db.run(query, function(err: { message: string }) {
        if (err) {
            return console.error(`error during ${tableName} table rows deletion:`, err.message);
        }
    });
    await db.close();
}
