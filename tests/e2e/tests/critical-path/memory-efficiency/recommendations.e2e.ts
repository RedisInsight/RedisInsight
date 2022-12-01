import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage, CliPage, AddRedisDatabasePage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi, deleteCustomDatabase } from '../../../helpers/database';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { CliActions } from '../../../common-actions/cli-actions';
import { Common } from '../../../helpers/common';
import { populateHashWithFields, populateSetWithMembers } from '../../../helpers/keys';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const cliActions = new CliActions();
const common = new Common();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

const externalPageLink = 'https://docs.redis.com/latest/ri/memory-optimizations/';
let keyName = `recomKey-${common.generateWord(10)}`;
const stringKeyName = `smallStringKey-${common.generateWord(5)}`;
const index = '1';
const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };

fixture `Memory Efficiency Recommendations`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
    })
    .afterEach(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
    })
    .after(async() => {
        await cliPage.sendCommandInCli('SCRIPT FLUSH');
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Avoid dynamic Lua script recommendation', async t => {
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
test('Shard big hashes to small hashes recommendation', async t => {
    keyName = `recomKey-${common.generateWord(10)}`;
    const noRecommendationsMessage = 'No Recommendations at the moment.';
    const keyToAddParameters = { fieldsCount: 4999, keyName, fieldStartWith: 'hashField', fieldValueStartWith: 'hashValue' };
    const keyToAddParameters2 = { fieldsCount: 1, keyName, fieldStartWith: 'hashFieldLast', fieldValueStartWith: 'hashValueLast' };
    const command = `HSET ${keyName} field value`;

    // Create Hash key and create report
    await cliPage.sendCommandInCli(command);
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Go to Recommendations tab
    await t.click(memoryEfficiencyPage.recommendationsTab);
    // No recommendations message
    await t.expect(memoryEfficiencyPage.noRecommendationsMessage.textContent).eql(noRecommendationsMessage, 'No recommendations message not displayed');

    // Add 5000 fields to the hash key
    await populateHashWithFields(dbParameters.host, dbParameters.port, keyToAddParameters);
    // Generate new report
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Verify that big keys recommendation not displayed when hash has 5000 fields
    await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).notOk('Shard big hashes to small hashes recommendation is displayed when hash has 5000 fields');
    // Add the last field in hash key
    await populateHashWithFields(dbParameters.host, dbParameters.port, keyToAddParameters2);
    // Generate new report
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Verify that user can see Shard big hashes to small hashes recommendation when Hash length > 5,000
    await t.expect(memoryEfficiencyPage.bigHashesAccordion.exists).ok('Shard big hashes to small hashes recommendation not displayed');
    await t.expect(memoryEfficiencyPage.codeChangesLabel.exists).ok('Big hashes recommendation not have Code Changes label');
    await t.expect(memoryEfficiencyPage.configurationChangesLabel.exists).ok('Big hashes recommendation not have Configuration Changes label');
});

test('Combine small strings to hashes recommendation', async t => {
    keyName = `recomKey-${common.generateWord(10)}`;
    const commandToAddKey = `SET ${stringKeyName} value`;
    const command = `SET ${keyName} "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed accumsan lectus sed diam suscipit, eu ullamcorper ligula pulvinar."`;

    // Create small String key and create report
    await cliPage.sendCommandInCli(commandToAddKey);
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Go to Recommendations tab
    await t.click(memoryEfficiencyPage.recommendationsTab);
    // Verify that user can see Combine small strings to hashes recommendation when there are strings that are less than 200 bytes
    await t.expect(memoryEfficiencyPage.combineStringsAccordion.exists).ok('Combine small strings to hashes recommendation not displayed for small string');
    await t.expect(memoryEfficiencyPage.codeChangesLabel.exists).ok('Combine small strings to hashes recommendation not have Code Changes label');

    // Add String key with more than 200 bytes
    await cliPage.sendCommandInCli(command);
    // Delete small String key
    await cliPage.sendCommandInCli(`DEL ${stringKeyName}`);
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Verify that user can not see recommendation when there are only strings with more than 200 bytes
    await t.expect(memoryEfficiencyPage.combineStringsAccordion.exists).notOk('Combine small strings to hashes recommendation is displayed for huge string');
});
test
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        // Return back set-max-intset-entries value
        await cliPage.sendCommandInCli('config set set-max-intset-entries 512');
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Increase the set-max-intset-entries recommendation', async t => {
        keyName = `recomKey-${common.generateWord(10)}`;
        const commandToAddKey = `SADD ${keyName} member`;
        const command = 'config set set-max-intset-entries 1024';
        const setKeyParameters = { membersCount: 512, keyName, memberStartWith: 'setMember' };

        // Create Set with 513 members and create report
        await cliPage.sendCommandInCli(commandToAddKey);
        await populateSetWithMembers(dbParameters.host, dbParameters.port, setKeyParameters);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
        // Verify that user can see Increase the set-max-intset-entries recommendation when Found sets with length > set-max-intset-entries
        await t.expect(memoryEfficiencyPage.increaseSetAccordion.exists).ok('Increase the set-max-intset-entries recommendation not displayed');
        await t.expect(memoryEfficiencyPage.configurationChangesLabel.exists).ok('Increase the set-max-intset-entries recommendation not have Configuration Changes label');

        // Change config max entries to 1024
        await cliPage.sendCommandInCli(command);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that user can not see Increase the set-max-intset-entries recommendation when Found sets with length < set-max-intset-entries
        await t.expect(memoryEfficiencyPage.increaseSetAccordion.exists).notOk('Increase the set-max-intset-entries recommendation is displayed');
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        keyName = `recomKey-${common.generateWord(10)}`;
        await browserPage.addStringKey(stringKeyName, '2147476121', 'field');
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneConfig, index);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName} [${index}]`);
        await browserPage.addHashKey(keyName, '2147476121', 'field', 'value');
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
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
        // Verify that user can see Avoid using logical databases recommendation when the database supports logical databases and there are keys in more than 1 logical database
        await t.expect(memoryEfficiencyPage.avoidLogicalDbAccordion.exists).ok('Avoid using logical databases recommendation not displayed');
        await t.expect(memoryEfficiencyPage.codeChangesLabel.exists).ok('Avoid using logical databases recommendation not have Code Changes label');
    });
test
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await cliPage.sendCommandInCli('config set hash-max-ziplist-entries 512');
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Compress Hash field names', async t => {
        keyName = `recomKey-${common.generateWord(10)}`;
        const command = 'config set hash-max-ziplist-entries 1001';
        const commandToAddKey = `HSET ${keyName} field value`;
        const hashKeyParameters = { fieldsCount: 1000, keyName, fieldStartWith: 'hashField', fieldValueStartWith: 'hashValue' };

        // Create Hash key
        await cliPage.sendCommandInCli(commandToAddKey);
        // Add 1000 fields to Hash key and create report
        await populateHashWithFields(dbParameters.host, dbParameters.port, hashKeyParameters);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);

        // Verify that user can see Compress Hash field names recommendation when Hash length > 1,000
        await t.expect(memoryEfficiencyPage.compressHashAccordion.exists).ok('Compress Hash field names recommendation not displayed');
        await t.expect(memoryEfficiencyPage.configurationChangesLabel.exists).ok('Compress Hash field names recommendation not have Configuration Changes label');

        // Convert hashtable to ziplist for hashes recommendation
        // Verify that user can see Convert hashtable to ziplist for hashes recommendation when the number of hash entries exceeds hash-max-ziplist-entries
        await t.expect(memoryEfficiencyPage.convertHashToZipAccordion.exists).ok('Convert hashtable to ziplist for hashes recommendation not displayed');
        await t.expect(memoryEfficiencyPage.configurationChangesLabel.exists).ok('Convert hashtable to ziplist for hashes recommendation not have Configuration Changes label');

        // Change config max entries to 1001
        await cliPage.sendCommandInCli(command);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that user can not see Convert hashtable to ziplist for hashes recommendation when the number of hash entries not exceeds hash-max-ziplist-entries
        await t.expect(memoryEfficiencyPage.convertHashToZipAccordion.exists).notOk('Convert hashtable to ziplist for hashes recommendation is displayed');
    });
