import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { MyRedisDatabasePage, DatabaseOverviewPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { addNewStandaloneDatabaseApi, deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseOverviewPage = new DatabaseOverviewPage();
const common = new Common();
const moduleNameList = ['RediSearch', 'RedisGraph', 'RedisBloom', 'RedisJSON', 'RedisTimeSeries'];

fixture `Redis Stack`
    .meta({type: 'regression', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async() => {
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        // Reload Page
        await common.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see module list Redis Stack icon hovering (without Redis Stack text)', async t => {
    // Verify that user can see Redis Stack icon when Redis Stack DB is added in the application
    await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon not found');
    // Hover over redis stack icon
    await t.hover(myRedisDatabasePage.redisStackIcon);
    await t.expect(myRedisDatabasePage.moduleTooltip.visible).ok('Tooltip with modules not found');
    // Verify that user can see the Redis Stack logo is placed in the module list tooltip in the list of DBs
    await t.expect(myRedisDatabasePage.tooltipRedisStackLogo.visible).ok('Redis Stack logo not found');
    // Check all Redis Stack modules inside
    await myRedisDatabasePage.checkModulesInTooltip(moduleNameList);
});
test('Verify that user can see Redis Stack icon in Edit mode near the DB name', async t => {
    // Open Edit mode
    await t.click(myRedisDatabasePage.editDatabaseButton);
    // Check redis stack icon near the db name
    await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon not found');
    // Verify that user can see the Redis Stack logo is placed in the DB edit form when hover over the RedisStack logo
    await t.hover(myRedisDatabasePage.redisStackIcon);
    await t.expect(myRedisDatabasePage.tooltipRedisStackLogo.visible).ok('Redis Stack logo not found');
    const databaseName = myRedisDatabasePage.redisStackIcon.parent().nextSibling();
    await t.expect(databaseName.withAttribute('data-testid', 'edit-alias-btn').exists).ok('Edit button not found');
});
test('Verify that user can see Redis Stack icon and logo in Browser page in Overview.', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(databaseOverviewPage.overviewRedisStackLogo.visible).ok('Redis Stack logo not found');
    // Open Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    await t.expect(databaseOverviewPage.overviewRedisStackLogo.visible).ok('Redis Stack logo not found');
    // Check modules inside of the tooltip
    await t.hover(databaseOverviewPage.overviewRedisStackLogo);
    await t.expect(myRedisDatabasePage.moduleTooltip.visible).ok('Tooltip with modules not found');
    await myRedisDatabasePage.checkModulesInTooltip(moduleNameList);
});
