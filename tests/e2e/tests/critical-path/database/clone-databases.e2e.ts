import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage, MyRedisDatabasePage } from '../../../pageObjects';
import {commonUrl, ossClusterConfig, ossStandaloneConfig} from '../../../helpers/conf';
import { acceptLicenseTerms } from '../../../helpers/database';
import {
    addNewOSSClusterDatabaseApi,
    addNewStandaloneDatabaseApi,
    deleteOSSClusterDatabaseApi,
    deleteStandaloneDatabaseApi
} from '../../../helpers/api/api-database';

const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await t.eval(() => location.reload());
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await t.eval(() => location.reload());
    })
    .after(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
    .meta({ rte: rte.standalone })('Verify that user can close Standalone db', async t => {
        await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneConfig.databaseName);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        await t
            .expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).ok('Clone panel is not displayed')
            .expect(addRedisDatabasePage.hostInput.getAttribute('value')).eql(ossStandaloneConfig.host, 'Wrong host value')
            .expect(addRedisDatabasePage.portInput.getAttribute('value')).eql(ossStandaloneConfig.port, 'Wrong port value')
            .expect(addRedisDatabasePage.databaseAliasInput.getAttribute('value')).eql(ossStandaloneConfig.databaseName, 'Wrong host value');
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count).eql(2, 'DB was not cloned');
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewOSSClusterDatabaseApi(ossClusterConfig);
        await t.eval(() => location.reload());
    })
    .after(async() => {
        // Delete database
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })
    .meta({ rte: rte.standalone })('Verify that user can close OSS Cluster', async t => {
        const newDatabaseAlias = 'cloned oss cluster';
        await myRedisDatabasePage.clickOnEditDBByName(ossClusterConfig.ossClusterDatabaseName);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        await t
            .expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).ok('Clone panel is not displayed')
            .expect(addRedisDatabasePage.portInput.getAttribute('value')).eql(ossClusterConfig.ossClusterPort, 'Wrong port value')
            .expect(addRedisDatabasePage.databaseAliasInput.getAttribute('value')).eql(ossClusterConfig.ossClusterDatabaseName, 'Wrong host value');
        // Edit Database alias before cloning
        await t.typeText(addRedisDatabasePage.databaseAliasInput, newDatabaseAlias, { replace: true });
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newDatabaseAlias).visible).ok('DB was not closed');
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).visible).ok('Original DB is not displayed');
    });
