import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const moduleNameList = ['RediSearch', 'RedisGraph', 'RedisBloom', 'RedisJSON', 'RedisTimeSeries'];

fixture `Redis Stack`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        // Add new databases using API
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        // Reload Page
        await browserPage.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
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
