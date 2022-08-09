import { env, rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddOSSClusterDatabase,
    acceptLicenseTermsAndAddRECloudDatabase,
    acceptLicenseTermsAndAddREClusterDatabase,
    acceptLicenseTermsAndAddSentinelDatabaseApi,
    deleteDatabase
} from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { cloudDatabaseConfig, commonUrl, ossClusterConfig, ossSentinelConfig, redisEnterpriseClusterConfig } from '../../../helpers/conf';
import { deleteOSSClusterDatabaseApi, deleteSentinelDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const commandForSend1 = 'info';
const commandForSend2 = 'FT._LIST';

fixture `Work with Workbench in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async t => {
        await acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig, redisEnterpriseClusterConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async() => {
        //Delete database
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can run commands in Workbench in RE Cluster DB', async t => {
        const multipleCommands = [
            'info',
            'command',
            'FT.SEARCH idx *'
        ];
        //Send commands
        await workbenchPage.sendCommandInWorkbench(commandForSend1);
        await workbenchPage.sendCommandInWorkbench(commandForSend2);
        //Check that all the previous run commands are saved and displayed
        await t.eval(() => location.reload());
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).ok('The previous run commands are saved');
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend2).exists).ok('The previous run commands are saved');
        //Send multiple commands in one query
        await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'), 0.75);
        //Check that the results for all commands are displayed
        for (const command of multipleCommands) {
            await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok(`The command ${command} from multiple query is displayed`);
        }
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig, cloudDatabaseConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async() => {
        //Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can run commands in Workbench in RE Cloud DB', async t => {
        const multipleCommands = [
            'info',
            'command',
            'FT.SEARCH idx *'
        ];
        //Send commands
        await workbenchPage.sendCommandInWorkbench(commandForSend1);
        await workbenchPage.sendCommandInWorkbench(commandForSend2);
        //Check that all the previous run commands are saved and displayed
        await t.eval(() => location.reload());
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).ok('The previous run commands are saved');
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend2).exists).ok('The previous run commands are saved');
        //Send multiple commands in one query
        await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'), 0.75);
        //Check that the results for all commands are displayed
        for (const command of multipleCommands) {
            await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok(`The command ${command} from multiple query is displayed`);
        }
    });
test
    .meta({ rte: rte.ossCluster })
    .before(async t => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async() => {
        //Delete database
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Verify that user can run commands in Workbench in OSS Cluster DB', async t => {
        const multipleCommands = [
            'info',
            'command',
            'FT.SEARCH idx *'
        ];
        //Send commands
        await workbenchPage.sendCommandInWorkbench(commandForSend1);
        await workbenchPage.sendCommandInWorkbench(commandForSend2);
        //Check that all the previous run commands are saved and displayed
        await t.eval(() => location.reload());
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).ok('The previous run commands are saved');
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend2).exists).ok('The previous run commands are saved');
        //Send multiple commands in one query
        await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'), 0.75);
        //Check that the results for all commands are displayed
        for (const command of multipleCommands) {
            await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok(`The command ${command} from multiple query is displayed`);
        }
    });
test
    .meta({ env: env.web, rte: rte.sentinel })
    .before(async t => {
        await acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig, ossSentinelConfig.masters[1].alias);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async() => {
        //Delete database
        await deleteSentinelDatabaseApi(ossSentinelConfig);
    })('Verify that user can run commands in Workbench in Sentinel Primary Group', async t => {
        const multipleCommands = [
            'info',
            'command',
            'FT.SEARCH idx *'
        ];
        //Send commands
        await workbenchPage.sendCommandInWorkbench(commandForSend1);
        await workbenchPage.sendCommandInWorkbench(commandForSend2);
        //Check that all the previous run commands are saved and displayed
        await t.eval(() => location.reload());
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).ok('The previous run commands are saved');
        await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend2).exists).ok('The previous run commands are saved');
        //Send multiple commands in one query
        await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'), 0.75);
        //Check that the results for all commands are displayed
        for (const command of multipleCommands) {
            await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok(`The command ${command} from multiple query is displayed`);
        }
    });
