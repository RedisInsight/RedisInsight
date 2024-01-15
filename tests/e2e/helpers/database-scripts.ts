import * as sqlite3 from 'sqlite3';
import { workingDirectory } from '../helpers/conf';

const dbPath = `${workingDirectory}/redisinsight.db`;

export class DatabaseScripts {
    /**
     * Update table column value into local DB for a specific row
     * @param dbTableParameters The sqlite database table parameters
     */
    static async updateColumnValueInDBTable(dbTableParameters: DbTableParameters): Promise<void> {
        const db = new sqlite3.Database(dbPath);
        const query = `UPDATE ${dbTableParameters.tableName} SET ${dbTableParameters.columnName} = ? WHERE ${dbTableParameters.conditionWhereColumnName} = ?`;

        return new Promise<void>((resolve, reject) => {
            db.run(query, [dbTableParameters.rowValue, dbTableParameters.conditionWhereColumnValue], (err: { message: string }) => {
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
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT ${dbTableParameters.columnName} FROM ${dbTableParameters.tableName} WHERE ${dbTableParameters.conditionWhereColumnName} = ?`;

        return new Promise<void>((resolve, reject) => {
            db.get(query, [dbTableParameters.conditionWhereColumnValue], (err: { message: string }, row: any) => {
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
     * @param conditionWhereColumnName The name of the column to search
     * @param conditionWhereColumnValue The value to match in the column
 */
export type DbTableParameters = {
    tableName: string,
    columnName?: string,
    rowValue?: string | number,
    conditionWhereColumnName?: string,
    conditionWhereColumnValue?: string
    };
