import { t } from 'testcafe';
import { MyRedisDatabasePage } from '../pageObjects';

const myRedisDatabasePage = new MyRedisDatabasePage();

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
            .click(myRedisDatabasePage.importDatabasesBtn)
            .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [fileParameters.path])
            .click(myRedisDatabasePage.submitImportBtn)
            .expect(myRedisDatabasePage.successImportMessage.exists).ok(`Successfully added ${fileParameters.type} databases message not displayed`);
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
 */
export type ImportDatabaseParameters = {
    path: string,
    type?: string,
    dbNames?: string[],
    userName?: string,
    password?: string,
    connectionType?: string,
    fileName?: string
};
