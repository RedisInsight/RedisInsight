import * as path from 'path';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    BrowserPage,
    TriggersAndFunctionsFunctionsPage,
    TriggersAndFunctionsLibrariesPage
} from '../../../pageObjects';
import { commonUrl, ossStandaloneRedisGears } from '../../../helpers/conf';
import { FunctionsSections, LibrariesSections, MonacoEditorInputs, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { TriggersAndFunctionLibrary } from '../../../interfaces/triggers-and-functions';
import { CommonElementsActions } from '../../../common-actions/common-elements-actions';

const browserPage = new BrowserPage();
const triggersAndFunctionsLibrariesPage = new TriggersAndFunctionsLibrariesPage();
const triggersAndFunctionsFunctionsPage = new TriggersAndFunctionsFunctionsPage();

const libraryName = 'lib';

//const filesToUpload = ['bulkUplAllKeyTypes.txt', 'bigKeysData.rtf'];
const filePath =  path.join('..', '..', '..', 'test-data', 'triggers-and-functions', 'library.txt');

const LIBRARIES_LIST = [
    { name: 'Function1', type: LibrariesSections.Functions },
    { name: 'function2', type: LibrariesSections.Functions },
    { name: 'AsyncFunction', type: LibrariesSections.Functions },
    { name: 'StreamTrigger', type: LibrariesSections.StreamFunctions },
    { name: 'ClusterFunction', type: LibrariesSections.ClusterFunctions },
    { name: 'keySpaceTrigger', type: LibrariesSections.KeyspaceTriggers }
];

fixture `Triggers and Functions`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears, ossStandaloneRedisGears.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    });

test('Verify that when user can see added library', async t => {

    const item = { name: libraryName, user: 'default', pending: 0, totalFunctions: 1 } as TriggersAndFunctionLibrary;
    const command = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName}\\n redis.registerFunction(\'foo\', ()=>{return \'bar\'})"`;
    await browserPage.Cli.sendCommandInCli(command);
    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    const row =  await triggersAndFunctionsLibrariesPage.getLibraryItem(libraryName);
    await t.expect(row.name).eql(item.name, 'library name is unexpected');
    await t.expect(row.user).eql(item.user, 'user name is unexpected');
    await t.expect(row.pending).eql(item.pending, 'user name is unexpected');
    await t.expect(row.totalFunctions).eql(item.totalFunctions, 'user name is unexpected');
});

test('Verify that library details is displayed', async t => {
    const command = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName}\\n
            redis.registerFunction('${LIBRARIES_LIST[0].name}', function(){});
            redis.registerFunction('${LIBRARIES_LIST[1].name}', function(){});
            redis.registerAsyncFunction('${LIBRARIES_LIST[2].name}', function(){});
            redis.registerStreamTrigger('${LIBRARIES_LIST[3].name}', 'name', function(){});
            redis.registerClusterFunction('${LIBRARIES_LIST[4].name}', async function(){});
            redis.registerKeySpaceTrigger('${LIBRARIES_LIST[5].name}','',function(){});"`;

    await browserPage.Cli.sendCommandInCli(command);

    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    await t.click(await triggersAndFunctionsLibrariesPage.getLibraryNameSelector(libraryName));

    for (const { name, type } of LIBRARIES_LIST) {
        await t.expect(await triggersAndFunctionsLibrariesPage.getFunctionsByName(type, name).exists).ok(`library is not displayed in ${type} section`);
    }
});

test('Verify that user can modify  code', async t => {
    const command = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName}\\n redis.registerFunction(\'foo\', ()=>{return \'bar\'});"`;
    const commandUpdatedPart1 = `#!js api_version=1.0 name=${libraryName}`;
    const commandUpdatedPart2 = ' redis.registerFunction(\'foo\', ()=>{return \'bar new\'});';
    const configuration = '{"redisgears_2.lock-redis-timeout": 1000}';

    await browserPage.Cli.sendCommandInCli(command);
    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    await t.click(await triggersAndFunctionsLibrariesPage.getLibraryNameSelector(libraryName));
    await t.click(triggersAndFunctionsLibrariesPage.editMonacoButton);
    await triggersAndFunctionsLibrariesPage.sendTextToMonaco(MonacoEditorInputs.Library, commandUpdatedPart1, commandUpdatedPart2);
    await t.click(triggersAndFunctionsLibrariesPage.acceptButton);
    await t.expect(
        (await triggersAndFunctionsLibrariesPage.getTextFromMonaco())).eql(commandUpdatedPart1 + commandUpdatedPart2), 'code was not updated';

    await t.click(await triggersAndFunctionsLibrariesPage.configurationLink);
    await t.click(triggersAndFunctionsLibrariesPage.editMonacoButton);
    await triggersAndFunctionsLibrariesPage.sendTextToMonaco(MonacoEditorInputs.LibraryConfiguration, configuration);
    await t.click(triggersAndFunctionsLibrariesPage.acceptButton);
    await t.expect(
        (await triggersAndFunctionsLibrariesPage.getTextFromMonaco())).eql(configuration, 'configuration was not added');
});

