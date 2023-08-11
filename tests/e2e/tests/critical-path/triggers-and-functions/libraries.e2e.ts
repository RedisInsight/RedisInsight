import * as path from 'path';
import { DatabaseHelper } from '../../../helpers/database';
import {
    BrowserPage,
    TriggersAndFunctionsFunctionsPage,
    TriggersAndFunctionsLibrariesPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossClusterRedisGears,
    ossStandaloneRedisGears,
} from '../../../helpers/conf';
import {  rte } from '../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const triggersAndFunctionsLibrariesPage = new TriggersAndFunctionsLibrariesPage();
const triggersAndFunctionsFunctionsPage = new TriggersAndFunctionsFunctionsPage();

const libraryName = Common.generateWord(5);
const streamKeyName = Common.generateWord(5);

const filePathes = {
    upload: path.join('..', '..', '..', 'test-data', 'triggers-and-functions', 'library.txt'),
    invoke: path.join('..', '..', '..', 'test-data', 'triggers-and-functions', 'invoke_function.txt')
};

fixture `Triggers and Functions`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears);
    })
    .afterEach(async() => {
        // Delete database
        await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    });
test('Verify that function can be invoked', async t => {
    const functionNameFromFile = 'function';
    const libNameFromFile = 'lib';
    const keyName = ['Hello'];
    const argumentsName = ['world', '!!!' ];
    const expectedCommand = `TFCALL "${libNameFromFile}.${functionNameFromFile}" "${keyName.length}" "${keyName}" "${argumentsName.join('" "')}"`;

    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    await t.click(triggersAndFunctionsLibrariesPage.addLibraryButton);
    await t.setFilesToUpload(triggersAndFunctionsLibrariesPage.uploadInput, [filePathes.invoke]);
    await t.click(triggersAndFunctionsLibrariesPage.addLibrarySubmitButton);
    await t.click(triggersAndFunctionsLibrariesPage.functionsLink);
    await t.click(triggersAndFunctionsFunctionsPage.getFunctionsNameSelector(functionNameFromFile));
    await t.click(triggersAndFunctionsFunctionsPage.invokeButton);
    await triggersAndFunctionsFunctionsPage.enterFunctionArguments(argumentsName);
    await triggersAndFunctionsFunctionsPage.enterFunctionKeyName(keyName);
    await t.click(triggersAndFunctionsFunctionsPage.runInCliButton);
    await t.expect(await triggersAndFunctionsFunctionsPage.Cli.getExecutedCommandTextByIndex()).eql(expectedCommand);
    await t.click(triggersAndFunctionsFunctionsPage.Cli.cliCollapseButton);
});

test.after(async() => {
    await browserPage.deleteKeyByNameFromList(streamKeyName);
    await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
    await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
})('Verify that user can open a Stream key from function', async t => {
    const command1 = `#!js api_version=1.0 name=${libraryName}`;
    const command2 = `redis.registerStreamTrigger('${LIBRARIES_LIST[3].name}', 'name', function(){});`;

    await browserPage.addStreamKey(streamKeyName, 'keyField', 'keyValue');
    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    await t.click(triggersAndFunctionsLibrariesPage.addLibraryButton);
    await triggersAndFunctionsLibrariesPage.sendTextToMonaco(MonacoEditorInputs.Code, command1, command2);
    await t.click(triggersAndFunctionsLibrariesPage.addLibrarySubmitButton);
    await t.click(triggersAndFunctionsLibrariesPage.functionsLink);
    await t.click(triggersAndFunctionsFunctionsPage.getFunctionsNameSelector(LIBRARIES_LIST[3].name));
    await t.click(triggersAndFunctionsFunctionsPage.invokeButton);
    await t.typeText(triggersAndFunctionsFunctionsPage.keyNameStreamFunctions, `${streamKeyName}*`);
    await t.click(triggersAndFunctionsFunctionsPage.findKeyButton);
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(streamKeyName)).ok('The stream key is not opened');
    await t.expect(browserPage.keyDetailsBadge.exists).ok('The key details is not opened');
});

test.before(async() => {
    await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterRedisGears);
}).after(async() => {
    await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterRedisGears);
})('Verify that function can be invoked in cluster', async t => {
    const functionNameFromFile = 'function';
    const libNameFromFile = 'lib';
    const keyName = ['Hello'];
    const argumentsName = ['world', '!!!' ];
    const expectedCommand = `TFCALL "${libNameFromFile}.${functionNameFromFile}" "${keyName.length}" "${keyName}" "${argumentsName.join('" "')}"`;

    await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
    await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
    await t.click(triggersAndFunctionsLibrariesPage.addLibraryButton);
    await t.setFilesToUpload(triggersAndFunctionsLibrariesPage.uploadInput, [filePathes.invoke]);
    await t.click(triggersAndFunctionsLibrariesPage.addLibrarySubmitButton);
    await t.click(triggersAndFunctionsLibrariesPage.functionsLink);
    await t.click(triggersAndFunctionsFunctionsPage.getFunctionsNameSelector(functionNameFromFile));
    await t.click(triggersAndFunctionsFunctionsPage.invokeButton);
    await triggersAndFunctionsFunctionsPage.enterFunctionArguments(argumentsName);
    await triggersAndFunctionsFunctionsPage.enterFunctionKeyName(keyName);
    await t.click(triggersAndFunctionsFunctionsPage.runInCliButton);
    await t.expect(await triggersAndFunctionsFunctionsPage.Cli.getExecutedCommandTextByIndex()).eql(expectedCommand);
    await t.click(triggersAndFunctionsFunctionsPage.Cli.cliCollapseButton);
});
