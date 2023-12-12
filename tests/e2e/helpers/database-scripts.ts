import * as sqlite3 from 'sqlite3';
import { workingDirectory } from '../helpers/conf';

const dbPath = `${workingDirectory}/redisinsight.db`;

export class DatabaseScripts {
    /**
     * Find the row index in a table based on a condition in another column
     * @param dbTableParameters The sqlite database table parameters
     * @returns The index of the row matching the condition
     */
    static async getRowIndexFromTableInDB(dbTableParameters: DbTableParameters): Promise<number | null> {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT rowid FROM ${dbTableParameters.tableName} WHERE ${dbTableParameters.conditionColumnName} = ?`;

        return new Promise<number | null>((resolve, reject) => {
            db.get(query, [dbTableParameters.conditionColumnValue], (err: { message: string }, row: any) => {
                if (err) {
                    reject(new Error(`Error during finding row index: ${err.message}`));
                }
                else {
                    db.close();
                    resolve(row ? row.rowid : null); // Return the rowid if a row matches the condition
                }
            });
        });
    }
    /**
     * Update table column value into local DB for a specific row
     * @param dbTableParameters The sqlite database table parameters
     */
    static async updateColumnValueInDBTable(dbTableParameters: DbTableParameters): Promise<void> {
        const rowIndex = await this.getRowIndexFromTableInDB(dbTableParameters);
        const db = new sqlite3.Database(dbPath);
        const query = `UPDATE ${dbTableParameters.tableName} SET ${dbTableParameters.columnName} = ? WHERE rowid = ?`;

        return new Promise<void>((resolve, reject) => {
            db.run(query, [dbTableParameters.rowValue, rowIndex], (err: { message: string }) => {
                if (err) {
                    reject(new Error(`Error during changing ${dbTableParameters.columnName} column value: ${err.message}`));
                }
                else {
                    db.close();
                    resolve();
                }
            });
        });
    }

    /**
     * Get Column value from table in local Database
     * @param dbTableParameters The sqlite database table parameters
     */
    static async getColumnValueFromTableInDB(dbTableParameters: DbTableParameters): Promise<any> {
        const rowIndex = await DatabaseScripts.getRowIndexFromTableInDB(dbTableParameters);
        if (rowIndex !== null) {
            const db = new sqlite3.Database(dbPath);
            const query = `SELECT ${dbTableParameters.columnName} FROM ${dbTableParameters.tableName} WHERE rowid = ?`;

            return new Promise<void>((resolve, reject) => {
                db.get(query, [rowIndex], (err: { message: string }, row: any) => {
                    if (err) {
                        reject(new Error(`Error during getting ${dbTableParameters.columnName} column value: ${err.message}`));
                    }
                    else {
                        const columnValue = row[dbTableParameters.columnName!];
                        db.close();
                        resolve(columnValue);
                    }
                });
            });
        }
        throw new Error(`No matching row found for the given condition in ${dbTableParameters.tableName}`);

    }

    /**
     * Delete all rows from table in local DB
     * @param dbTableParameters The sqlite database table parameters
     */
    static async deleteRowsFromTableInDB(dbTableParameters: DbTableParameters): Promise<void> {
        const db = new sqlite3.Database(dbPath);
        const query = `DELETE FROM ${dbTableParameters.tableName}`;

        return new Promise<void>((resolve, reject) => {

            db.run(query, (err: { message: string }) => {
                if (err) {
                    reject(new Error(`Error during ${dbTableParameters.tableName} table rows deletion: ${err.message}`));
                }
                else {
                    db.close();
                    resolve();
                }
            });
        });
    }
}
/**
 * Add new database parameters
 * @param tableName The name of table in DB
     * @param columnName The name of column in table
     * @param rowValue Value to update in table
     * @param conditionColumnName The name of the column to search
     * @param conditionColumnValue The value to match in the column
 */
export type DbTableParameters = {
    tableName: string,
    columnName?: string,
    rowValue?: string | number,
    conditionColumnName?: string,
    conditionColumnValue?: string
    };