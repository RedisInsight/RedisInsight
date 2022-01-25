import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

fixture `Edit Key names verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can edit String Key name', async t => {
    const keyName = 'String1testKeyForEditName';
    const keyTTL = '2147476121';
    const keyNameAfter = 'NewStringNameAfterEdit!';

    await browserPage.addStringKey(keyName, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
});
test('Verify that user can edit Set Key name', async t => {
    const keyName = 'Set1testKeyForEditName';
    const keyTTL = '2147476121';
    const keyNameAfter = 'NewSetNameAfterEdit!';

    await browserPage.addSetKey(keyName, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
});
test('Verify that user can edit Zset Key name', async t => {
    const keyName = 'Zset1testKeyForEditName';
    const keyTTL = '2147476121';
    const keyNameAfter = 'NewZsetNameAfterEdit!';

    await browserPage.addZSetKey(keyName, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
});
test('Verify that user can edit Hash Key name', async t => {
    const keyName = 'Hash1testKeyForEditName';
    const keyTTL = '2147476121';
    const keyNameAfter = 'NewHashNameAfterEdit!';

    await browserPage.addHashKey(keyName, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
});
test('Verify that user can edit List Key name', async t => {
    const keyName = 'List1testKeyForEditName';
    const keyTTL = '2147476121';
    const keyNameAfter = 'NewListNameAfterEdit!';

    await browserPage.addListKey(keyName, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
});
test('Verify that user can edit JSON Key name', async t => {
    const keyName = 'JSON1testKeyForEditName';
    const keyTTL = '2147476121';
    const keyValue = '{"name":"xyz"}';
    const keyNameAfter = 'NewJSONNameAfterEdit!';

    await browserPage.addJsonKey(keyName, keyTTL, keyValue);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
});