test('Verify that function details is displayed', async t => {
    const command = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName}\\n
            redis.registerAsyncFunction('${LIBRARIES_LIST[2].name}', function(client){
        return client.call('ping');},{flags: [redis.functionFlags.RAW_ARGUMENTS]});"`;
    const functionDetails = { libraryName: libraryName, isAsync: 'isAsync:Yes', flag: 'raw-arguments' };

    await browserPage.Cli.sendCommandInCli(command);
    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(await triggersAndFunctionsFunctionsPage.getFunctionsNameSelector(LIBRARIES_LIST[2].name));
    let fieldsAndValue = await triggersAndFunctionsFunctionsPage.getFieldsAndValuesBySection(FunctionsSections.General);
    await t.expect(fieldsAndValue).contains(functionDetails.libraryName, 'library name is not corrected');
    await t.expect(fieldsAndValue).contains(functionDetails.isAsync, 'async is not corrected');

    fieldsAndValue = await triggersAndFunctionsFunctionsPage.getFieldsAndValuesBySection(FunctionsSections.Flag);
    await t.expect(fieldsAndValue).contains(functionDetails.flag, 'flag name is not displayed');
});
test('Verify that library and functions can be deleted', async t => {

    const libraryName2 = `${libraryName}2`;
    const command1 = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName}\\n redis.registerFunction(\'${LIBRARIES_LIST[0].name}\', ()=>{return \'bar\'})"`;
    const command2 = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName2}\\n redis.registerFunction(\'${LIBRARIES_LIST[1].name}\', ()=>{return \'bar\'})"`;
    await browserPage.Cli.sendCommandInCli(command1);
    await browserPage.Cli.sendCommandInCli(command2);
    await t.click(await browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(await triggersAndFunctionsFunctionsPage.librariesLink);
    await triggersAndFunctionsLibrariesPage.deleteLibraryByName(libraryName2);
    await t.expect(await triggersAndFunctionsLibrariesPage.getLibraryNameSelector(libraryName2).exists).notOk(`the library ${libraryName2} was not deleted`);
    await t.click(triggersAndFunctionsLibrariesPage.functionsLink);
    await t.expect(await triggersAndFunctionsFunctionsPage.getFunctionsNameSelector(LIBRARIES_LIST[1].name).exists).notOk(`the functions ${LIBRARIES_LIST[1].name} was not deleted`);
});
test('Verify that library can be uploaded', async t => {
    const configuration = '{"redisgears_2.lock-redis-timeout": 1000}';
    const functionNameFromFile = 'function';

    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    await t.click(triggersAndFunctionsLibrariesPage.addLibraryButton);
    await t.setFilesToUpload(triggersAndFunctionsLibrariesPage.uploadInput, [filePath]);
    const uploadedText = await triggersAndFunctionsLibrariesPage.getTextFromMonaco();
    await t.expect(uploadedText.length).gte(1, 'file was not uploaded');
    await CommonElementsActions.checkCheckbox(triggersAndFunctionsLibrariesPage.addConfigurationCheckBox, true);
    await triggersAndFunctionsLibrariesPage.sendTextToMonaco(MonacoEditorInputs.Configuration, configuration);
    await t.click(await triggersAndFunctionsLibrariesPage.addLibrarySubmitButton);
    await t.expect(triggersAndFunctionsLibrariesPage.getLibraryNameSelector(libraryName).exists).ok('the library was not added');
    await t.expect(triggersAndFunctionsLibrariesPage.getFunctionsByName(LibrariesSections.Functions, functionNameFromFile).exists).ok('the library information was not opened');
});

