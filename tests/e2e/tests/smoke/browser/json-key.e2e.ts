import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase, acceptLicenseAndConnectToRedisStack } from '../../../helpers/database';
import { BrowserPage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();
const addRedisDatabasePage = new AddRedisDatabasePage();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const value = '{"name":"xyz"}';
const jsonObjectValue = '{name:"xyz"}';

fixture `JSON Key verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        if(await addRedisDatabasePage.addDatabaseButton.visible) {
            await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        } else {
            await acceptLicenseAndConnectToRedisStack();
        }
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can create JSON object', async t => {
        keyName = chance.word({ length: 10 });
        //Add Json key with json object
        await browserPage.addJsonKey(keyName, keyTTL, value);
        //Check the notification message
        const notofication = await browserPage.getMessageText();
        await t.expect(notofication).contains('Key has been added', 'The notification');
        //Check the added key contains json object
        await t.expect(browserPage.addJsonObjectButton.exists).ok('The existence of the add Json object button', { timeout: 20000 });
        await t.expect(browserPage.jsonKeyValue.textContent).eql(jsonObjectValue, 'The json object value');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add key with value to any level of JSON structure', async t => {
        keyName = chance.word({ length: 10 });
        //Add Json key with json object
        await browserPage.addJsonKey(keyName, keyTTL, value);
        //Check the notification message
        const notofication = await browserPage.getMessageText();
        await t.expect(notofication).contains('Key has been added', 'The notification');
        //Add key with value on the same level
        await browserPage.addJsonKeyOnTheSameLevel('"key1"', '"value1"');
        //Check the added key contains json object with added key
        await t.expect(browserPage.addJsonObjectButton.exists).ok('The existence of the add Json object button', { timeout: 20000 });
        await t.expect(browserPage.jsonKeyValue.textContent).eql('{name:"xyz"key1:"value1"}', 'The json object value');
        //Add key with value inside the json
        await browserPage.addJsonKeyOnTheSameLevel('"key2"', '{}');
        await browserPage.addJsonKeyInsideStructure('"key2222"', '12345');
        //Check the added key contains json object with added key
        await t.click(browserPage.expandJsonObject);
        await t.expect(browserPage.jsonKeyValue.textContent).eql('{name:"xyz"key1:"value1"key2:{key2222:12345}}', 'The json object value');
    });
