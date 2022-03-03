import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase, acceptLicenseAndConnectToRedisStack } from '../../../helpers/database';
import { BrowserPage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();
const addRedisDatabasePage = new AddRedisDatabasePage();

let keyName = chance.word({ length: 10 });

fixture `Set TTL for Key`
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
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can specify TTL for Key', async t => {
        keyName = chance.word({ length: 10 });
        const ttlValue = '2147476121';
        //Create new key without TTL
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
