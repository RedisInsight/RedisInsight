import { Chance } from 'chance';
import { Selector } from 'testcafe';
import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage, CliPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { populateDBWithHashes } from '../../../helpers/keys';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

const keyToAddParameters = { keysCount: 13, keyNameStartWith: 'hashKey'};
const members = [...Array(100).keys()].toString().replace(/,/g, ' '); // The smallest key
const keyNamesMemory = ['string', 'list', 'bloom', 'set'];
const keyNamesLength = ['string', 'set', 'list'];
const mbloomCommand = 'bf.add bloom 1';
const listCommand = `rpush list ${members.slice(0, -3)}`;
const stringCommand = `set string "${chance.paragraph({ sentences: 100 })}"`; // The biggest key
const setCommand = `sadd set ${members}`; // Middle key

fixture `Memory Efficiency Top Keys Table`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create keys
        await populateDBWithHashes(ossStandaloneConfig.host, ossStandaloneConfig.port, keyToAddParameters);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
    })
    .after(async() => {
        await cliPage.sendCommandInCli('flushdb');
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Top Keys displaying in Summary of big keys', async t => {
        // Verify that user can see “-” as length for all unsupported data types
        await cliPage.sendCommandInCli(mbloomCommand);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.expect(Selector('[data-testid=length-empty-bloom]').textContent).eql('-', 'Length is defined for unknown types');
        // Verify that user cannot see quantifier if keys are less than 15
        await t.expect(memoryEfficiencyPage.topKeysTitle.textContent).eql('TOP KEYS', 'Title is not correct');
        // Verify that top 15 keys are displayed per memory
        await cliPage.sendCommandInCli(listCommand);
        await cliPage.sendCommandInCli(stringCommand);
        await cliPage.sendCommandInCli(setCommand);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.expect(memoryEfficiencyPage.topKeysTitle.textContent).eql('TOP 15 KEYS', 'Title is not correct');
        await t.expect(memoryEfficiencyPage.topKeysKeyName.count).eql(15, 'Number of lines is not 15');
        // Verify that sorting by Key Size DESC applied by default in by Memory tab
        for (let i = 0; i < 4; i++) {
            await t.expect(memoryEfficiencyPage.topKeysKeyName.nth(i).textContent).eql(keyNamesMemory[i], 'Key name by Memory order is not correct');
        }
        // Verify that top 15 keys are displayed per length
        await t.click(memoryEfficiencyPage.sortByLength);
        await t.expect(memoryEfficiencyPage.topKeysKeyName.count).eql(15, 'Number of lines is not 15');
        // Verify that sorting by Length DESC applied by default in by Length tab
        for (let i = 0; i < 3; i++) {
            await t.expect(memoryEfficiencyPage.topKeysKeyName.nth(i).textContent).eql(keyNamesLength[i], 'Key name by Length order is not correct');
        }
        // Verify that user can click on a key name and see key details in Browser
        await t.click(memoryEfficiencyPage.topKeysKeyName.nth(1).find('button'));
        await t.expect(browserPage.keyNameFormDetails.find('b').textContent).eql(keyNamesLength[1]);
    });
