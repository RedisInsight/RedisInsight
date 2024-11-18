import * as fs from 'fs';
import { Selector, t } from 'testcafe';
import { MyRedisDatabasePage } from '../pageObjects';
import { DatabaseAPIRequests } from '../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseAPIRequests = new DatabaseAPIRequests();

export class DatabasesActions {
    /**
     * Verify that databases are displayed
     * @param databases The list of databases to verify
     */
    async verifyDatabasesDisplayed(databases: string[]): Promise<void> {
        for (const db of databases) {
            const databaseName = myRedisDatabasePage.dbNameList.withText(db);
            await t.expect(databaseName.exists).ok(`"${db}" database doesn't exist`);
        }
    }

    /**
     * Import database using file
     * @param fileParameters The arguments of imported file
     */
    async importDatabase(fileParameters: ImportDatabaseParameters): Promise<void> {
        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton)
            .click(myRedisDatabasePage.importDatabasesBtn)
            .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [fileParameters.path])
            .click(myRedisDatabasePage.submitChangesButton)
            .expect(myRedisDatabasePage.successResultsAccordion.exists).ok(`Databases from ${fileParameters.type} not imported`);
    }

    /**
     * Parse json for importing databases
     * @param path The path to json file
     */
    parseDbJsonByPath(path: string): any[] {
        return JSON.parse(fs.readFileSync(path, 'utf-8'));
    }

    /**
     * Select databases checkboxes by their names
     * @param databases The list of databases to select
     */
    async selectDatabasesByNames(databases: string[]): Promise<void> {
        for (const db of databases) {
            const databaseId = await databaseAPIRequests.getDatabaseIdByName(db);
            const databaseCheckbox = Selector(`[data-test-subj=checkboxSelectRow-${databaseId}]`);
            await t.click(databaseCheckbox);
        }
    }

    /**
     * Find files by they name starts from directory
     * @param dir The path directory of file
     * @param fileStarts The file name should start from
     */
    async findFilesByFileStarts(dir: string, fileStarts: string): Promise<string[]> {
        const matchedFiles: string[] = [];
        const files = fs.readdirSync(dir);

        if (fs.existsSync(dir)) {

            for (const file of files) {
                if (file.startsWith(fileStarts)) {
                    matchedFiles.push(file);
                }
            }
        }
        return matchedFiles;
    }

    /**
     * Get files count by name starts from directory
     * @param dir The path directory of file
     * @param fileStarts The file name should start from
     */
    async getFileCount(dir: string, fileStarts: string): Promise<number> {
        if (fs.existsSync(dir)) {
            const matchedFiles: string[] = [];
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.startsWith(fileStarts)) {
                    matchedFiles.push(file);
                }
            }
            return matchedFiles.length;
        }
        return 0;
    }
}

/**
 * Import database parameters
 * @param path The path to file
 * @param type The type of application
 * @param dbNames The names of databases
 * @param userName The username of db
 * @param password The password of db
 * @param connectionType The connection type of db
 * @param fileName The file name
 * @param parsedJson The parsed json content
 */
export type ImportDatabaseParameters = {
    path: string,
    type?: string,
    dbNames?: string[],
    userName?: string,
    password?: string,
    connectionType?: string,
    fileName?: string,
    parsedJson?: any
};
