import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage, MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const chance = new Chance();
const cliPage = new CliPage();
const workbenchPage = new WorkbenchPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

let keyName = chance.word({ length: 10 });

fixture `Key messages`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see updated message in Browser for TimeSeries and Graph data types', async t => {
        const dataTypes = [
            'RedisTimeSeries',
            'RedisGraph'
        ];
        for(let i = 0; i < dataTypes.length; i++) {
            keyName = chance.word({ length: 10 });
            let commands = [
                `TS.CREATE ${keyName}`,
                `GRAPH.QUERY ${keyName} "CREATE ()"`
            ];
            let messages = [
                `This is a ${dataTypes[i]} key`,
                'Use Redis commands in the ',
                'Workbench',
                ' tool to view the value.'
            ];
            //Add key and verify message in Browser
            await cliPage.sendCommandInCli(commands[i]);
            await browserPage.searchByKeyName(keyName);
            await t.click(browserPage.keyNameInTheList);
            for(let message of messages) {
                await t.expect(browserPage.modulesTypeDetails.textContent).contains(message, `The message for ${dataTypes[i]} key is displayed`);
            }
            await browserPage.deleteKeyByName(keyName);
        }
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see link to Workbench under word “Workbench” in the RedisTimeSeries and Graph key details', async t => {
        const dataTypes = [
            'RedisTimeSeries',
            'RedisGraph'
        ];
        for(let i = 0; i < dataTypes.length; i++) {
            keyName = chance.word({ length: 10 });
            let commands = [
                `TS.CREATE ${keyName}`,
                `GRAPH.QUERY ${keyName} "CREATE ()"`
            ];
            //Add key and verify Workbench link
            await cliPage.sendCommandInCli(commands[i]);
            await browserPage.searchByKeyName(keyName);
            await t.click(browserPage.keyNameInTheList);
            await t.click(browserPage.internalLinkToWorkbench);
            await t.expect(workbenchPage.queryInput.visible).ok(`The message for ${dataTypes[i]} key is displayed`);
            await t.click(myRedisDatabasePage.browserButton);
            await browserPage.deleteKeyByName(keyName);
        }
    });
