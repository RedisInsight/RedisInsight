import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers/database-scripts';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const dbTableParams: DbTableParameters = {
    tableName: 'database_instance',
    columnName: 'caCertId',
    rowValue: 'invalid',
    conditionColumnName: 'name',
    conditionColumnValue: ossStandaloneConfig.databaseName
};

fixture `Encryption`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        await databaseHelper.deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that data encrypted using KEY', async t => {
    const decryptionError = 'Unable to decrypt data';
    // Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);

    await DatabaseScripts.updateColumnValueInDBTable(dbTableParams);
    // Verify that Encription by KEY applied for connection if RI_ENCRYPTION_KEY variable exists
    await t.expect(await DatabaseScripts.getColumnValueFromTableInDB({ ...dbTableParams, columnName: 'encryption' })).eql('KEY', 'Encription is not applied by Key');
    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await t.expect(myRedisDatabasePage.Toast.toastError.textContent).contains(decryptionError, 'Invalid encrypted field is decrypted');
});
