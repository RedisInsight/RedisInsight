import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

let keyName = Common.generateWord(10);
const dataTypes: string[] = [
    'RedisTimeSeries',
    'RedisGraph'
];

fixture `Key messages`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see updated message in Browser for TimeSeries and Graph data types', async t => {
    for(let i = 0; i < dataTypes.length; i++) {
        keyName = Common.generateWord(10);
        const commands: string[] = [
            `TS.CREATE ${keyName}`,
            `GRAPH.QUERY ${keyName} "CREATE ()"`
        ];
        const messages: string[] = [
            `This is a ${dataTypes[i]} key`,
            'Use Redis commands in the ',
            'Workbench',
            ' tool to view the value.'
        ];

        // Add key and verify message in Browser
        await browserPage.Cli.sendCommandInCli(commands[i]);
        await browserPage.searchByKeyName(keyName);
        await t.click(browserPage.keyNameInTheList);
        for(const message of messages) {
            await t.expect(browserPage.modulesTypeDetails.textContent).contains(message, `The message for ${dataTypes[i]} key is not displayed`);
        }
        await browserPage.deleteKeyByName(keyName);
    }
});
test('Verify that user can see link to Workbench under word “Workbench” in the RedisTimeSeries and Graph key details', async t => {
    for(let i = 0; i < dataTypes.length; i++) {
        keyName = Common.generateWord(10);
        const commands: string[] = [
            `TS.CREATE ${keyName}`,
            `GRAPH.QUERY ${keyName} "CREATE ()"`
        ];

        // Add key and verify Workbench link
        await browserPage.Cli.sendCommandInCli(commands[i]);
        await browserPage.searchByKeyName(keyName);
        await t.click(browserPage.keyNameInTheList);
        await t.click(browserPage.internalLinkToWorkbench);
        await t.expect(workbenchPage.queryInput.visible).ok(`The message for ${dataTypes[i]} key is not displayed`);
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        await browserPage.deleteKeyByName(keyName);
    }
});
