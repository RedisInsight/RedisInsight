import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, TriggersAndFunctionsLibrariesPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneRedisGears
} from '../../../helpers/conf';
import { rte, LibrariesSections, FunctionsSections } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { TriggersAndFunctionLibrary } from '../../../interfaces/triggers-and-functions';
import { TriggersAndFunctionsFunctionsPage } from '../../../pageObjects/triggers-and-functions-functions-page';

const browserPage = new BrowserPage();
const triggersAndFunctionsLibrariesPage = new TriggersAndFunctionsLibrariesPage();
const triggersAndFunctionsFunctionsPage = new TriggersAndFunctionsFunctionsPage();

const libraryName = 'lib';

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
        await deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    });

test
    .after(async() => {
        await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    })('Verify that when user can see added library', async t => {

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

test
    .after(async() => {
        await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    })('Verify that library details is displayed', async t => {
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

test
    .after(async() => {
        await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    })('Verify that user can modify  code', async t => {
        const command = `TFUNCTION LOAD "#!js api_version=1.0 name=${libraryName}\\n redis.registerFunction(\'foo\', ()=>{return \'bar\'});"`;
        const commandUpdatedPart1 = `#!js api_version=1.0 name=${libraryName}`;
        const commandUpdatedPart2 = ' redis.registerFunction(\'foo\', ()=>{return \'bar new\'});';
        const configuration = '{"redisgears_2.lock-redis-timeout": 1000}';

        await browserPage.Cli.sendCommandInCli(command);
        await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
        await t.click(triggersAndFunctionsFunctionsPage.librariesLink);
        await t.click(await triggersAndFunctionsLibrariesPage.getLibraryNameSelector(libraryName));
        await t.click(triggersAndFunctionsLibrariesPage.editMonacoButton);
        await triggersAndFunctionsLibrariesPage.sendTextToMonaco(commandUpdatedPart1, commandUpdatedPart2);

        await t.expect(
            (await triggersAndFunctionsLibrariesPage.getTextToMonaco())).eql(commandUpdatedPart1 + commandUpdatedPart2), 'code was not updated';

        await t.click(await triggersAndFunctionsLibrariesPage.configurationLink);
        await t.click(triggersAndFunctionsLibrariesPage.editMonacoButton);
        await triggersAndFunctionsLibrariesPage.sendTextToMonaco(configuration);
        await t.expect(
            (await triggersAndFunctionsLibrariesPage.getTextToMonaco())).eql(configuration, 'configuration was not added');
    });

test.only
    .after(async() => {
        await browserPage.Cli.sendCommandInCli(`TFUNCTION DELETE ${libraryName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisGears);
    })('Verify that function details is displayed', async t => {
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

