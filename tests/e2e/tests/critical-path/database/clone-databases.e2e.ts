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
import { Common } from '../../../helpers/common';

const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const common = new Common();
const newOssDatabaseAlias = 'cloned oss cluster';

fixture `Clone databases`
    .meta({ type: 'critical_path' })
    .page(commonUrl);
test
    .before(async() => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await common.reloadPage();
    })
    .after(async() => {
        // Delete databases
        const dbNumber = await myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count;
        for (let i = 0; i < dbNumber; i++) {
            await deleteStandaloneDatabaseApi(ossStandaloneConfig);
        }
    })
    .meta({ rte: rte.standalone })('Verify that user can clone Standalone db', async t => {
        await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneConfig.databaseName);
        // Verify that user can cancel the Clone by clicking the “Cancel” or the “x” button
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        await t.click(addRedisDatabasePage.cancelButton);
        await t.expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).notOk('Clone panel is still displayed', { timeout: 2000 });
        await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneConfig.databaseName);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        // Verify that user see the “Add Database Manually” form pre-populated with all the connection data when cloning DB
        await t
            // Verify that name in the header has the prefix “Clone”
            .expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).ok('Clone panel is not displayed')
            .expect(addRedisDatabasePage.hostInput.getAttribute('value')).eql(ossStandaloneConfig.host, 'Wrong host value')
            .expect(addRedisDatabasePage.portInput.getAttribute('value')).eql(ossStandaloneConfig.port, 'Wrong port value')
            .expect(addRedisDatabasePage.databaseAliasInput.getAttribute('value')).eql(ossStandaloneConfig.databaseName, 'Wrong host value');
        // Verify that user can confirm the creation of the database by clicking “Clone Database”
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count).eql(2, 'DB was not cloned');
    });
test
    .before(async() => {
        await acceptLicenseTerms();
        await addNewOSSClusterDatabaseApi(ossClusterConfig);
        await common.reloadPage();
    })
    .after(async() => {
        // Delete database
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
        await myRedisDatabasePage.deleteDatabaseByName(newOssDatabaseAlias);
    })
    .meta({ rte: rte.ossCluster })('Verify that user can clone OSS Cluster', async t => {
        await myRedisDatabasePage.clickOnEditDBByName(ossClusterConfig.ossClusterDatabaseName);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        await t
            .expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).ok('Clone panel is not displayed')
            .expect(addRedisDatabasePage.portInput.getAttribute('value')).eql(ossClusterConfig.ossClusterPort, 'Wrong port value')
            .expect(addRedisDatabasePage.databaseAliasInput.getAttribute('value')).eql(ossClusterConfig.ossClusterDatabaseName, 'Wrong host value');
        // Edit Database alias before cloning
        await t.typeText(addRedisDatabasePage.databaseAliasInput, newOssDatabaseAlias, { replace: true });
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newOssDatabaseAlias).visible).ok('DB was not closed');
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).visible).ok('Original DB is not displayed');
    });
test
    .before(async() => {
        await acceptLicenseTerms();
        // Add Sentinel databases
        await discoverSentinelDatabaseApi(ossSentinelConfig);
        await common.reloadPage();
    })
    .after(async() => {
        // Delete all primary groups
        const sentinelCopy = ossSentinelConfig;
        sentinelCopy.masters.push(ossSentinelConfig.masters[1]);
        sentinelCopy.name.push(ossSentinelConfig.name[1]);
        await deleteAllSentinelDatabasesApi(sentinelCopy);
        await common.reloadPage();
    })
    .meta({ rte: rte.sentinel })('Verify that user can clone Sentinel', async t => {
        await myRedisDatabasePage.clickOnEditDBByName(ossSentinelConfig.name[1]);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        // Verify that for Sentinel Host and Port fields are replaced with editable Primary Group Name field
        await t
            .expect(myRedisDatabasePage.editAliasButton.withText('Clone ').visible).ok('Clone panel is not displayed')
            .expect(addRedisDatabasePage.databaseAliasInput.getAttribute('value')).eql(ossSentinelConfig.name[1], 'Invalid primary group alias value')
            .expect(addRedisDatabasePage.primaryGroupNameInput.getAttribute('value')).eql(ossSentinelConfig.name[1], 'Invalid primary group name value');
        // Validate Databases section
        await t
            .click(addRedisDatabasePage.cloneSentinelDatabaseNavigation)
            .expect(addRedisDatabasePage.masterGroupPassword.getAttribute('value')).eql(ossSentinelConfig.masters[1].password, 'Invalid sentinel database password');
        // Validate Sentinel section
        await t
            .click(addRedisDatabasePage.cloneSentinelNavigation)
            .expect(addRedisDatabasePage.portInput.getAttribute('value')).eql(ossSentinelConfig.sentinelPort, 'Invalid sentinel port')
            .expect(addRedisDatabasePage.passwordInput.getAttribute('value')).eql(ossSentinelConfig.sentinelPassword, 'Invalid sentinel password');
        // Clone Sentinel Primary Group
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossSentinelConfig.masters[1].name).count).gt(1, 'Primary Group was not cloned');
    });
