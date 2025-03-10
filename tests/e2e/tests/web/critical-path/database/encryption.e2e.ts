import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossSentinelConfig
} from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers/database-scripts';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const dbTableParams: DbTableParameters = {
    tableName: 'database_instance',
    columnName: 'password',
    rowValue: 'invalid',
    conditionWhereColumnName: 'name',
    conditionWhereColumnValue: ossSentinelConfig.masters[1].alias
};

fixture `Encryption`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        await databaseHelper.deleteDatabase(ossSentinelConfig.masters[1].alias);
    });
test('Verify that data encrypted using KEY', async t => {
    const decryptionError = 'Unable to decrypt data';
    // Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossSentinelConfig.masters[1].alias);
    // Return back to db list page
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);

    await DatabaseScripts.updateColumnValueInDBTable(dbTableParams);
    // Verify that Encription by KEY applied for connection if RI_ENCRYPTION_KEY variable exists
    await t
        .expect(await DatabaseScripts.getColumnValueFromTableInDB({ ...dbTableParams, columnName: 'encryption' }))
        .eql('KEY', 'Encryption is not applied by RI_ENCRYPTION_KEY');
    await databaseHelper.clickOnEditDatabaseByName(ossSentinelConfig.masters[1].alias);
    await t.expect(myRedisDatabasePage.Toast.toastError.textContent).contains(decryptionError, 'Invalid encrypted field is decrypted');
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
})
    .skip
    .meta({skipComment: "Unstable in CI, Missing selector"});
