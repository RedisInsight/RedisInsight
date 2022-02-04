import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyNameBefore = chance.word({ length: 10 });
let keyNameAfter = chance.word({ length: 10 });

fixture `Edit Key names verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyNameAfter);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit String Key name', async t => {
        keyNameBefore = chance.word({ length: 10 });
        keyNameAfter = chance.word({ length: 10 });
        const keyTTL = '2147476121';

        await browserPage.addStringKey(keyNameBefore, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit Set Key name', async t => {
        keyNameBefore = chance.word({ length: 10 });
        keyNameAfter = chance.word({ length: 10 });
        const keyTTL = '2147476121';

        await browserPage.addSetKey(keyNameBefore, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit Zset Key name', async t => {
        keyNameBefore = chance.word({ length: 10 });
        keyNameAfter = chance.word({ length: 10 });
        const keyTTL = '2147476121';

        await browserPage.addZSetKey(keyNameBefore, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit Hash Key name', async t => {
        keyNameBefore = chance.word({ length: 10 });
        keyNameAfter = chance.word({ length: 10 });
        const keyTTL = '2147476121';

        await browserPage.addHashKey(keyNameBefore, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit List Key name', async t => {
        keyNameBefore = chance.word({ length: 10 });
        keyNameAfter = chance.word({ length: 10 });
        const keyTTL = '2147476121';

        await browserPage.addListKey(keyNameBefore, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can edit JSON Key name', async t => {
        keyNameBefore = chance.word({ length: 10 });
        keyNameAfter = chance.word({ length: 10 });
        const keyTTL = '2147476121';
        const keyValue = '{"name":"xyz"}';

        await browserPage.addJsonKey(keyNameBefore, keyTTL, keyValue);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Key Name');
        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Key Name');
    });
