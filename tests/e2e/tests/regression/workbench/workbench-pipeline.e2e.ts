import { ClientFunction } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, SettingsPage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const settingsPage = new SettingsPage();

const getPageUrl = ClientFunction(() => window.location.href);
const externalPageLink = 'https://redis.io/docs/manual/pipelining/';
const pipelineValues = ['-5', '5', '4'];
const commandForSend = '100 INFO';

fixture `Workbench Pipeline`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Settings page - Pipeline mode
        await t.click(myRedisDatabasePage.settingsButton);
        await t.click(settingsPage.accordionAdvancedSettings);
    })
    .afterEach(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .meta({ env: env.web, rte: rte.standalone })('Verify that user can see the text in settings for pipeline with link', async t => {
        const pipelineText = 'Sets the size of a command batch for the pipeline(opens in a new tab or window) mode in Workbench. 0 or 1 pipelines every command.';
        // Verify text in setting for pipeline
        await t.expect(settingsPage.accordionAdvancedSettings.textContent).contains(pipelineText, 'Text is incorrect');
        await t.click(settingsPage.pipelineLink);
        // Check new opened window page with the correct URL
        await t.expect(getPageUrl()).eql(externalPageLink, 'The opened page is incorrect');
        await t.switchToParentWindow();
    });
test
    .meta({ rte: rte.standalone })('Verify that user can enter only numbers >0 in "Commands in pipeline" input', async t => {
        await t.hover(settingsPage.commandsInPipelineValue);
        await t.click(settingsPage.commandsInPipelineInput);
        await t.typeText(settingsPage.commandsInPipelineInput, pipelineValues[0], { replace: true });
        // Verify that negative number converted to positive
        await t.expect(settingsPage.commandsInPipelineInput.value).eql(pipelineValues[1], 'Value is incorrect');
    });
test
    .meta({ rte: rte.standalone })('Verify that only chosen in pipeline number of commands is loading at the same time in Workbench', async t => {
        await settingsPage.changeCommandsInPipeline(pipelineValues[2]);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        await workbenchPage.sendCommandInWorkbench(commandForSend, 0.01);
        // Verify that only selected pipeline number of commands are loaded at the same time
        await t.expect(workbenchPage.loadedCommand.count).eql(Number(pipelineValues[2]), 'The number of sending commands is incorrect');
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see spinner over Run button and grey preloader for each command', async t => {
        await settingsPage.changeCommandsInPipeline(pipelineValues[2]);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        await workbenchPage.sendCommandInWorkbench(commandForSend, 0.01);
        // Verify that user can`t start new commands from the Workbench while command(s) is executing
        await t.expect(workbenchPage.submitCommandButton.withAttribute('disabled').exists).ok('Loading spinner is not displayed for Run button', {timeout: 1000});
        // Verify that user can see spinner over the disabled and shrunk Run button
        await t.expect(workbenchPage.runButtonSpinner.exists).ok('Loading spinner is not displayed for Run button', {timeout: 5000});
        await t.expect(workbenchPage.queryCardContainer.find(workbenchPage.cssDeleteCommandButton).withAttribute('disabled').count).eql(4, 'The number of commands is incorrect');
    });
test
    .meta({ rte: rte.standalone })('Verify that user can interact with the Editor while command(s) in progress', async t => {
        const valueInEditor = '100';
        await settingsPage.changeCommandsInPipeline(pipelineValues[2]);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        await workbenchPage.sendCommandInWorkbench(commandForSend);
        await t.typeText(workbenchPage.queryInput, commandForSend, { replace: true, paste: true });
        await t.pressKey('enter');
        // 'Verify that user can interact with the Editor
        await t.expect(workbenchPage.queryInputScriptArea.textContent).contains(valueInEditor, {timeout: 5000});
    });
test
    .meta({ rte: rte.standalone })('Verify that command results are added to history in order most recent - on top', async t => {
        const multipleCommands = [
            'INFO',
            'FT._LIST',
            'FT.INFO',
            'RANDOMKEY',
            'CLIENT LIST'
        ];
        const reverseCommands = multipleCommands.slice().reverse();
        await settingsPage.changeCommandsInPipeline(pipelineValues[2]);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'));
        //Check that the results for all commands are displayed in workbench history in reverse order (most recent - on top)
        for (let i = 0; i < multipleCommands.length; i++) {
            await t.expect(workbenchPage.queryCardCommand.nth(i).textContent).contains(reverseCommands[i], 'Wrong order of commands');
        }
    });
