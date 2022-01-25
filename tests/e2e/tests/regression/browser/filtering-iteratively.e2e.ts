import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { KeyTypesTexts } from '../../../helpers/constants';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const common = new Common();

fixture `Filtering iteratively in Browser page`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see search results per 500 keys if number of results is 500', async t => {
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new keys
    const arr = await common.createArrayWithKeyValue(500);
    await t.typeText(cliPage.cliCommandInput, `MSET ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Search all keys
    await browserPage.searchByKeyName('*');
    const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
    //Verify that number of results is 500
    await t.expect(keysNumberOfResults).contains('500', 'Number of results is 500');
});
test('Verify that user can search iteratively via Scan more for search pattern and selected data type', async t => {
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new keys
    const arr = await common.createArrayWithKeyValue(1000);
    await t.typeText(cliPage.cliCommandInput, `MSET ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Search all string keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.String)
    await browserPage.searchByKeyName('*');
    //Verify that scan more button is not shown
    await t.expect(browserPage.scanMoreButton.exists).ok('Scan more is shown');
    await t.click(browserPage.scanMoreButton);
    //Verify that number of results is 1000
    const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
    await t.expect(keysNumberOfResults).contains('1 000', 'Number of results is 1 000');
});
