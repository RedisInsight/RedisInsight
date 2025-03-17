// // import { Selector, t } from 'testcafe';
// import { DatabaseAPIRequests } from './api/api-database'
// import { RedisOverviewPage } from './constants'
// import { updateControlNumber } from './insights'
// import {
//     AddNewDatabaseParameters,
//     SentinelParameters,
//     OSSClusterParameters
// } from '../pageObjects/dialogs/add-redis-database-dialog'
// import { DiscoverMasterGroupsPage } from '../pageObjects/sentinel/discovered-sentinel-master-groups-page'
// import {
//     this.myRedisDatabasePage,
//     BrowserPage,
//     AutoDiscoverREDatabases
// } from '../pageObjects'
// import { UserAgreementDialog } from '../pageObjects/dialogs'
// import { RdiInstancesListPage } from '../pageObjects/rdi-instances-list-page'
//
// const this.myRedisDatabasePage = new this.myRedisDatabasePage()
// const discoverMasterGroupsPage = new DiscoverMasterGroupsPage()
// const autoDiscoverREDatabases = new AutoDiscoverREDatabases()
// const browserPage = new BrowserPage()
// const userAgreementDialog = new UserAgreementDialog()
// const databaseAPIRequests = new DatabaseAPIRequests()
// const rdiInstancesListPage = new RdiInstancesListPage()
//
// export class DatabaseHelper {
//     /**
//      * Add a new database manually using host and port
//      * @param databaseParameters The database parameters
//      */
//     async addNewStandaloneDatabase(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         // Fill the add database form
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDataBase(
//             databaseParameters
//         )
//         // Click for saving
//         await t
//             .click(this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton)
//             // Wait for database to be exist
//             .expect(
//                 this.myRedisDatabasePage.dbNameList.withExactText(
//                     databaseParameters.databaseName ?? ''
//                 ).exists
//             )
//             .ok('The database not displayed', { timeout: 10000 })
//             // Close message
//             .click(this.myRedisDatabasePage.Toast.toastCloseButton)
//     }
//
//     /**
//      * Add a new database via autodiscover using Sentinel option
//      * @param databaseParameters The Sentinel parameters: host, port and sentinel password
//      */
//     async discoverSentinelDatabase(
//         databaseParameters: SentinelParameters
//     ): Promise<void> {
//         // Fill sentinel parameters to auto-discover Master Groups
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.discoverSentinelDatabases(
//             databaseParameters
//         )
//         // Click for autodiscover
//         await t
//             .click(
//                 this.myRedisDatabasePage.AddRedisDatabaseDialog
//                     .addRedisDatabaseButton
//             )
//             .expect(discoverMasterGroupsPage.addPrimaryGroupButton.exists)
//             .ok('User is not on the second step of Sentinel flow', {
//                 timeout: 10000
//             })
//         // Select Master Groups and Add to Redis Insight
//         await discoverMasterGroupsPage.addMasterGroups()
//         await t.click(autoDiscoverREDatabases.viewDatabasesButton)
//     }
//
//     /**
//      * Add a new database from RE Cluster via auto-discover flow
//      * @param databaseParameters The database parameters
//      */
//     async addNewREClusterDatabase(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         // Fill the add database form
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.addAutodiscoverREClusterDatabase(
//             databaseParameters
//         )
//         // Click on submit button
//         await t
//             .click(this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton)
//             // Wait for database to be exist in the list of Autodiscover databases and select it
//             .expect(
//                 autoDiscoverREDatabases.databaseName.withExactText(
//                     databaseParameters.databaseName ?? ''
//                 ).exists
//             )
//             .ok('The database not displayed', { timeout: 10000 })
//             .typeText(
//                 autoDiscoverREDatabases.search,
//                 databaseParameters.databaseName ?? ''
//             )
//             .click(autoDiscoverREDatabases.databaseCheckbox)
//             // Click Add selected databases button
//             .click(autoDiscoverREDatabases.addSelectedDatabases)
//             .click(autoDiscoverREDatabases.viewDatabasesButton)
//     }
//
//     /**
//      * Add a new database from OSS Cluster via auto-discover flow
//      * @param databaseParameters The database parameters
//      */
//     async addOSSClusterDatabase(
//         databaseParameters: OSSClusterParameters
//     ): Promise<void> {
//         // Enter required parameters for OSS Cluster
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.addOssClusterDatabase(
//             databaseParameters
//         )
//         // Click for saving
//         await t
//             .click(this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton)
//             // Check for info message that DB was added
//             .expect(this.myRedisDatabasePage.Toast.toastHeader.exists)
//             .ok('Info message not exists', { timeout: 10000 })
//             // Wait for database to be exist
//             .expect(
//                 this.myRedisDatabasePage.dbNameList.withExactText(
//                     databaseParameters.ossClusterDatabaseName
//                 ).exists
//             )
//             .ok('The database not displayed', { timeout: 10000 })
//     }
//
//     /**
//      * Add a new database from Redis Cloud via auto-discover flow
//      * @param cloudAPIAccessKey The Cloud API Access Key
//      * @param cloudAPISecretKey The Cloud API Secret Key
//      */
//     async autodiscoverRECloudDatabase(
//         cloudAPIAccessKey: string,
//         cloudAPISecretKey: string
//     ): Promise<string> {
//         // Fill the add database form and Submit
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.addAutodiscoverRECloudDatabase(
//             cloudAPIAccessKey,
//             cloudAPISecretKey
//         )
//         await t.click(
//             this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton
//         )
//         await t
//             .expect(
//                 autoDiscoverREDatabases.title.withExactText(
//                     'Redis Cloud Subscriptions'
//                 ).exists
//             )
//             .ok('Subscriptions list not displayed', { timeout: 120000 })
//         // Select subscriptions
//         await t.click(this.myRedisDatabasePage.addRedisDatabaseDialog.selectAllCheckbox)
//         await t.click(this.myRedisDatabasePage.addRedisDatabaseDialog.showDatabasesButton)
//         // Select databases for adding
//         const databaseName = await autoDiscoverREDatabases.getDatabaseName()
//         await t.click(autoDiscoverREDatabases.databaseCheckbox)
//         await t.click(autoDiscoverREDatabases.addSelectedDatabases)
//         // Wait for database to be exist in the redis databases list
//         await t
//             .expect(
//                 autoDiscoverREDatabases.title.withExactText(
//                     'Redis Enterprise Databases Added'
//                 ).exists
//             )
//             .ok('Added databases list not displayed', { timeout: 20000 })
//         await t.click(autoDiscoverREDatabases.viewDatabasesButton)
//         // uncomment when fixed db will be added to cloud subscription
//         // await t.expect(this.myRedisDatabasePage.dbNameList.withExactText(databaseName).exists).ok('The database not displayed', { timeout: 10000 });
//         return databaseName
//     }
//
//     /**
//      * Accept License terms and add database
//      * @param databaseParameters The database parameters
//      * @param databaseName The database name
//      */
//     async acceptLicenseTermsAndAddDatabase(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         await this.acceptLicenseTerms()
//         await this.addNewStandaloneDatabase(databaseParameters)
//         // Connect to DB
//         await this.myRedisDatabasePage.clickOnDBByName(
//             databaseParameters.databaseName!
//         )
//     }
//
//     /**
//      * Accept License terms and add database using api
//      * @param databaseParameters The database parameters
//      * @param databaseName The database name
//      */
//     async acceptLicenseTermsAndAddDatabaseApi(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         await this.acceptLicenseTerms()
//         await databaseAPIRequests.addNewStandaloneDatabaseApi(
//             databaseParameters
//         )
//         // Reload Page to see the new added database through api
//         await this.myRedisDatabasePage.reloadPage()
//         // Connect to DB
//         await this.myRedisDatabasePage.clickOnDBByName(
//             databaseParameters.databaseName!
//         )
//     }
//
//     /**
//      * Accept License terms and add OSS cluster database
//      * @param databaseParameters The database parameters
//      * @param databaseName The database name
//      */
//     async acceptLicenseTermsAndAddOSSClusterDatabase(
//         databaseParameters: OSSClusterParameters
//     ): Promise<void> {
//         await this.acceptLicenseTerms()
//         await this.addOSSClusterDatabase(databaseParameters)
//         // Connect to DB
//         await this.myRedisDatabasePage.clickOnDBByName(
//             databaseParameters.ossClusterDatabaseName!
//         )
//     }
//
//     /**
//      * Accept License terms and add Sentinel database using api
//      * @param databaseParameters The database parameters
//      */
//     async acceptLicenseTermsAndAddSentinelDatabaseApi(
//         databaseParameters: SentinelParameters
//     ): Promise<void> {
//         await this.acceptLicenseTerms()
//         await databaseAPIRequests.discoverSentinelDatabaseApi(
//             databaseParameters
//         )
//         // Reload Page to see the database added through api
//         await this.myRedisDatabasePage.reloadPage()
//         // Connect to DB
//         await this.myRedisDatabasePage.clickOnDBByName(
//             databaseParameters.masters![1].alias ?? ''
//         )
//     }
//
//     /**
//      * Accept License terms and add RE Cluster database
//      * @param databaseParameters The database parameters
//      */
//     async acceptLicenseTermsAndAddREClusterDatabase(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         await this.acceptLicenseTerms()
//         await this.addNewREClusterDatabase(databaseParameters)
//         // Connect to DB
//         await this.myRedisDatabasePage.clickOnDBByName(
//             databaseParameters.databaseName ?? ''
//         )
//     }
//
//     /**
//      * Accept License terms and add RE Cloud database
//      * @param databaseParameters The database parameters
//      */
//     async acceptLicenseTermsAndAddRECloudDatabase(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         const searchTimeout = 60 * 1000 // 60 sec to wait database appearing
//         const dbSelector = this.myRedisDatabasePage.dbNameList.withExactText(
//             databaseParameters.databaseName ?? ''
//         )
//         const startTime = Date.now()
//
//         await this.acceptLicenseTerms()
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDataBase(
//             databaseParameters
//         )
//         // Click for saving
//         await t.click(
//             this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton
//         )
//         await t.wait(3000)
//         // Reload page until db appears
//         do {
//             await this.myRedisDatabasePage.reloadPage()
//         } while (
//             !(await dbSelector.exists) &&
//             Date.now() - startTime < searchTimeout
//         )
//         await t
//             .expect(
//                 this.myRedisDatabasePage.dbNameList.withExactText(
//                     databaseParameters.databaseName ?? ''
//                 ).exists
//             )
//             .ok('The database not displayed', { timeout: 5000 })
//         await this.myRedisDatabasePage.clickOnDBByName(
//             databaseParameters.databaseName ?? ''
//         )
//         await t
//             .expect(browserPage.keysSummary.exists)
//             .ok('Key list not loaded', { timeout: 15000 })
//     }
//
//     /**
//      * Add RE Cloud database
//      * @param databaseParameters The database parameters
//      */
//     async addRECloudDatabase(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         const searchTimeout = 60 * 1000 // 60 sec to wait database appearing
//         const dbSelector = this.myRedisDatabasePage.dbNameList.withExactText(
//             databaseParameters.databaseName ?? ''
//         )
//         const startTime = Date.now()
//
//         await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDataBase(
//             databaseParameters
//         )
//         // Click for saving
//         await t.click(
//             this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton
//         )
//         await t.wait(3000)
//         // Reload page until db appears
//         do {
//             await this.myRedisDatabasePage.reloadPage()
//         } while (
//             !(await dbSelector.exists) &&
//             Date.now() - startTime < searchTimeout
//         )
//         await t
//             .expect(
//                 this.myRedisDatabasePage.dbNameList.withExactText(
//                     databaseParameters.databaseName ?? ''
//                 ).exists
//             )
//             .ok('The database not displayed', { timeout: 5000 })
//     }
//
//     // Accept License terms
//     async acceptLicenseTerms(): Promise<void> {
//         // await t.maximizeWindow()
//         await userAgreementDialog.acceptLicenseTerms()
//         await updateControlNumber(48.2)
//         // Open default databases list tab if RDI opened
//         if (await rdiInstancesListPage.elementExistsLocator(rdiInstancesListPage.addRdiInstanceButton)) {
//             await this.myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase)
//         }
//         // TODO delete after releasing chatbot
//         if (await this.myRedisDatabasePage.addRedisDatabaseDialog.aiChatMessage.exists) {
//             await t.click(this.myRedisDatabasePage.addRedisDatabaseDialog.aiCloseMessage)
//         }
//     }
//
//     // Accept License terms and connect to the RedisStack database
//     async acceptLicenseAndConnectToRedisStack(): Promise<void> {
//         await this.acceptLicenseTerms()
//         // Connect to DB
//         await t
//             .click(this.myRedisDatabasePage.NavigationPanel.myRedisDBButton)
//             .click(
//                 this.myRedisDatabasePage.addRedisDatabaseDialog.connectToRedisStackButton
//             )
//     }
//
//     /**
//      * Delete database
//      * @param databaseName The database name
//      */
//     async deleteDatabase(databaseName: string): Promise<void> {
//         await t.click(this.myRedisDatabasePage.NavigationPanel.myRedisDBButton)
//         if (
//             await this.myRedisDatabasePage.addRedisDatabaseDialog.addDatabaseButton.exists
//         ) {
//             await this.deleteDatabaseByNameApi(databaseName)
//         }
//     }
//
//     /**
//      * Delete database with custom name
//      * @param databaseName The database name
//      */
//     async deleteCustomDatabase(databaseName: string): Promise<void> {
//         await t.click(this.myRedisDatabasePage.NavigationPanel.myRedisDBButton)
//         if (
//             await this.myRedisDatabasePage.addRedisDatabaseDialog.addDatabaseButton.exists
//         ) {
//             await this.myRedisDatabasePage.deleteDatabaseByName(databaseName)
//         }
//     }
//
//     /**
//      * Accept License terms and add database or connect to the Redis stask database
//      * @param databaseParameters The database parameters
//      * @param databaseName The database name
//      */
//     async acceptTermsAddDatabaseOrConnectToRedisStack(
//         databaseParameters: AddNewDatabaseParameters
//     ): Promise<void> {
//         if (
//             await this.myRedisDatabasePage.addRedisDatabaseDialog.addDatabaseButton.exists
//         ) {
//             await this.acceptLicenseTermsAndAddDatabase(databaseParameters)
//         }
//         else {
//             await this.acceptLicenseAndConnectToRedisStack()
//         }
//     }
//
//     /**
//      * Click on the edit database button by name
//      * @param databaseName The name of the database
//      */
//     async clickOnEditDatabaseByName(databaseName: string): Promise<void> {
//         const databaseId = await databaseAPIRequests.getDatabaseIdByName(
//             databaseName
//         )
//         const databaseEditBtn = Selector(
//             `[data-testid=edit-instance-${databaseId}]`
//         )
//
//         await t
//             .expect(databaseEditBtn.exists)
//             .ok(`"${databaseName}" database not displayed`)
//         await t.click(databaseEditBtn)
//     }
//
//     /**
//      * Delete database button by name
//      * @param databaseName The name of the database
//      */
//     async deleteDatabaseByNameApi(databaseName: string): Promise<void> {
//         const databaseId = await databaseAPIRequests.getDatabaseIdByName(
//             databaseName
//         )
//         const databaseDeleteBtn = Selector(
//             `[data-testid=delete-instance-${databaseId}-icon]`
//         )
//
//         await t
//             .expect(databaseDeleteBtn.exists)
//             .ok(`"${databaseName}" database not displayed`)
//         await t.click(databaseDeleteBtn)
//         await t.click(this.myRedisDatabasePage.confirmDeleteButton)
//     }
// }
import {expect, Page} from '@playwright/test'
import { DatabaseAPIRequests } from './api/api-databases'
import { RedisOverviewPage } from './constants'
import { updateControlNumber } from './electron/insights'
import {
    AddNewDatabaseParameters,
    SentinelParameters,
    OSSClusterParameters
} from '../types'
import { UserAgreementDialog } from '../pageObjects/dialogs/user-agreement-dialog'
import { RdiInstancesListPage } from '../pageObjects/rdi-instances-list-page'
// import { DiscoverMasterGroupsPage } from '../pageObjects/sentinel/discovered-sentinel-master-groups-page'
import {
    MyRedisDatabasePage,
    BrowserPage,
    AutoDiscoverREDatabases,
    AddRedisDatabaseDialog
} from '../pageObjects'


export class DatabaseHelper {
    private myRedisDatabasePage: MyRedisDatabasePage
    private addRedisDataBaseDialog: AddRedisDatabaseDialog

// const discoverMasterGroupsPage = new DiscoverMasterGroupsPage()
    private autoDiscoverREDatabases: AutoDiscoverREDatabases
    private browserPage: BrowserPage
    private userAgreementDialog: UserAgreementDialog
    private databaseAPIRequests: DatabaseAPIRequests
    private rdiInstancesListPage: RdiInstancesListPage

   constructor(page: Page, apiUrl: string) {
        this.addRedisDataBaseDialog = new AddRedisDatabaseDialog(page)
        this.autoDiscoverREDatabases = new AutoDiscoverREDatabases(page)
        this.browserPage = new BrowserPage(page)
        this.userAgreementDialog = new UserAgreementDialog(page)
        this.rdiInstancesListPage = new RdiInstancesListPage(page)
        this.myRedisDatabasePage = new MyRedisDatabasePage(page, apiUrl)
        this.databaseAPIRequests = new DatabaseAPIRequests(apiUrl)


   }
    /**
     * Add a new database manually using host and port
     * @param databaseParameters The database parameters
     */
    async addNewStandaloneDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        // Fill the add database form

        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDataBase(
            databaseParameters
        )
        // Click for saving
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
        // Wait for database to exist
        await expect(
            this.myRedisDatabasePage.dbNameList.getByText(databaseParameters.databaseName ?? '', { exact: true })
        ).toBeVisible({ timeout: 10000 })
        // Close message
        await this.myRedisDatabasePage.toast.toastCloseButton.click()
    }

    // /**
    //  * Add a new database via autodiscover using Sentinel option
    //  * @param databaseParameters The Sentinel parameters: host, port and sentinel password
    //  */
    // async discoverSentinelDatabase(
    //     databaseParameters: SentinelParameters
    // ): Promise<void> {
    //     // Fill sentinel parameters to auto-discover Master Groups
    //     await this.myRedisDatabasePage.addRedisDatabaseDialog.discoverSentinelDatabases(
    //         databaseParameters
    //     )
    //     // Click for autodiscover
    //     await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
    //     await expect(discoverMasterGroupsPage.addPrimaryGroupButton).toBeVisible({
    //         timeout: 10000
    //     })
    //     // Select Master Groups and Add to Redis Insight
    //     await discoverMasterGroupsPage.addMasterGroups()
    //     await autoDiscoverREDatabases.viewDatabasesButton.click()
    // }

    /**
     * Add a new database from RE Cluster via auto-discover flow
     * @param databaseParameters The database parameters
     */
    async addNewREClusterDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        // Fill the add database form
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addAutodiscoverREClusterDatabase(
            databaseParameters
        )
        // Click on submit button
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
        // Wait for database to exist in the list of Autodiscover databases and select it
        await expect(
            this.autoDiscoverREDatabases.databaseName.getByText(databaseParameters.databaseName ?? '', { exact: true })
        ).toBeVisible({ timeout: 10000 })
        await this.autoDiscoverREDatabases.search.fill(databaseParameters.databaseName ?? '')
        await this.autoDiscoverREDatabases.databaseCheckbox.click()
        // Click Add selected databases button
        await this.autoDiscoverREDatabases.addSelectedDatabases.click()
        await this.autoDiscoverREDatabases.viewDatabasesButton.click()
    }

    /**
     * Add a new database from OSS Cluster via auto-discover flow
     * @param databaseParameters The database parameters
     */
    async addOSSClusterDatabase(
        databaseParameters: OSSClusterParameters
    ): Promise<void> {
        // Enter required parameters for OSS Cluster
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addOssClusterDatabase(
            databaseParameters
        )
        // Click for saving
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
        // Check for info message that DB was added
        await expect(this.myRedisDatabasePage.toast.toastHeader).toBeVisible({ timeout: 10000 })
        // Wait for database to exist
        await expect(
            this.myRedisDatabasePage.dbNameList.getByText(databaseParameters.ossClusterDatabaseName, { exact: true })
        ).toBeVisible({ timeout: 10000 })
    }

    /**
     * Add a new database from Redis Cloud via auto-discover flow
     * @param cloudAPIAccessKey The Cloud API Access Key
     * @param cloudAPISecretKey The Cloud API Secret Key
     */
    async autodiscoverRECloudDatabase(
        cloudAPIAccessKey: string,
        cloudAPISecretKey: string
    ): Promise<string> {
        // Fill the add database form and Submit
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addAutodiscoverRECloudDatabase(
            cloudAPIAccessKey,
            cloudAPISecretKey
        )
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
        await expect(
            autoDiscoverREDatabases.title.getByText('Redis Cloud Subscriptions', { exact: true })
        ).toBeVisible({ timeout: 120000 })
        // Select subscriptions
        await this.myRedisDatabasePage.addRedisDatabaseDialog.selectAllCheckbox.click()
        await this.myRedisDatabasePage.addRedisDatabaseDialog.showDatabasesButton.click()
        // Select databases for adding
        const databaseName = await autoDiscoverREDatabases.getDatabaseName()
        await autoDiscoverREDatabases.databaseCheckbox.click()
        await autoDiscoverREDatabases.addSelectedDatabases.click()
        // Wait for database to exist in the redis databases list
        await expect(
            autoDiscoverREDatabases.title.getByText('Redis Enterprise Databases Added', { exact: true })
        ).toBeVisible({ timeout: 20000 })
        await autoDiscoverREDatabases.viewDatabasesButton.click()
        // uncomment when fixed db will be added to cloud subscription
        // await expect(this.myRedisDatabasePage.dbNameList.getByText(databaseName, { exact: true })).toBeVisible({ timeout: 10000 });
        return databaseName
    }

    /**
     * Accept License terms and add database
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptLicenseTermsAndAddDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        await this.acceptLicenseTerms()
        await this.addNewStandaloneDatabase(databaseParameters)
        // Connect to DB
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName!)
    }

    /**
     * Accept License terms and add database using api
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptLicenseTermsAndAddDatabaseApi(
        databaseParameters: AddNewDatabaseParameters,
        page: Page,
        apiUrl: string
    ): Promise<void> {
        await this.acceptLicenseTerms(page,apiUrl)
        await this.databaseAPIRequests.addNewStandaloneDatabaseApi(databaseParameters)
        // Reload Page to see the new added database through api
        await this.myRedisDatabasePage.reloadPage()
        // Connect to DB
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName!)
    }

    /**
     * Accept License terms and add OSS cluster database
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptLicenseTermsAndAddOSSClusterDatabase(
        databaseParameters: OSSClusterParameters
    ): Promise<void> {
        await this.acceptLicenseTerms()
        await this.addOSSClusterDatabase(databaseParameters)
        // Connect to DB
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.ossClusterDatabaseName!)
    }

    /**
     * Accept License terms and add Sentinel database using api
     * @param databaseParameters The database parameters
     */
    async acceptLicenseTermsAndAddSentinelDatabaseApi(
        databaseParameters: SentinelParameters
    ): Promise<void> {
        await this.acceptLicenseTerms()
        await databaseAPIRequests.discoverSentinelDatabaseApi(databaseParameters)
        // Reload Page to see the database added through api
        await this.myRedisDatabasePage.reloadPage()
        // Connect to DB
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.masters![1].alias ?? '')
    }

    /**
     * Accept License terms and add RE Cluster database
     * @param databaseParameters The database parameters
     */
    async acceptLicenseTermsAndAddREClusterDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        await this.acceptLicenseTerms()
        await this.addNewREClusterDatabase(databaseParameters)
        // Connect to DB
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName ?? '')
    }

    /**
     * Accept License terms and add RE Cloud database
     * @param databaseParameters The database parameters
     */
    async acceptLicenseTermsAndAddRECloudDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const searchTimeout = 60 * 1000 // 60 sec to wait database appearing
        const dbSelector = this.myRedisDatabasePage.dbNameList.getByText(databaseParameters.databaseName ?? '', { exact: true })
        const startTime = Date.now()

        await this.acceptLicenseTerms()
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDataBase(databaseParameters)
        // Click for saving
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
        await this.myRedisDatabasePage.page.waitForTimeout(3000)
        // Reload page until db appears
        while (!(await dbSelector.isVisible()) && Date.now() - startTime < searchTimeout) {
            await this.myRedisDatabasePage.reloadPage()
        }
        await expect(
            this.myRedisDatabasePage.dbNameList.getByText(databaseParameters.databaseName ?? '', { exact: true })
        ).toBeVisible({ timeout: 5000 })
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName ?? '')
        await expect(browserPage.keysSummary).toBeVisible({ timeout: 15000 })
    }

    /**
     * Add RE Cloud database
     * @param databaseParameters The database parameters
     */
    async addRECloudDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const searchTimeout = 60 * 1000 // 60 sec to wait database appearing
        const dbSelector = this.myRedisDatabasePage.dbNameList.getByText(databaseParameters.databaseName ?? '', { exact: true })
        const startTime = Date.now()

        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDataBase(databaseParameters)
        // Click for saving
        await this.myRedisDatabasePage.addRedisDatabaseDialog.addRedisDatabaseButton.click()
        await this.myRedisDatabasePage.page.waitForTimeout(3000)
        // Reload page until db appears
        while (!(await dbSelector.isVisible()) && Date.now() - startTime < searchTimeout) {
            await this.myRedisDatabasePage.reloadPage()
        }
        await expect(
            this.myRedisDatabasePage.dbNameList.getByText(databaseParameters.databaseName ?? '', { exact: true })
        ).toBeVisible({ timeout: 5000 })
    }

    // Accept License terms
    async acceptLicenseTerms(page: Page, apiUrl: string ): Promise<void> {
        // await this.myRedisDatabasePage.page.viewportSize(); // (if needed to maximize window)
        await this.userAgreementDialog.acceptLicenseTerms()
        await updateControlNumber(48.2, page, apiUrl)
        // Open default databases list tab if RDI opened
        if (await this.rdiInstancesListPage.elementExistsLocator(this.rdiInstancesListPage.addRdiInstanceButton)) {
            await this.myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase)
        }
        // TODO delete after releasing chatbot
        if (await this.myRedisDatabasePage.addRedisDatabaseDialog.aiChatMessage.isVisible()) {
            await this.myRedisDatabasePage.addRedisDatabaseDialog.aiCloseMessage.click()
        }
    }

    // Accept License terms and connect to the RedisStack database
    // async acceptLicenseAndConnectToRedisStack(): Promise<void> {
    //     await this.acceptLicenseTerms()
    //     // Connect to DB
    //     await this.myRedisDatabasePage.NavigationPanel.myRedisDBButton.click()
    //     await this.myRedisDatabasePage.addRedisDatabaseDialog.connectToRedisStackButton.click()
    // }

    /**
     * Delete database
     * @param databaseName The database name
     */
    // async deleteDatabase(databaseName: string): Promise<void> {
    //     await this.myRedisDatabasePage.NavigationPanel.myRedisDBButton.click()
    //     if (
    //         await this.myRedisDatabasePage.addRedisDatabaseDialog.addDatabaseButton.isVisible()
    //     ) {
    //         await this.deleteDatabaseByNameApi(databaseName)
    //     }
    // }

    /**
     * Delete database with custom name
     * @param databaseName The database name
    //  */
    // async deleteCustomDatabase(databaseName: string): Promise<void> {
    //     await this.myRedisDatabasePage.NavigationPanel.myRedisDBButton.click()
    //     if (
    //         await this.myRedisDatabasePage.addRedisDatabaseDialog.addDatabaseButton.isVisible()
    //     ) {
    //         await this.myRedisDatabasePage.deleteDatabaseByName(databaseName)
    //     }
    // }

    // /**
    //  * Accept License terms and add database or connect to the Redis stask database
    //  * @param databaseParameters The database parameters
    //  * @param databaseName The database name
    //  */
    // async acceptTermsAddDatabaseOrConnectToRedisStack(
    //     databaseParameters: AddNewDatabaseParameters
    // ): Promise<void> {
    //     if (
    //         await this.myRedisDatabasePage.addRedisDatabaseDialog.addDatabaseButton.isVisible()
    //     ) {
    //         await this.acceptLicenseTermsAndAddDatabase(databaseParameters)
    //     } else {
    //         await this.acceptLicenseAndConnectToRedisStack()
    //     }
    // }

    /**
     * Click on the edit database button by name
     * @param databaseName The name of the database
     */
    async clickOnEditDatabaseByName(databaseName: string): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        const databaseEditBtn = this.myRedisDatabasePage.page.locator(
            `[data-testid=edit-instance-${databaseId}]`
        )

        await expect(databaseEditBtn).toBeVisible()
        await databaseEditBtn.click()
    }

    /**
     * Delete database button by name
     * @param databaseName The name of the database
     */
    async deleteDatabaseByNameApi(databaseName: string): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        const databaseDeleteBtn = this.myRedisDatabasePage.page.locator(
            `[data-testid=delete-instance-${databaseId}-icon]`
        )

        await expect(databaseDeleteBtn).toBeVisible()
        await databaseDeleteBtn.click()
        await this.myRedisDatabasePage.confirmDeleteButton.click()
    }
}
