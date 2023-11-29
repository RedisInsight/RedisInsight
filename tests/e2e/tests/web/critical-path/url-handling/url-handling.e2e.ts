import { commonUrl, ossStandaloneRedisGears } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { DatabaseHelper } from '../../../../helpers/database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();

const databaseAPIRequests = new DatabaseAPIRequests();
const databaseHelper = new DatabaseHelper();

let { host, port, databaseName, databaseUsername = '', databasePassword = '' } = ossStandaloneRedisGears;

function generateLink(params: Record<string, any>): string {
    const params1 = Common.generateUrlTParams(params);
    const from = encodeURIComponent(`${redisConnect}?${params1}`);
    return (new URL(`?from=${from}`, commonUrl)).toString();
}

const redisConnect = 'redisinsight://databases/connect';

fixture `Add DB from SM`
    .meta({ type: 'critical_path', rte: rte.none })
    .afterEach(async() => {
        // Delete all existing connections
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .page(commonUrl)('Add DB using url via manual flow', async t => {
        const connectUrlParams = {
            redisUrl: `redis://${databaseUsername}:${databasePassword}@${host}:${port}`,
            databaseAlias: databaseName,
            redirect: 'workbench'
        };

        await t.navigateTo(generateLink(connectUrlParams));
        await t.expect(myRedisDatabasePage.AddRedisDatabase.disabledDatabaseInfo.nth(0).getAttribute('title')).contains(host, 'Wrong host value');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.disabledDatabaseInfo.nth(1).getAttribute('title')).contains(port, 'Wrong port value');
        await t.wait(5_000);
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        // wait for db is added
        await t.wait(10_000);
        await t.expect(workbenchPage.submitCommandButton.exists).ok('Redirection to Workbench is not correct');
    });

test
    .before(async()  => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears);
        await browserPage.Cli.sendCommandInCli('acl DELUSER alice');
        await browserPage.Cli.sendCommandInCli('ACL SETUSER alice on >p1pp0 +@all ~*');
    })
    .after(async t => {
        // Delete all existing connections
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databaseName);
        await browserPage.Cli.sendCommandInCli('acl DELUSER alice');
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .page(commonUrl)('Add DB using url automatically', async t => {
        databaseUsername = 'alice';
        databasePassword = 'p1pp0';
        const connectUrlParams = {
            redisUrl: `redis://${databaseUsername}:${databasePassword}@${host}:${port}`,
            databaseAlias: databaseName,
            redirect: 'workbench?guidePath=/quick-guides/document/introduction.md',
            cloudBdbId: '1232',
            subscriptionType: 'fixed',
            planMemoryLimit: '30',
            memoryLimitMeasurementUnit: 'mb',
            free: 'true'
        };

        await t.navigateTo(generateLink(connectUrlParams));
        await t.wait(10_000);
        await t.expect(workbenchPage.submitCommandButton.exists).ok('Redirection to Workbench is not correct');

        //Verify that the same db is not added
        await t.navigateTo(generateLink(connectUrlParams));
        await t.wait(10_000);
        await t.click(workbenchPage.NavigationPanel.myRedisDBButton);
        await t.expect(browserPage.notification.exists).notOk({ timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.child('span').withExactText(databaseName).count).eql(2, 'the same db is added twice');
    });
