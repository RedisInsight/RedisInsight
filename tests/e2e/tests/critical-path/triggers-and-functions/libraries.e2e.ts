import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, TriggersAndFunctionsPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneRedisGears
} from '../../../helpers/conf';
import { rte, LibrariesSections } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { TriggersAndFunctionLibrary } from '../../../interfaces/triggers-and-functions';

const browserPage = new BrowserPage();
const triggersAndFunctionsPage = new TriggersAndFunctionsPage();

const libraryName = 'lib';

const LIBRARIES_LIST = [
    { name: 'Function1', type: LibrariesSections.Functions },
    { name: 'function2', type: LibrariesSections.Functions },
    { name: 'AsyncFunction', type: LibrariesSections.Functions },
    { name: 'StreamTrigger', type: LibrariesSections.StreamFunctions },
    { name: 'ClusterFunction', type: LibrariesSections.ClusterFunctions },
    { name: 'keySpaceTrigger', type: LibrariesSections.KeyspaceTriggers },
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
        const row =  await triggersAndFunctionsPage.getLibraryItem(libraryName);
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
            redis.registerFunction('${LIBRARIES_LIST[0]}', function(){});
            redis.registerFunction('${LIBRARIES_LIST[1]}', function(){});
            redis.registerAsyncFunction('${LIBRARIES_LIST[2]}', function(){});
            redis.registerStreamTrigger('${LIBRARIES_LIST[3]}', 'name', function(){});
            redis.registerClusterFunction('${LIBRARIES_LIST[4]}', async function(){});
            redis.registerKeySpaceTrigger('${LIBRARIES_LIST[5]}','',function(){});"`;

        await browserPage.Cli.sendCommandInCli(command);

        await t.click(browserPage.NavigationPanel.triggeredFunctionsButton);
        await t.click(await triggersAndFunctionsPage.getLibraryNameSelector(libraryName));

        for (const { name, type } of LIBRARIES_LIST) {
            await t.expect(await triggersAndFunctionsPage.getFunctionsByName(type, name).exists).ok(`library is not displayed in ${type} section`);
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
        await t.click(await triggersAndFunctionsPage.getLibraryNameSelector(libraryName));
        await t.click(triggersAndFunctionsPage.editMonacoButton);
        await triggersAndFunctionsPage.sendTextToMonaco(commandUpdatedPart1, commandUpdatedPart2);

        await t.expect(
            (await triggersAndFunctionsPage.getTextToMonaco())).eql(commandUpdatedPart1 + commandUpdatedPart2), 'code was not updated';

        await t.click(await triggersAndFunctionsPage.configurationLink);
        await t.click(triggersAndFunctionsPage.editMonacoButton);
        await triggersAndFunctionsPage.sendTextToMonaco(configuration);
        await t.expect(
            (await triggersAndFunctionsPage.getTextToMonaco())).eql(configuration, 'configuration was not added');
    });

