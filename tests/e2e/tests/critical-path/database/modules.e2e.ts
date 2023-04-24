import { Selector } from 'testcafe';
import { rte, env } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneRedisearch } from '../../../helpers/conf';
import { addNewStandaloneDatabaseApi, deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const common = new Common();

const moduleNameList = ['RediSearch', 'RedisJSON', 'RedisGraph', 'RedisTimeSeries', 'RedisBloom', 'RedisGears', 'RedisAI'];
const moduleList = [myRedisDatabasePage.moduleSearchIcon, myRedisDatabasePage.moduleJSONIcon, myRedisDatabasePage.moduleGraphIcon, myRedisDatabasePage.moduleTimeseriesIcon, myRedisDatabasePage.moduleBloomIcon, myRedisDatabasePage.moduleGearsIcon, myRedisDatabasePage.moduleAIIcon];

fixture `Database modules`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneRedisearch);
        // Reload Page
        await common.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    });
test
    .meta({ rte: rte.standalone, env: env.web })('Verify that user can see DB modules on DB list page for Standalone DB', async t => {
        // Check module column on DB list page
        await t.expect(myRedisDatabasePage.moduleColumn.exists).ok('Module column not found');
        // Verify that user can see the following sorting order: Search, JSON, Graph, TimeSeries, Bloom, Gears, AI for modules
        const databaseLine = myRedisDatabasePage.dbNameList.withExactText(ossStandaloneRedisearch.databaseName).parent('tr');
        const moduleIcons = databaseLine.find('[data-testid^=Redi]');
        const numberOfIcons = await moduleIcons.count;
        for (let i = 0; i < numberOfIcons; i++) {
            const moduleName = moduleIcons.nth(i).getAttribute('data-testid');
            await t.expect(await moduleName).eql(await moduleList[i].getAttribute('data-testid'), 'Correct icon not found');
        }
        //Minimize the window to check quantifier
        await t.resizeWindow(1000, 700);
        //Verify that user can see +N icon (where N>1) on DB list page when modules icons don't fit the Module column width
        await t.expect(myRedisDatabasePage.moduleQuantifier.textContent).eql('+3');
        await t.expect(myRedisDatabasePage.moduleQuantifier.exists).ok('Quantifier icon not found');
        //Verify that user can hover over the module icons and see tooltip with all modules name
        await t.hover(myRedisDatabasePage.moduleQuantifier);
        await t.expect(myRedisDatabasePage.moduleTooltip.visible).ok('Module tooltip not found');
        //Verify that user can hover over the module icons and see tooltip with version.
        await myRedisDatabasePage.checkModulesInTooltip(moduleNameList);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see full module list in the Edit mode', async t => {
        // Verify that module column is displayed
        await t.expect(myRedisDatabasePage.moduleColumn.visible).ok('Module column not found');
        // Open Edit mode
        await t.click(myRedisDatabasePage.editDatabaseButton);
        // Verify that module column is not displayed
        await t.expect(myRedisDatabasePage.moduleColumn.exists).notOk('Module column not found');
        // Verify modules in Edit mode
        await myRedisDatabasePage.checkModulesOnPage(moduleList);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see icons in DB header for RediSearch, RedisGraph, RedisJSON, RedisBloom, RedisTimeSeries, RedisGears, RedisAI default modules', async t => {
        // Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        // Check all available modules in overview
        const moduleIcons = Selector('div').find('[data-testid^=Redi]');
        const numberOfIcons = await moduleIcons.count;
        for (let i = 0; i < numberOfIcons; i++) {
            const moduleName = await moduleIcons.nth(i).getAttribute('data-testid');
            await t.expect(moduleName).eql(await moduleList[i].getAttribute('data-testid'), 'Correct icon not found');
        }
        // Verify that if DB has more than 6 modules loaded, user can click on three dots and see other modules in the tooltip
        await t.click(browserPage.OverviewPanel.overviewMoreInfo);
        for (let j = numberOfIcons; j < moduleNameList.length; j++) {
            await t.expect(browserPage.OverviewPanel.overviewTooltip.withText(moduleNameList[j]).visible).ok('Tooltip module not found');
        }
    });
