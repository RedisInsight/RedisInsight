import { toNumber } from 'lodash';
import { rte } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const keyTTL = '2147476121';
const elements = ['1111listElement11111', '2222listElement22222', '33333listElement33333'];

fixture `List Key verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can search List element by index', async t => {
    keyName = Common.generateWord(10);
    await browserPage.addListKey(keyName, keyTTL, elements[0]);
    // Add few elements to the List key
    await browserPage.addElementToList(elements[1]);
    await browserPage.addElementToList(elements[2]);
    // Search List element by index
    await browserPage.searchByTheValueInKeyDetails('1');
    // Check the search result
    const result = await browserPage.listElementsList.nth(0).textContent;
    await t.expect(result).eql(elements[1], 'The list elemnt with searched index not found');
});
test
    .before(async() => {
        // add oss standalone v5
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config);
    })
    .after(async() => {
        //Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneV5Config.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })('Verify that user can remove only one element for List for Redis v. <6.2', async t => {
        keyName = Common.generateWord(10);
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Create new key
        await t.typeText(browserPage.Cli.cliCommandInput, `LPUSH ${keyName} 1 2 3 4 5`);
        await t.pressKey('enter');
        await t.click(browserPage.Cli.cliCollapseButton);
        // Remove element from the key
        await browserPage.openKeyDetails(keyName);
        const lengthBeforeRemove = (await browserPage.keyLengthDetails.textContent).split(': ')[1];
        await browserPage.removeListElementFromHeadOld();
        // Check that only one element is removed
        const lengthAfterRemove = (await browserPage.keyLengthDetails.textContent).split(': ')[1];
        const removedElements = toNumber(lengthBeforeRemove) - toNumber(lengthAfterRemove);
        await t.expect(removedElements).eql(1, 'only one element is removed');
    });
