import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { commonUrl, ossClusterConfig, ossStandaloneConfig, ossStandaloneRedisearch } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { SearchAndQueryPage } from '../../../../pageObjects/search-and-query-page';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const searchAndQueryPage = new SearchAndQueryPage();

fixture `Search and Query Raw mode`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);

test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
        await browserPage.Cli.sendCommandInCli('flushdb');
    })
    .after(async t => {
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);

    })('Verify suggestions when there are no indexes', async t => {

        // TODO add navigation to search and query Monaco

        await t.typeText(searchAndQueryPage.queryInput, 'FT.SE', { replace: true });
        await t.pressKey('enter');

        await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText('No indexes to display').exists).ok('info text is not displayed');

        await t.pressKey('ctrl+space');
        await t.expect(await searchAndQueryPage.MonacoEditor.monacoCommandDetails.find('a').exists).ok('no link in the details')
    });
