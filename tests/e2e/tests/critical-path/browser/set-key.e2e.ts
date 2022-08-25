import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const keyMember = '1111setMember11111';

fixture `Set Key fields verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search by part member name with pattern * in Set', async t => {
        keyName = chance.word({ length: 10 });
        await browserPage.addSetKey(keyName, keyTTL, '1111');
        //Add member to the Set key
        await browserPage.addMemberToSet(keyMember);
        //Search by part member name in the end
        await browserPage.searchByTheValueInSetKey('1111set*');
        //Check the search result
        let result = await browserPage.setMembersList.nth(0).textContent;
        await t.expect(result).eql(keyMember, 'The set member');
        //Search by part member name in the beggining
        await browserPage.searchByTheValueInSetKey('*Member11111');
        //Check the search result
        result = await browserPage.setMembersList.nth(0).textContent;
        await t.expect(result).eql(keyMember, 'The set member');
        //Search by part member name in the middle
        await browserPage.searchByTheValueInSetKey('1111*11111');
        //Check the search result
        result = await browserPage.setMembersList.nth(0).textContent;
        await t.expect(result).eql(keyMember, 'The set member');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search by full member name in Set', async t => {
        keyName = chance.word({ length: 10 });
        await browserPage.addSetKey(keyName, keyTTL, '1111');
        //Add member to the Set key
        await browserPage.addMemberToSet(keyMember);
        //Search by full member name
        await browserPage.searchByTheValueInSetKey(keyMember);
        //Check the search result
        const result = await browserPage.setMembersList.nth(0).textContent;
        await t.expect(result).eql(keyMember, 'The set member');
    });
