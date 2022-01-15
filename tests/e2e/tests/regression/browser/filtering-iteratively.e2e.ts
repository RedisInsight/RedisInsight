import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { DataTypesTexts } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();
const common = new Common();

fixture `Filtering iteratively in Browser page`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async(t) => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    })
test('Verify that user can see search results per 500 keys if number of results is 500', async t => {
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new keys
    const arr = await common.createArrayWithKeyValue(1000);
    await t.typeText(cliPage.cliCommandInput, `MSET ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Search all string keys
    await browserPage.selectFilterGroupType(DataTypesTexts.String)
    await browserPage.searchByKeyName('*');
    //Verify that scan more button is not shown
    await t.expect(browserPage.scanMoreButton.exists).ok('Scan more is shown');
    await t.click(browserPage.scanMoreButton);
    //Verify that number of results is 1000
    const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
    await t.expect(keysNumberOfResults).contains('1 000', 'Number of results is 1 000');
});
