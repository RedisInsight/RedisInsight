import { t } from 'testcafe';
import { Chance } from 'chance';
import { DatabaseHelper } from '../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossClusterConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { Telemetry } from '../../../helpers/telemetry';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const telemetry = new Telemetry();
const chance = new Chance();
const databaseHelper = new DatabaseHelper();

const logger = telemetry.createLogger();
const telemetryEvent = 'CONFIG_DATABASES_OPEN_DATABASE';
const expectedProperties = [
    'databaseId',
    'RediSearch',
    'RedisAI',
    'RedisGraph',
    'RedisGears',
    'RedisBloom',
    'RedisJSON',
    'RedisTimeSeries',
    'customModules'
];
let databaseName = `test_standalone-${chance.string({ length: 10 })}`;

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .meta({ rte: rte.standalone })
    .requestHooks(logger)
    .after(async() => {
        await databaseHelper.deleteDatabase(databaseName);
    })('Verify that user can add Standalone Database', async() => {
        const connectionTimeout = '20';
        databaseName = `test_standalone-${chance.string({ length: 10 })}`;

        // Fill the add database form
        await myRedisDatabasePage.AddRedisDatabase.addDatabaseButton.with({ visibilityCheck: true, timeout: 10000 })();
        await t
            .click(myRedisDatabasePage.AddRedisDatabase.addDatabaseButton)
            .click(myRedisDatabasePage.AddRedisDatabase.addDatabaseManually);
        await t
            .typeText(myRedisDatabasePage.AddRedisDatabase.hostInput, ossStandaloneConfig.host, { replace: true, paste: true })
            .typeText(myRedisDatabasePage.AddRedisDatabase.portInput, ossStandaloneConfig.port, { replace: true, paste: true })
            .typeText(myRedisDatabasePage.AddRedisDatabase.databaseAliasInput, databaseName, { replace: true, paste: true })
            // Verify that user can customize the connection timeout for the manual flow
            .typeText(myRedisDatabasePage.AddRedisDatabase.timeoutInput, connectionTimeout, { replace: true, paste: true });
        await t
            .click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton)
            // Wait for database to be exist
            .expect(myRedisDatabasePage.dbNameList.withExactText(databaseName).exists).ok('The database not displayed', { timeout: 10000 })
            // Close message
            .click(myRedisDatabasePage.Toast.toastCloseButton);

        // Verify that user can see an indicator of databases that are added manually and not opened yet
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(databaseName);
        await myRedisDatabasePage.clickOnDBByName(databaseName);

        // Verify that telemetry event 'CONFIG_DATABASES_OPEN_DATABASE' sent and has all expected properties
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);

        await t.click(browserPage.OverviewPanel.myRedisDBLink);
        // Verify that user can't see an indicator of databases that were opened
        await myRedisDatabasePage.verifyDatabaseStatusIsNotVisible(databaseName);

        // Verify that connection timeout value saved
        await myRedisDatabasePage.clickOnEditDBByName(databaseName);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.timeoutInput.value).eql(connectionTimeout, 'Connection timeout is not customized');
    });
test
    .meta({ env: env.web, rte: rte.ossCluster })
    .after(async() => {
        await databaseHelper.deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })('Verify that user can add OSS Cluster DB', async() => {
        await databaseHelper.addOSSClusterDatabase(ossClusterConfig);
        // Verify new connection badge for OSS cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossClusterConfig.ossClusterDatabaseName);
    });
