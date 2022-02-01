import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    AddRedisDatabasePage,
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Edit Key values verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async t => {
      await t.maximizeWindow();
      await userAgreementPage.acceptLicenseTerms();
      await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
      await addNewStandaloneDatabase(ossStandaloneConfig);
    })
test
    .meta({ rte: 'standalone' })
    .after(async() => {
        await browserPage.deleteKey();
    })('Verify that user can edit String value', async t => {
        const keyName = 'String1testKeyForEditValue';
        const keyTTL = '2147476121';
        const keyValueBefore = 'StringValueBeforeEdit!';
        const keyValueAfter = 'StringValueBeforeEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
