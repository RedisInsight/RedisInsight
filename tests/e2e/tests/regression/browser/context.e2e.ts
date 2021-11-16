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

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();

const keyName = 'keyForContext!';

fixture `Browser Context`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async t => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    })
test('Verify that if user has saved context on Browser page and go to Settings page, Browser and Workbench icons are displayed and user is able to open Browser with saved context', async t => {
    const command = 'HSET';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Create context modificaions and navigate to Settings
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    await t.click(cliPage.cliExpandButton);
    await t.typeText(cliPage.cliCommandInput, command);
    await t.pressKey('enter');
    await t.click(myRedisDatabasePage.settingsButton);
    //Verify that Browser and Workbench icons are displayed
    await t.expect(await myRedisDatabasePage.browserButton.visible).ok('Browser icon is displayed');
    await t.expect(await myRedisDatabasePage.workbenchButton.visible).ok('Workbench icon is displayed');
    //Open Browser page and verify context
    await t.click(myRedisDatabasePage.browserButton);
    await t.expect(await browserPage.filterByPatterSearchInput.withAttribute('value', keyName).exists).ok('Filter per key name is still applied');
    await t.expect(await browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('The key details is selected');
    await t.expect(await cliPage.cliCommandExecuted.withExactText(command).exists).ok(`Executed command '${command}' in CLI is saved`);
    await t.click(cliPage.cliCollapseButton);
});
test('Verify that when user reload the window with saved context(on any page), context is not saved when he returns back to Browser page', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Create context modificaions and navigate to Workbench
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    await t.click(myRedisDatabasePage.workbenchButton);
    //Open Browser page and verify context
    await t.click(myRedisDatabasePage.browserButton);
    await t.expect(await browserPage.filterByPatterSearchInput.withAttribute('value', keyName).exists).ok('Filter per key name is still applied');
    await t.expect(await browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('The key details is selected');
    //Navigate to Workbench and reload the window
    await t.click(myRedisDatabasePage.workbenchButton);
    await t.eval(() => location.reload());
    //Return back to Browser and check context is not saved
    await t.click(myRedisDatabasePage.browserButton);
    await t.expect(await browserPage.filterByPatterSearchInput.withAttribute('value', keyName).exists).notOk('Filter per key name is not applied');
    await t.expect(await browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('The key details is not selected');
});
