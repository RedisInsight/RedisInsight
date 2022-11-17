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
     * @param pathToFile The path to file for import
     * @param databaseType The database type
     */
    async importDatabase(pathToFile: string, databaseType = ''): Promise<void> {
        await t
            .click(myRedisDatabasePage.importDatabasesBtn)
            .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [pathToFile])
            .click(myRedisDatabasePage.submitImportBtn)
            .expect(myRedisDatabasePage.successImportMessage.exists).ok(`Successfully added ${databaseType} databases message not displayed`);
    }

}
