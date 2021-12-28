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
import { KeyTypesTexts } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();
const common = new Common();

const speed = 0.4;

fixture `Browser Context`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
test('Verify that user can see saved CLI size on Browser page when he returns back to Browser page', async t => {
    const offsetY = 200;

    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

    await t.click(cliPage.cliExpandButton);
    const cliAreaHeight = await cliPage.cliArea.clientHeight;
    const cliResizeButton = await cliPage.cliResizeButton;
    // move resize 200px up
    await t.drag(cliResizeButton, 0, -offsetY, { speed });
    await t.click(myRedisDatabasePage.myRedisDBButton);

    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

    await t.expect(await cliPage.cliArea.clientHeight).eql(cliAreaHeight + offsetY, 'Saved context for resizable cli is proper');
});
test('Verify that user can see saved Key details and Keys tables size on Browser page when he returns back to Browser page', async t => {
    const offsetX = 50;

    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

    const keyListWidth = await browserPage.keyListTable.clientWidth;
    const cliResizeButton = await browserPage.resizeBtnKeyList;
    // move resize 200px right
    await t.drag(cliResizeButton, offsetX, 0, { speed });
    await t.click(myRedisDatabasePage.myRedisDBButton);

    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    
    await t.expect(await browserPage.keyListTable.clientWidth).eql(keyListWidth + offsetX, 'Saved browser resizable context is proper');
});
test('Verify that user can see saved filter per key type applied when he returns back to Browser page', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Filter per key type Strting and open Settings
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await t.click(myRedisDatabasePage.settingsButton);
    //Return back to Browser and check filter applied
    await t.click(myRedisDatabasePage.browserButton);
    await t.expect(await browserPage.selectedFilterTypeString.visible).eql(true, 'Filter per key type is still applied');
});
test('Verify that user can see saved executed commands in CLI on Browser page when he returns back to Browser page', async t => {
    const commands = [
      'SET key 1',
      'FLUSHDB'
    ];
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Execute command in CLI and open Settings page
    await t.click(cliPage.cliExpandButton);
    for(const command of commands) {
        await t.typeText(cliPage.cliCommandInput, command);
        await t.pressKey('enter');
    }
    await t.click(myRedisDatabasePage.settingsButton);
    //Return back to Browser and check executed command in CLI
    await t.click(myRedisDatabasePage.browserButton);
    for(const command of commands) {
        await t.expect(await cliPage.cliCommandExecuted.withExactText(command).exists).ok(`Executed command '${command}' in CLI is saved`);
    }
});
test('Verify that user can see saved input entered into the filter per Key name when he returns back to Browser page', async t => {
    const keyName = 'keyName123!.//';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Filter per key name and open Settings
    await browserPage.searchByKeyName(keyName);
    await t.click(myRedisDatabasePage.settingsButton);
    //Return back to Browser and check filter applied
    await t.click(myRedisDatabasePage.browserButton);
    await t.expect(await browserPage.filterByPatterSearchInput.withAttribute('value', keyName).exists).ok('Filter per key name is still applied');
});
test
    .after(async t => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    })
    ('Verify that user can see key details selected when he returns back to Browser page', async t => {
        const keyName = 'keyForDetails!';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add and open new key details and navigate to Settings
        await browserPage.addHashKey(keyName);
        await browserPage.openKeyDetails(keyName);
        await t.click(myRedisDatabasePage.settingsButton);
        //Return back to Browser and check key details selected
        await t.click(myRedisDatabasePage.browserButton);
        await t.expect(await browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('The key details is selected');
    });
test
    .after(async t => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    })
    ('Verify that user can see list of keys viewed on Browser page when he returns back to Browser page', async t => {
        const numberOfItems = 5000;
        const scrollY = 3200;
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Create new keys
        const keys = await common.createArrayWithKeyValue(numberOfItems);
        await t.typeText(cliPage.cliCommandInput, `MSET ${keys.join(' ')}`, {paste: true});
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);

        await t.click(browserPage.refreshKeysButton)

        const keyList = await browserPage.keyListTable;
        const keyListSGrid = await keyList.find(browserPage.cssSelectorGrid);

        //Scroll key list
        await t.scroll(keyListSGrid, 0, scrollY);

        //Find any key from list that is visible
        const renderedRows = await keyList.find(browserPage.cssSelectorRows);
        const renderedRowsCount = await renderedRows.count;
        const randomKey = renderedRows.nth(Math.floor((Math.random() * renderedRowsCount)));
        const randomKeyName = await randomKey.find(browserPage.cssSelectorKey).textContent;

        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        //Check that previous found key is still visible
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(randomKeyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('Scrolled position and saved key list is proper');
    });
