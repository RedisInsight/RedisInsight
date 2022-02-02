import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Set TTL for Key`
  .meta({ type: 'smoke' })
  .page(commonUrl)
  .beforeEach(async t => {
      await t.maximizeWindow();
      await userAgreementPage.acceptLicenseTerms();
      await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
      await addNewStandaloneDatabase(ossStandaloneConfig);
  })
  .afterEach(async() => {
      await browserPage.deleteKey();
  })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can specify TTL for Key', async t => {
        const keyName = 'StringKey-Lorem ipsum dolor sit amet consectetur adipiscing elit';
        const ttlValue = '2147476121';
        //Create new key without TTL
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(keyName);
        //Open Key details
        await browserPage.openKeyDetails(keyName);
        //Click on TTL button to edit TTL
        await t.click(browserPage.editKeyTTLButton);
        //Set TTL value
        await t.typeText(browserPage.editKeyTTLInput, ttlValue);
        //Save the TTL value
        await t.click(browserPage.saveTTLValue);
        //Refresh the page in several seconds
        await t.wait(3000);
        await t.click(browserPage.refreshKeyButton);
        //Verify that TTL was updated
        const newTtlValue = await browserPage.ttlText.innerText;
        await t.expect(Number(ttlValue)).gt(Number(newTtlValue), 'ttlValue is greater than newTTLValue');
    });
