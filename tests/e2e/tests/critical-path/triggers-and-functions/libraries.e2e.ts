import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, TriggersAndFunctionsPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig, ossStandaloneRedisGears
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { TriggersAndFunctionLibrary } from '../../../interfaces/triggers-and-functions';

const browserPage = new BrowserPage();
const triggersAndFunctionsPage = new TriggersAndFunctionsPage();

const libraryName = 'lib';

fixture `Triggers and Functions`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears, ossStandaloneBigConfig.databaseName);
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

