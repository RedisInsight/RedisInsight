import { t } from 'testcafe';
import { acceptLicenseTerms} from '../../../helpers/database';
import { addNewStandaloneDatabase, deleteDatabaseByName } from '../../../helpers/api/api-database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesForSearch = [
    { host: 'localhost', port: '7777', databaseName: 'testSearch'},
    { host: 'localhost', port: '7777', databaseName: 'testSecondSearch'},
    { host: 'localhost', port: '8887', databaseName: 'testInvalid'},
]


fixture.only `Database list search`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await addNewStandaloneDatabase(databasesForSearch[0]);
        await addNewStandaloneDatabase(databasesForSearch[1]);
        await addNewStandaloneDatabase(databasesForSearch[2]);
        // Reload Page
        await t.eval(() => location.reload());
    })
    .afterEach(async() => {
        //Clear and delete database
        await deleteDatabaseByName(ossStandaloneConfig.databaseName);
        await deleteDatabaseByName(databasesForSearch[0].databaseName);
        await deleteDatabaseByName(databasesForSearch[1].databaseName);
        await deleteDatabaseByName(databasesForSearch[2].databaseName);
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
    .meta({ rte: rte.standalone })('Verify that user can search DB by host and port on the List of databases', async t => {
        //Search for DB by port
        const searchedDBHost = '7777'
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that database found on the list search by port
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[0].databaseName).exists).ok('The database with port is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).ok('The database with port is found', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[2].databaseName).exists).notOk('The database with other port is not found', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search DB by Connection Type on the List of databases', async t => {
        //Search for DB by connection type
        const searchedDBHost = 'Standalone'
        await t.typeText(myRedisDatabasePage.searchInput, searchedDBHost, { replace: true });
        //Verify that database found on the list search by connection type
        // await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[0].databaseName).exists).ok('The database with connection type is found', { timeout: 10000 });
        // await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[1].databaseName).exists).ok('The database with connection type is found', { timeout: 10000 });
        // await t.expect(myRedisDatabasePage.dbNameList.withExactText(databasesForSearch[2].databaseName).exists).notOk('The database with other connection type is not found', { timeout: 10000 });
    });