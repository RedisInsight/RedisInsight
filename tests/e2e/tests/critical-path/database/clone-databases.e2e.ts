import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossClusterConfig, ossSentinelConfig, ossStandaloneConfig } from '../../../helpers/conf';
import { acceptLicenseTerms } from '../../../helpers/database';
import {
    addNewOSSClusterDatabaseApi,
    addNewStandaloneDatabaseApi,
    deleteAllSentinelDatabasesApi,
    deleteOSSClusterDatabaseApi,
    deleteStandaloneDatabaseApi,
    discoverSentinelDatabaseApi
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
    .meta({ rte: rte.standalone })('Verify that user can clone Standalone db', async t => {
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
    .meta({ rte: rte.standalone })('Verify that user can clone OSS Cluster', async t => {
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
test
    .before(async t => {
        await acceptLicenseTerms();
        // Add Sentinel databases
        await discoverSentinelDatabaseApi(ossSentinelConfig);
        await t.eval(() => location.reload());
    })
    .after(async() => {
        // Delete all primary groups
        await deleteAllSentinelDatabasesApi(ossSentinelConfig);
    })
    .meta({ rte: rte.standalone })('Verify that user can clone Sentinel', async t => {
        await myRedisDatabasePage.clickOnEditDBByName(ossSentinelConfig.name[0]);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        // Validate common form
        await t
            .expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).ok('Clone panel is not displayed')
            .expect(addRedisDatabasePage.databaseAliasInput.getAttribute('value')).eql(ossSentinelConfig.name[0], 'Invalid primary group alias value')
            .expect(addRedisDatabasePage.primaryGroupNameInput.getAttribute('value')).eql(ossSentinelConfig.name[0], 'Invalid primary group name value');
        // Validate Sentinel section
        await t
            .click(addRedisDatabasePage.sentinelNavigation)
            .expect(addRedisDatabasePage.portInput.getAttribute('value')).eql(ossSentinelConfig.sentinelPort, 'Invalid sentinel port')
            .expect(addRedisDatabasePage.passwordInput.getAttribute('value')).eql(ossSentinelConfig.sentinelPort, 'Invalid sentinel port');
        // Validate Databases section
        await t
            .click(addRedisDatabasePage.sentinelDatabasesNavigation)
            .expect(addRedisDatabasePage.masterGroupPassword.getAttribute('value')).eql(ossSentinelConfig.masters[0].password, 'Invalid sentinel port');
    });
