import { rte } from '../../../helpers/constants';
import {
    acceptLicenseTerms,
    addNewStandaloneDatabase,
    deleteDatabase
} from '../../../helpers/database';
import { MyRedisDatabasePage, DatabaseOverviewPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseOverviewPage = new DatabaseOverviewPage();
const moduleNameList = ['RediSearch', 'RedisGraph', 'RedisBloom', 'RedisJSON', 'RedisTimeSeries'];

fixture `Redis Stack`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({rte: rte.standalone})
    ('Verify that user can see module list Redis Stack icon hovering (without Redis Stack text)', async t => {
        //Verify that user can see Redis Stack icon when Redis Stack DB is added in the application
        await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon');
        //Hover over redis stack icon
        await t.hover(myRedisDatabasePage.redisStackIcon);
        await t.expect(myRedisDatabasePage.moduleTooltip.visible).ok('Tooltip with modules');
        //Check all Redis Stack modules inside
        await myRedisDatabasePage.checkModulesInTooltip(moduleNameList);
    });
test
    .meta({rte: rte.standalone})
    ('Verify that user can see Redis Stack icon in Edit mode near the DB name', async t => {
        //Open Edit mode
        await t.click(myRedisDatabasePage.editDatabaseButton);
        //Check redis stack icon near the db name
        await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon');
        const databaseName = await myRedisDatabasePage.redisStackIcon.parent().nextSibling();
        await t.expect(databaseName.withAttribute('data-testid', 'edit-alias-btn').exists).ok();
    });
test
    .meta({rte: rte.standalone})
    ('Verify that user can see Redis Stack icon and logo in Browser page in Overview.', async t => {
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(databaseOverviewPage.overviewRedisStackLogo.visible).ok('Redis Stack logo');
        //Open Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(databaseOverviewPage.overviewRedisStackLogo.visible).ok('Redis Stack logo');
        //Check modules inside of the tooltip
        await t.hover(databaseOverviewPage.overviewRedisStackLogo);
        await t.expect(myRedisDatabasePage.moduleTooltip.visible).ok('Tooltip with modules');
        await myRedisDatabasePage.checkModulesInTooltip(moduleNameList);
    });
