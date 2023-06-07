import { workingDirectory } from '../helpers/conf';
import * as sqlite3 from 'sqlite3';

const dbPath = `${workingDirectory}/redisinsight.db`;

/**
 * Update table column value into local DB
 * @param tableName The name of table in DB
 * @param columnName The name of column in table
 * @param value Value to update in table
 */
export async function updateColumnValueInDBTable(tableName: string, columnName: string, value: number | string): Promise<void> {
    const db = new sqlite3.Database(dbPath);
    const query = `UPDATE ${tableName} SET ${columnName} = ${value}`;

    return new Promise<void>((resolve, reject) => {
        db.get(`SELECT data FROM ${tableName}`, (err: { message: string }, row: any) => {
            if (err) {
                reject(new Error(`Error during changing ${columnName} column value: ${err.message}`));
            } else {
                console.log(`Value of data in ${tableName}:`, row[columnName]);
                db.run(query, (err: { message: string }) => {
                    if (err) {
                        reject(new Error(`Error during changing ${columnName} column value: ${err.message}`));
                    } else {
                        db.close();
                        resolve();
                    }
                });
            }
        });
    });
    // return new Promise<void>((resolve, reject) => {
    //     db.run(query, (err: { message: string }) => {
    //         if (err) {
    //             reject(new Error(`Error during changing ${columnName} column value: ${err.message}`));
    //         } else {
    //             db.close();
    //             resolve();
    //         }
    //     });
    // });
}

/**
 * Get Column value from table in local Database
 * @param tableName The name of table in DB
 * @param columnName The name of column in table
 */
export async function getColumnValueFromTableInDB(tableName: string, columnName: string): Promise<any> {
    const db = new sqlite3.Database(dbPath);
    const query = `SELECT ${columnName} FROM ${tableName}`;

    return new Promise<void>((resolve, reject) => {
        db.get(query, (err: { message: string }, row: any) => {
            if (err) {
                reject(new Error(`Error during getting ${columnName} column value: ${err.message}`));
            } else {
                const columnValue = row[columnName];
                db.close();
                resolve(columnValue);
            }
        });
    });
}

/**
 * Delete all rows from table in local DB
 * @param tableName The name of table in DB
 */
export async function deleteRowsFromTableInDB(tableName: string): Promise<void> {
    const db = new sqlite3.Database(dbPath);
    const query = `DELETE FROM ${tableName}`;

    return new Promise<void>((resolve, reject) => {


        db.run(query, (err: { message: string }) => {
            if (err) {
                reject(new Error(`Error during ${tableName} table rows deletion: ${err.message}`));
            } else {
                db.close();
                resolve();
            }
        });
    });
}
