import { t } from 'testcafe';
import { acceptLicenseTerms } from '../../../helpers/database';
import { addNewStandaloneDatabase, addNewOSSClusterDatabase, deleteDatabaseByName } from '../../../helpers/api/api-database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config, ossClusterConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesForSearch = [
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testSearch' },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testSecondSearch' },
    { host: ossStandaloneV5Config.host, port: ossStandaloneV5Config.port, databaseName: 'testV5' },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'lastConnection' }
]

fixture`Database list search`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await addNewStandaloneDatabase(databasesForSearch[0]);
        await addNewStandaloneDatabase(databasesForSearch[1]);
        await addNewStandaloneDatabase(databasesForSearch[2]);
        await addNewOSSClusterDatabase(ossClusterConfig);
        // Reload Page
        await t.eval(() => location.reload());
    })
    .afterEach(async () => {
        //Clear and delete databases
        await deleteDatabaseByName(ossStandaloneConfig.databaseName);
        await deleteDatabaseByName(databasesForSearch[0].databaseName);
        await deleteDatabaseByName(databasesForSearch[1].databaseName);
        await deleteDatabaseByName(databasesForSearch[2].databaseName);
        await deleteDatabaseByName(ossClusterConfig.ossClusterDatabaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search DB by database name on the List of databases', async t => {
        //Search for DB by name
        const searchedDBName = 'Search'
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBName, { replace: true });
        //Verify that database found on the list search by name
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[0].databaseName).exists).ok('The database with alias is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).ok('The database with alias is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[2].databaseName).exists).notOk('The database with other alias is not found', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search DB by host on the List of databases', async t => {
        //Search for DB by host
        const searchedDBHost = ossStandaloneConfig.host;
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that database found on the list search by host
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[0].databaseName).exists).ok('The database with host is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).ok('The database with host is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).exists).notOk('The database with other host is not found', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search DB by port on the List of databases', async t => {
        //Search for DB by port
        const searchedDBHost = ossStandaloneConfig.port;
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that database found on the list search by port
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[0].databaseName).exists).ok('The database with port is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).ok('The database with port is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).exists).notOk('The database with other port is not found', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search DB by Connection Type on the List of databases', async t => {
        //Search for DB by connection type
        const searchedDBHost = 'Standalone'
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that database found on the list search by connection type
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[0].databaseName).exists).ok('The database with connection type is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).ok('The database with connection type is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).exists).notOk('The database with other connection type is not found', { timeout: 10000 });
    });
test
    .before(async () => {
        await t.wait(60000);
        await addNewStandaloneDatabase(databasesForSearch[3]);
        await t.eval(() => location.reload());
    })
    .after(async () => {
        await deleteDatabaseByName(databasesForSearch[3].databaseName);
    })
    .meta({ rte: rte.standalone })('Verify that user can search DB by Last Connection on the List of databases', async t => {
        //Search for DB by Last Connection
        const searchedDBHost = 'less than a minute ago'
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that database found on the list search by Last Connection
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[3].databaseName).exists).ok('The database with Last Connection is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).notOk('The database with other Last Connection is not found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).exists).notOk('The database with other Last Connection is not found', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user sees "No results found" message when pattern doesn`t match any database', async t => {
        //Search for DB by Invalid search
        const searchedDBHost = 'invalid'
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that "No results found" message is displayed in case of invalid search
        await t.expect(myRedisDatabasePage.noResultsFoundMessage.exists).ok('"No results found message" not displayed');
        await t.expect(myRedisDatabasePage.noResultsFoundText.exists).ok('"No databases matched your search" message not displayed');
    });
