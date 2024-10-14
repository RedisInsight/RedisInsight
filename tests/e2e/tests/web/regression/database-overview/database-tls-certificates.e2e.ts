import { rte, TlsCertificates } from '../../../../helpers/constants';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneTlsConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `tls certificates`
    .meta({ type: 'regression', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await myRedisDatabasePage.reloadPage();
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneTlsConfig);

    })
    .afterEach(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(ossStandaloneTlsConfig.databaseName);
        await databaseHelper.deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can remove added certificates', async t => {
    await t.click(browserPage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneTlsConfig.databaseName);
    await myRedisDatabasePage.AddRedisDatabase.removeCertificateButton(TlsCertificates.CA, 'ca');
    await myRedisDatabasePage.reloadPage();
    // wait for dbs are displayed
    await t.expect(myRedisDatabasePage.dbNameList.count).gt(0);
    await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneTlsConfig.databaseName);
    //verify that ca certificate is deleted
    await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).contains('No CA Certificate', 'CA certificate was not deleted');
    await t.click(myRedisDatabasePage.AddRedisDatabase.caCertField);
    await t.expect(myRedisDatabasePage.AddRedisDatabase.certificateDropdownList.exists).notOk('CA certificate was not deleted');

    //verify that client certificate is deleted
    await myRedisDatabasePage.AddRedisDatabase.removeCertificateButton(TlsCertificates.Client, 'client');
    await myRedisDatabasePage.reloadPage();

    // wait for dbs are displayed
    await t.expect(myRedisDatabasePage.dbNameList.count).gt(0);
    await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneTlsConfig.databaseName);
    await t.click(myRedisDatabasePage.AddRedisDatabase.requiresTlsClientCheckbox);
    await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).contains('Add new certificate', 'Client certificate was not deleted');

    //TODO should be uncommented when the bug is fixed https://redislabs.atlassian.net/browse/RI-6136

    // await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneTlsConfig.databaseName);
    // await t.expect(myRedisDatabasePage.AddRedisDatabase.requiresTlsClientCheckbox.checked).notOk('the certificate was not removed');

    // await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName!);
    //
    // await t.click(browserPage.NavigationPanel.myRedisDBButton);
    // await myRedisDatabasePage.clickOnDBByName(ossStandaloneTlsConfig.databaseName);
    // await t.expect(browserPage.Toast.toastError.textContent).contains('CA or Client certificate', 'user can connect to db without certificates');
});
