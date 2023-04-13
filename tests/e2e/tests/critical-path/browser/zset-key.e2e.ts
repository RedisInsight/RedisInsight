import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { rte } from '../../../helpers/constants';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const common = new Common();

let keyName = common.generateWord(10);
const keyTTL = '2147476121';
const keyMember = '1111ZsetMember11111';

fixture `ZSet Key fields verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can search by member in Zset', async t => {
    keyName = common.generateWord(10);
    await browserPage.addZSetKey(keyName, '0', keyTTL, '12345qwerty');
    // Add member to the ZSet key
    await browserPage.addMemberToZSet(keyMember, '3');
    // Search by member name
    await browserPage.searchByTheValueInKeyDetails(keyMember);
    // Check the search result
    const result = await browserPage.zsetMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The Zset member');
});
test('Verify that user can sort Zset members by score by DESC and ASC', async t => {
    keyName = common.generateWord(10);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    //Create new key with a lot of members
    const arr = await common.createArray(100);
    await t.typeText(browserPage.Cli.cliCommandInput, `ZADD ${keyName} ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(browserPage.Cli.cliCollapseButton);
    // Open key details
    await browserPage.openKeyDetails(keyName);
    // Sort Zset members by score by DESC and verify result
    await t.click(browserPage.scoreButton);
    let result = await browserPage.zsetScoresList.textContent;
    await t.expect(result).eql(arr[100 - 1], 'The Zset sort by desc');
    // Sort Zset members by score by ASC and verify result
    await t.click(browserPage.scoreButton);
    result = await browserPage.zsetScoresList.textContent;
    await t.expect(result).eql(arr[1], 'The Zset sort by desc');
});
