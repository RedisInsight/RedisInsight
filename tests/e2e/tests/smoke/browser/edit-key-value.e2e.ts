import { rte } from '../../../helpers/constants';
import { deleteDatabase, acceptTermsAddDatabaseOrConnectToRedisStack } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

fixture `Edit Key values verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit String value', async t => {
        keyName = chance.word({ length: 10 });
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
