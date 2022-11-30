import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage, CliPage, AddRedisDatabasePage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi, deleteCustomDatabase } from '../../../helpers/database';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { CliActions } from '../../../common-actions/cli-actions';
import { Common } from '../../../helpers/common';
import { populateHashWithFields } from '../../../helpers/keys';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const cliActions = new CliActions();
const common = new Common();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

const externalPageLink = 'https://docs.redis.com/latest/ri/memory-optimizations/';
const keyName = `hugeHashKey-${common.generateWord(10)}`;
const stringKeyName = `smallStringKey-${common.generateWord(10)}`;
const stringBigKeyName = `bigStringKey-${common.generateWord(10)}`;
const index = '1';

fixture `Memory Efficiency Recommendations`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
    })
    .afterEach(async() => {
        await cliPage.sendCommandInCli('SCRIPT FLUSH');
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test('Avoid dynamic Lua script recommendation', async t => {
    // Go to Recommendations tab
    await t.click(memoryEfficiencyPage.recommendationsTab);
    // Add cached scripts and generate new report
    await cliActions.addCachedScripts(10);
    await t.click(memoryEfficiencyPage.newReportBtn);
    // No recommendation with 10 cached scripts
    await t.expect(memoryEfficiencyPage.luaScriptAccordion.exists).notOk('Avoid dynamic lua script recommendation displayed with 10 cached scripts');
    // Add the last cached script to see the recommendation
    await cliActions.addCachedScripts(1);
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Verify that user can see Avoid dynamic Lua script recommendation when number_of_cached_scripts> 10
    await t.expect(memoryEfficiencyPage.luaScriptAccordion.exists).ok('Avoid dynamic lua script recommendation not displayed');

    // Verify that user can see Use smaller keys recommendation when database has 1M+ keys
    await t.expect(memoryEfficiencyPage.useSmallKeysAccordion.exists).ok('Use smaller keys recommendation not displayed');

    // Verify that user can expand/collapse recommendation
    const expandedTextConaiterSize = await memoryEfficiencyPage.luaScriptTextContainer.offsetHeight;
    await t.click(memoryEfficiencyPage.luaScriptButton);
    await t.expect(memoryEfficiencyPage.luaScriptTextContainer.offsetHeight).lt(expandedTextConaiterSize, 'Recommendation not collapsed');
    await t.click(memoryEfficiencyPage.luaScriptButton);
    await t.expect(memoryEfficiencyPage.luaScriptTextContainer.offsetHeight).eql(expandedTextConaiterSize, 'Recommendation not expanded');

    // Verify that user can navigate by link to see the recommendation
    await t.click(memoryEfficiencyPage.readMoreLink);
    await common.checkURL(externalPageLink);
    // Close the window with external link to switch to the application window
    await t.closeWindow();
});
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addHashKey(keyName, '2147476121', 'field', 'value');
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Shard big hashes to small hashes recommendation', async t => {
        const noRecommendationsMessage = 'No Recommendations at the moment.';
        const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
        const keyToAddParameters = { fieldsCount: 4999, keyName, fieldStartWith: 'hashField', fieldValueStartWith: 'hashValue' };
        const keyToAddParameters2 = { fieldsCount: 1, keyName, fieldStartWith: 'hashFieldLast', fieldValueStartWith: 'hashValueLast' };

        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
        // No recommendations message
        await t.expect(memoryEfficiencyPage.noRecommendationsMessage.textContent).eql(noRecommendationsMessage, 'No recommendations message not displayed');

        // Add 5000 fields to the hash key
        await populateHashWithFields(dbParameters.host, dbParameters.port, keyToAddParameters);
        // Generate new report
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that big keys recommendation not displayed when hash has 5000 fields
        await t.expect(memoryEfficiencyPage.noRecommendationsMessage.textContent).eql(noRecommendationsMessage, 'No recommendations message not displayed');
        // Add the last field in hash key
        await populateHashWithFields(dbParameters.host, dbParameters.port, keyToAddParameters2);
        // Generate new report
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that user can see Shard big hashes to small hashes recommendation when Hash length > 5,000
        await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).ok('Shard big hashes to small hashes recommendation not displayed');
        await t.expect(memoryEfficiencyPage.codeChangesLabel.exists).ok('Big hashes recommendation not have Code Changes label');
        await t.expect(memoryEfficiencyPage.configurationChangesLabel.exists).ok('Big hashes recommendation not have Configuration Changes label');
    });
    test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(stringKeyName, '2147476121', 'field');
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeysByNames([stringKeyName, stringBigKeyName]);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Combine small strings to hashes recommendation', async t => {
        const command = `SET ${stringBigKeyName} "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed accumsan lectus sed diam suscipit, eu ullamcorper ligula pulvinar."`;
        
        // Verify that user can see Combine small strings to hashes recommendation when there are strings that are less than 200 bytes
        await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).ok('Combine small strings to hashes recommendation not displayed');
        await t.expect(memoryEfficiencyPage.codeChangesLabel.exists).ok('Combine small strings to hashes recommendation not have Code Changes label');

        // Add String key with more than 200 bytes
        await cliPage.sendCommandInCli(command);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that user can not see recommendation when there is at least one string that are more than 200 bytes
        await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).notOk('Combine small strings to hashes recommendation not displayed');
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(stringKeyName, '2147476121', 'field');
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(stringKeyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Increase the set-max-intset-entries recommendation', async t => {
        // Verify that user can see Increase the set-max-intset-entries recommendation when Found sets with length > set-max-intset-entries
        await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).ok('Combine small strings to hashes recommendation not displayed');
        await t.expect(memoryEfficiencyPage.configurationChangesLabel.exists).ok('Combine small strings to hashes recommendation not have Configuration Changes label');
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(stringKeyName, '2147476121', 'field');
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneConfig, index);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName} [${index}]`);
        await browserPage.addHashKey(keyName, '2147476121', 'field', 'value');
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await deleteCustomDatabase(`${ossStandaloneConfig.databaseName} [${index}]`);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.deleteKeyByName(stringKeyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Avoid using logical databases', async t => {

        // Verify that user can see Avoid using logical databases recommendation when the database supports logical databases and there are keys in more than 1 logical database
        await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).ok('Avoid using logical databases recommendation not displayed');
        await t.expect(memoryEfficiencyPage.codeChangesLabel.exists).ok('Avoid using logical databases recommendation not have Code Changes label');
    });
