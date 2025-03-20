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
    AddRedisDatabaseDialog,
    BasePage
} from '../pageObjects'



export class DatabaseHelper extends BasePage{
    private myRedisDatabasePage: MyRedisDatabasePage
    private addRedisDataBaseDialog: AddRedisDatabaseDialog


// const discoverMasterGroupsPage = new DiscoverMasterGroupsPage()
    private autoDiscoverREDatabases: AutoDiscoverREDatabases
    private browserPage: BrowserPage
    private userAgreementDialog: UserAgreementDialog
    private databaseAPIRequests: DatabaseAPIRequests
    private rdiInstancesListPage: RdiInstancesListPage

   constructor(page: Page, apiUrl: string) {
        super(page)
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
        apiUrl: string,
    ): Promise<void> {

        await this.acceptLicenseTerms(page,apiUrl)
        await this.databaseAPIRequests.addNewStandaloneDatabaseApi(databaseParameters, await this.getWindowId())
        // Reload Page to see the new added database through api
        await this.myRedisDatabasePage.reloadPage()
        // Connect to DB
        await this.myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName!)

        if(await this.isVisible("Skip tour")){
            await this.page.locator("Skip tour").click()
        }

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
        // await this.myRedisDatabasePage.page.viewportSize();
        const winId = await this.getWindowId()
        await this.userAgreementDialog.acceptLicenseTerms()
        await updateControlNumber(48.2, apiUrl, winId)
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
