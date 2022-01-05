import { ClientFunction } from 'testcafe';
import { addNewStandaloneDatabase } from '../../../helpers/database'
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const cliPage = new CliPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const COMMAND_GROUP_JSON = 'JSON';
const COMMAND_GROUP_SEARCH = 'Search';
const COMMAND_GROUP_HyperLogLog = 'HyperLogLog';

fixture `CLI Command helper`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })

const getPageUrl = ClientFunction(() => window.location.href);

test('Verify that user can see in Command helper and click on new group "JSON", can choose it and see list of commands in the group', async t => {
    const commandForCheck = 'JSON.SET';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from the list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_JSON);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify results of opened command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('JSON.SET key path value [NX|XX]', 'Selected command title');
    //Click on Read More link for selected command
    await t.click(cliPage.readMoreButton);
    //Check new opened window page with the correct URL
    await t.expect(getPageUrl()).contains('/#jsonset');
    //Check that command info is displayed on the page
    await t.expect(cliPage.cliReadMoreJSONCommandDocumentation().textContent).contains('JSON.SET');
});
test('Verify that user can see in Command helper and click on new group "Search", can choose it and see list of commands in the group', async t => {
    const commandForCheck = 'FT.EXPLAIN';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from the list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SEARCH);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify results of opened command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('FT.EXPLAIN index query', 'Selected command title');
    //Click on Read More link for selected command
    await t.click(cliPage.readMoreButton);
    //Check new opened window page with the correct URL
    await t.expect(getPageUrl()).contains('/#ftexplain');
    //Check that command info is displayed on the page
    await t.expect(cliPage.cliReadMoreRediSearchCommandDocumentation().textContent).contains('FT.EXPLAIN');
});
test('Verify that user can see HyperLogLog title in Command Helper for this command group', async t => {
    const commandForCheck = 'PFCOUNT';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from the list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_HyperLogLog);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify results of opened command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('PFCOUNT key [key ...]', 'Selected command title');
    //Click on Read More link for selected command
    await t.click(cliPage.readMoreButton);
    //Check new opened window page with the correct URL
    await t.expect(getPageUrl()).contains('/pfcount');
});
test('Verify that user can see all separated groups for AI json file (model, tensor, inference, script)', async t => {
    const AIGroups = [
        'Model',
        'Script',
        'Inference',
        'Tensor'
    ];
    const commandsForCheck = [
        'AI.MODELDEL',
        'AI.SCRIPTSTORE',
        'AI.SCRIPTEXECUTE',
        'AI.TENSORSET'
    ];
    const commandArgumentsCheck = [
        'AI.MODELDEL key',
        'AI.SCRIPTSTORE key CPU|GPU [TAG tag] ENTRY_POINTS entry_point_count entry_point [entry_point ...]',
        'AI.SCRIPTEXECUTE key function [KEYS key_count key [key ...]] [INPUTS input_count input [input ...]] [ARGS arg_count arg [arg ...]] [OUTPUTS output_count output [output ...]] [TIMEOUT timeout]',
        'AI.TENSORSET key FLOAT|DOUBLE|INT8|INT16|INT32|INT64|UINT8|UINT16|STRING|BOOL shape [shape ...] [BLOB blob] [VALUES value [VALUES value ...]]'
    ];
    const ExternalPage = [
        '/#aimodeldel',
        '/#aiscriptstore',
        '/#aiscriptexecute',
        '/#aitensorset'
    ];
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    let i = 0;
    while (i <= 3) {
        //Select one group from the list
        await cliPage.selectFilterGroupType(AIGroups[i]);
        //Click on the group
        await t.click(cliPage.cliHelperOutputTitles.withExactText(commandsForCheck[i]));
        //Verify results of opened command
        await t.expect(cliPage.cliHelperTitleArgs.textContent).eql(commandArgumentsCheck[i], 'Selected command title');
        //Click on Read More link for selected command
        await t.click(cliPage.readMoreButton);
        //Check new opened window page with the correct URL
        await t.expect(getPageUrl()).contains(ExternalPage[i]);
        //Close the window with external link to switch to the application window
        await t.closeWindow();
        i++;
    }
});
test('Verify that user can open/close CLI separately from Command Helper', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Verify that CLI is opened separately
    await t.expect(cliPage.commandHelperArea.visible).notOk('Command Helper is closed');
    await t.expect(cliPage.cliCollapseButton.visible).ok('CLI is opended');
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Verify that user can close CLI separately
    await t.click(cliPage.cliCollapseButton);
    await t.expect(cliPage.commandHelperArea.visible).ok('Command Helper is displayed');
    await t.expect(cliPage.cliCollapseButton.visible).notOk('CLI is closed');
});
test('Verify that user can open/close Command Helper separately from CLI', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Verify that Command Helper is opened separately
    await t.expect(cliPage.commandHelperArea.visible).ok('Command Helper is opened');
    await t.expect(cliPage.cliCollapseButton.visible).notOk('CLI is closed');
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Verify that Command Helper is closed separately
    await t.click(cliPage.closeCommandHelperButton);
    await t.expect(cliPage.commandHelperArea.visible).notOk('Command Helper is closed');
    await t.expect(cliPage.cliCollapseButton.visible).ok('CLI is opended');
});
