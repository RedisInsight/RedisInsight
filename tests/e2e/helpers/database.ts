import { t } from 'testcafe';
import { MyRedisDatabasePage } from '../pageObjects/my-redis-databases-page';
import { AddNewDatabaseParameters, SentinelParameters, AddRedisDatabasePage, OSSClusterParameters } from '../pageObjects/add-redis-database-page';
import { DiscoverMasterGroupsPage } from '../pageObjects/sentinel/discovered-sentinel-master-groups-page';
import { AutoDiscoverREDatabases } from '../pageObjects/auto-discover-redis-enterprise-databases';
import { BrowserPage } from '../pageObjects/browser-page';
import { UserAgreementPage } from '../pageObjects';

const myRedisDatabasePage = new MyRedisDatabasePage;
const addRedisDatabasePage = new AddRedisDatabasePage;
const discoverMasterGroupsPage = new DiscoverMasterGroupsPage;
const autoDiscoverREDatabases = new AutoDiscoverREDatabases;
const browserPage = new BrowserPage;
const userAgreementPage = new UserAgreementPage;

/**
 * Add a new database manually using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewStandaloneDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    //Fill the add database form
    await addRedisDatabasePage.addRedisDataBase(databaseParameters);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Wait for database to be exist
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseParameters.databaseName).exists).ok('The existence of the database', { timeout: 60000 });
}

/**
 * Add a new database via autodiscover using Sentinel option
 * @param databaseParameters The Sentinel parameters: host, port and sentinel password
 */
export async function discoverSentinelDatabase(databaseParameters: SentinelParameters): Promise<void> {
    // Fill sentinel parameters to auto-discover Master Groups
    await addRedisDatabasePage.discoverSentinelDatabases(databaseParameters);
    // Click for autodiscover
    await t
        .click(addRedisDatabasePage.discoverSentinelDatabaseButton)
        .expect(discoverMasterGroupsPage.addPrimaryGroupButton.exists).ok('Verify that user is on the second step of Sentinel flow', { timeout: 60000 });
    // Select Master Groups and Add to RedisInsight
    await discoverMasterGroupsPage.addMasterGroups()
    await t.click(autoDiscoverREDatabases.viewDatabasesButton);
}

/**
 * Add a new database from RE Cluster via auto-discover flow
 * @param databaseParameters The database parameters
 */
export async function addNewREClusterDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    //Fill the add database form
    await addRedisDatabasePage.addAutodiscoverREClucterDatabase(databaseParameters);
    //Click on submit button
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Wait for database to be exist in the list of Autodiscover databases and select it
    await t.expect(autoDiscoverREDatabases.databaseNames.withExactText(databaseParameters.databaseName).exists).ok('The existence of the database', { timeout: 60000 });
    await t.typeText(autoDiscoverREDatabases.search, databaseParameters.databaseName);
    await t.click(autoDiscoverREDatabases.databaseCheckbox);
    //Click Add selected databases button
    await t.click(autoDiscoverREDatabases.addSelectedDatabases);
    await t.click(autoDiscoverREDatabases.viewDatabasesButton);
}

/**
 * Add a new database from OSS Cluster via auto-discover flow
 * @param databaseParameters The database parameters
 */
export async function addOSSClusterDatabase(databaseParameters: OSSClusterParameters): Promise<void> {
    //Enter required parameters for OSS Cluster
    await addRedisDatabasePage.addOssClusterDatabase(databaseParameters);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Check for info message that DB was added
    await t.expect(myRedisDatabasePage.databaseInfoMessage.exists).ok('Check that info message exists', { timeout: 60000 });
    //Wait for database to be exist
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseParameters.ossClusterDatabaseName).exists).ok('The existence of the database', { timeout: 60000 });
}

/**
 * Add a new database from Redis Enterprise Cloud via auto-discover flow
 * @param cloudAPIAccessKey The Cloud API Access Key
 * @param cloudAPISecretKey The Cloud API Secret Key
 */
export async function addNewRECloudDatabase(cloudAPIAccessKey: string, cloudAPISecretKey: string): Promise<string> {
    //Fill the add database form and Submit
    await addRedisDatabasePage.addAutodiscoverRECloudDatabase(cloudAPIAccessKey, cloudAPISecretKey);
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Select subscriptions
    await t.click(addRedisDatabasePage.selectAllCheckbox);
    await t.click(addRedisDatabasePage.showDatabasesButton);
    //Select databases for adding
    const databaseName = await browserPage.getDatabasesName();
    await t.click(addRedisDatabasePage.selectAllCheckbox);
    await t.click(autoDiscoverREDatabases.addSelectedDatabases);
    //Wait for database to be exist in the My redis databases list
    await t.click(autoDiscoverREDatabases.viewDatabasesButton);
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseName).exists).ok('The existence of the database', { timeout: 60000 });
    return databaseName;
}

/**
 * Accept License terms and add database
 * @param databaseParameters The database parameters
 * @param databaseName The database name
*/
export async function acceptLicenseTermsAndAddDatabase(databaseParameters: AddNewDatabaseParameters, databaseName: string): Promise<void> {
    await t.maximizeWindow();
    await userAgreementPage.acceptLicenseTerms();
    await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
    await addNewStandaloneDatabase(databaseParameters);
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(databaseName);
}   
