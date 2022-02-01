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

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Edit Key names verification`
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
    .meta({ rte: 'standalone' })
    ('Verify that user can edit String Key name', async t => {
        const keyName = 'String1testKeyForEditName';
        const keyTTL = '2147476121';
        const keyNameAfter = 'NewStringNameAfterEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(keyName, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can edit Set Key name', async t => {
        const keyName = 'Set1testKeyForEditName';
        const keyTTL = '2147476121';
        const keyNameAfter = 'NewSetNameAfterEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addSetKey(keyName, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can edit Zset Key name', async t => {
        const keyName = 'Zset1testKeyForEditName';
        const keyTTL = '2147476121';
        const keyNameAfter = 'NewZsetNameAfterEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addZSetKey(keyName, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can edit Hash Key name', async t => {
        const keyName = 'Hash1testKeyForEditName';
        const keyTTL = '2147476121';
        const keyNameAfter = 'NewHashNameAfterEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addHashKey(keyName, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can edit List Key name', async t => {
        const keyName = 'List1testKeyForEditName';
        const keyTTL = '2147476121';
        const keyNameAfter = 'NewListNameAfterEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addListKey(keyName, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can edit JSON Key name', async t => {
        const keyName = 'JSON1testKeyForEditName';
        const keyTTL = '2147476121';
        const keyValue = '{"name":"xyz"}';
        const keyNameAfter = 'NewJSONNameAfterEdit!';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addJsonKey(keyName, keyTTL, keyValue);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
