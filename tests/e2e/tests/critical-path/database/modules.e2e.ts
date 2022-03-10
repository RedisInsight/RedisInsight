import { rte } from '../../../helpers/constants';
import {
    acceptLicenseTerms,
    addNewStandaloneDatabase,
    deleteDatabase
} from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {commonUrl, ossStandaloneRedisearch} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const moduleList = ['RediSearch', 'RedisGraph', 'RedisBloom', 'RedisJSON', 'RedisAI', 'RedisTimeSeries', 'RedisGears'];

fixture `Modules`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabase(ossStandaloneRedisearch);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneRedisearch.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see DB modules on DB list page for Standalone DB', async t => {
        //Check module column on DB list page
        await t.expect(myRedisDatabasePage.moduleColumn.exists).ok('Module column');
        //Check that module icons are displayed
        await t.expect(myRedisDatabasePage.moduleGraphIcon.exists).ok('Graph icon');
        await t.expect(myRedisDatabasePage.moduleBloomIcon.exists).ok('Bloom icon');
        await t.expect(myRedisDatabasePage.moduleJSONIcon.exists).ok('JSON icon');
        //Verify that user can see +N icon (where N>1) on DB list page when modules icons don't fit the Module column width
        await t.expect(myRedisDatabasePage.moduleQuantifier.textContent).eql('+4');
        await t.expect(myRedisDatabasePage.moduleQuantifier.exists).ok('Quantifier icon');
        //Verify that user can hover over the module icons and see tooltip with all modules name
        await t.hover(myRedisDatabasePage.moduleQuantifier);
        await t.expect(myRedisDatabasePage.moduleTooltip.visible).ok('Module tooltip');
        //Verify that user can hover over the module icons and see tooltip with version.
        await myRedisDatabasePage.checkModulesInTooltip(moduleList);
    });
test.skip
    .meta({ rte: rte.standalone })
    ('Verify that user can see full module list in the Edit mode', async t => {
        //Verify that modules are displayed
        await t.expect(myRedisDatabasePage.allModules.exists).ok('Visible module icons');
        //Open Edit mode
        await t.click(myRedisDatabasePage.editDatabaseButton);
        await t.expect(myRedisDatabasePage.allModules.exists).notOk('Not visible module icons');
        //Verify modules in Edit mode
        await t.expect(myRedisDatabasePage.modulesOnEditPage.exists).ok('Edit modules');
    });
