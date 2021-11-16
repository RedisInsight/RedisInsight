import { addOSSClusterDatabase, addNewStandaloneDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossClusterConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const cliPage = new CliPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const common = new Common();

const pairsToSet = common.createArrayPairsWithKeyValue(4);
const MAX_AUTOCOMPLETE_EXECUTIONS = 100;

fixture `CLI critical`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
    })
test
    .after(async t => {
        //Clear database
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
    })
    ('Verify that user is redirected to another node when he works in CLI with OSS Cluster', async t => {
        await addOSSClusterDatabase(ossClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Add key from CLI
        for (const [key, value] of pairsToSet) {
            await t.typeText(cliPage.cliCommandInput, `SET ${key} ${value}`);
            await t.pressKey('enter');
        }
        //Check that the key is added
        const redirectedText = cliPage.cliOutputResponseSuccess.withText('Redirected to')
        await t.expect(redirectedText.exists).ok('User command was redirected to another node');
    });
test('Verify that Redis returns error if command is not correct when user works with CLI', async t => {
    await addNewStandaloneDatabase(ossStandaloneConfig);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);

    await t.typeText(cliPage.cliCommandInput, 'SET key');
    await t.pressKey('enter');
    //Check error
    const errWrongArgs = cliPage.cliOutputResponseFail.withText('ERR wrong number of arguments for \'set\' command')
    await t.expect(errWrongArgs.exists).ok('Error with wrong number of arguments was shown');

    await t.typeText(cliPage.cliCommandInput, 'lorem');
    await t.pressKey('enter');
    //Check error
    const errWrongCmnd = cliPage.cliOutputResponseFail.withText('ERR unknown command')
    await t.expect(errWrongCmnd.exists).ok('Error unknown command was shown');
});
test('Verify that user can scroll commands using "Tab" in CLI & execute it', async t => {
    const commandToAutoComplete = 'INFO';
    const commandStartsWith = 'I';
    await addNewStandaloneDatabase(ossStandaloneConfig);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    await t.typeText(cliPage.cliCommandInput, commandStartsWith);
    //Press tab while we won't find 'INFO' command
    //Avoid endless cycle
    let operationsCount = 0;
    while (await cliPage.cliCommandInput.textContent !== commandToAutoComplete && operationsCount < MAX_AUTOCOMPLETE_EXECUTIONS) {
        await t.pressKey('tab');
        ++operationsCount;
    }
    await t.pressKey('enter');
    //Check that command was executed and user got success result
    await t.expect(cliPage.cliOutputResponseSuccess.exists).ok('Command from autocomplete was found & executed');
});
