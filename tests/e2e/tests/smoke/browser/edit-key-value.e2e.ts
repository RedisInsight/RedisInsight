import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

fixture `Edit Key values verification`
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
test('Verify that user can edit String value', async t => {
    const keyName = 'String1testKeyForEditValue';
    const keyTTL = '2147476121';
    const keyValueBefore = 'StringValueBeforeEdit!';
    const keyValueAfter = 'StringValueBeforeEdit!';

    //Add string key
    await browserPage.addStringKey(keyName, keyValueBefore, keyTTL);
    //Check the key value before edit
    let keyValueFromDetails = await browserPage.getStringKeyValue();
    await t.expect(keyValueFromDetails).contains(keyValueBefore, 'The value of the key');
    //Edit String key value
    await browserPage.editStringKeyValue(keyValueAfter);
    //Check the key value after edit
    keyValueFromDetails = await browserPage.getStringKeyValue();
    await t.expect(keyValueFromDetails).contains(keyValueAfter, 'The value of the key');
});
