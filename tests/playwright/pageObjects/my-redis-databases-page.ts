import { expect, Locator, Page } from '@playwright/test'
// import { InsightsPanel } from './components/insights-panel'
import { BaseOverviewPage } from './base-overview-page'
import { Toast } from './components/common/toast'
// import { NavigationPanel } from './components/navigation-panel'
// import { NavigationHeader } from './components/navigation/navigation-header'
// import { AuthorizationDialog } from './dialogs/authorization-dialog'
// import { AddRedisDatabaseDialog } from './dialogs'
// import { DatabaseAPIRequests } from '../helpers/api/api-database'

export type DatabasesForImport = {
    host?: string,
    port?: number | string,
    name?: string,
    result?: string,
    username?: string,
    auth?: string,
    cluster?: boolean | string,
    indName?: string,
    db?: number,
    ssh_port?: number,
    timeout_connect?: number,
    timeout_execute?: number,
    other_field?: string,
    ssl?: boolean,
    ssl_ca_cert_path?: string,
    ssl_local_cert_path?: string,
    ssl_private_key_path?: string
}[]

export class MyRedisDatabasePage extends BaseOverviewPage {
    // // Component Instances
    // private readonly navigationPanel: NavigationPanel
    //
    // private readonly addRedisDatabaseDialog: AddRedisDatabaseDialog
    //
    // private readonly insightsPanel: InsightsPanel
    //
    // private readonly navigationHeader: NavigationHeader
    //
    // private readonly authorizationDialog: AuthorizationDialog
    //
    // // API instance
    // private readonly databaseAPIRequests: DatabaseAPIRequests
    //
    // // CSS Selectors
    // private readonly cssNumberOfDbs: Locator
    //
    // private readonly cssRedisStackIcon: Locator
    //
    // // BUTTONS
    // private readonly deleteDatabaseButton: Locator
    //
    // private readonly confirmDeleteButton: Locator
    //
    // private readonly deleteButtonInPopover: Locator
    //
    // private readonly confirmDeleteAllDbButton: Locator
    //
    // private readonly editDatabaseButton: Locator
    //
    // private readonly popoverHeader: Locator
    //
    // private readonly submitChangesButton: Locator
    //
    // private readonly promoButton: Locator
    //
    // private readonly sortByDatabaseAlias: Locator
    //
    // private readonly sortByHostAndPort: Locator
    //
    // private readonly sortByConnectionType: Locator
    //
    // private readonly importDatabasesBtn: Locator
    //
    // private readonly retryImportBtn: Locator
    //
    // private readonly removeImportedFileBtn: Locator
    //
    // private readonly exportBtn: Locator
    //
    // private readonly exportSelectedDbsBtn: Locator
    //
    // private readonly userProfileBtn: Locator
    //
    // private readonly closeImportBtn: Locator
    //
    // // CHECKBOXES
    // private readonly selectAllCheckbox: Locator
    //
    // private readonly exportPasswordsCheckbox: Locator
    //
    // private readonly starFreeDbCheckbox: Locator
    //
    // // ICONS
    // private readonly moduleColumn: Locator
    //
    // private readonly moduleSearchIcon: Locator
    //
    // private readonly moduleGraphIcon: Locator
    //
    // private readonly moduleJSONIcon: Locator
    //
    // private readonly moduleTimeseriesIcon: Locator
    //
    // private readonly moduleBloomIcon: Locator
    //
    // private readonly moduleAIIcon: Locator
    //
    // private readonly moduleGearsIcon: Locator
    //
    // private readonly redisStackIcon: Locator
    //
    // private readonly tooltipRedisStackLogo: Locator
    //
    // private readonly iconNotUsedDatabase: Locator
    //
    // private readonly iconDeletedDatabase: Locator
    //
    // // TEXT INPUTS
    // private readonly searchInput: Locator
    //
    // private readonly importDatabaseInput: Locator
    //
    // // TEXT ELEMENTS
    // private readonly moduleTooltip: Locator
    //
    // private readonly moduleQuantifier: Locator
    //
    private readonly dbNameList: Locator
    //
    // private readonly tableRowContent: Locator
    //
    // private readonly hostPort: Locator
    //
    // private readonly failedImportMessage: Locator
    //
    // private readonly importResult: Locator
    //
    // private readonly userProfileAccountInfo: Locator
    //
    // private readonly portCloudDb: Locator
    //
    // // DIALOG
    // private readonly successResultsAccordion: Locator
    //
    // private readonly partialResultsAccordion: Locator
    //
    // private readonly failedResultsAccordion: Locator
    //
    // private readonly notificationUnusedDbMessage: Locator
    //
    // // CONTAINERS
    // private readonly databaseContainer: Locator
    //
    // private readonly connectionTypeTitle: Locator
    //
    // private readonly addDatabaseImport: Locator
    //
    // // Assumed additional selector needed in deleteDatabaseByName method
    // private readonly deleteRowButton: Locator

    constructor(page: Page) {
        super(page)
    //     this.databaseAPIRequests = new DatabaseAPIRequests()
    //
    //     // Initialize component instances
    //     this.navigationPanel = new NavigationPanel(page)
    //     this.addRedisDatabaseDialog = new AddRedisDatabaseDialog(page)
    //     this.insightsPanel = new InsightsPanel(page)
    //     this.navigationHeader = new NavigationHeader(page)
    //     this.authorizationDialog = new AuthorizationDialog(page)
    //
    //     // CSS Selectors
    //     this.cssNumberOfDbs = page.getByTestId('number-of-dbs')
    //     this.cssRedisStackIcon = page.getByTestId('redis-stack-icon')
    //
    //     // BUTTONS
    //     this.deleteDatabaseButton = page.locator('[data-testid^="delete-instance-"]')
    //     this.confirmDeleteButton = page.locator('[data-testid^="delete-instance-"]').filter({ hasText: 'Remove' })
    //     this.deleteButtonInPopover = page.locator('#deletePopover button')
    //     this.confirmDeleteAllDbButton = page.getByTestId('delete-selected-dbs')
    //     this.editDatabaseButton = page.locator('[data-testid^="edit-instance"]')
    //     this.popoverHeader = page.locator('#formModalHeader')
    //     this.submitChangesButton = page.getByTestId('btn-submit')
    //     this.promoButton = page.getByTestId('promo-btn')
    //     this.sortByDatabaseAlias = page.locator('span[title="Database Alias"]')
    //     this.sortByHostAndPort = page.locator('span[title="Host:Port"]')
    //     this.sortByConnectionType = page.locator('span[title="Connection Type"]')
    //     this.importDatabasesBtn = page.getByTestId('option-btn-import')
    //     this.retryImportBtn = page.getByTestId('btn-retry')
    //     this.removeImportedFileBtn = page.locator('[aria-label="Clear selected files"]')
    //     this.exportBtn = page.getByTestId('export-btn')
    //     this.exportSelectedDbsBtn = page.getByTestId('export-selected-dbs')
    //     this.userProfileBtn = page.getByTestId('user-profile-btn')
    //     this.closeImportBtn = page.getByTestId('btn-close')
    //
    //     // CHECKBOXES
    //     this.selectAllCheckbox = page.locator('[data-test-subj="checkboxSelectAll"]')
    //     this.exportPasswordsCheckbox = page.locator('[data-testid="export-passwords"] ~ div')
    //     this.starFreeDbCheckbox = page.locator('[data-test-subj="checkboxSelectRow-create-free-cloud-db"]')
    //
    //     // ICONS
    //     this.moduleColumn = page.locator('[data-test-subj="tableHeaderCell_modules_3"]')
    //     this.moduleSearchIcon = page.locator('[data-testid^="Redis Query Engine"]')
    //     this.moduleGraphIcon = page.locator('[data-testid^="Graph"]')
    //     this.moduleJSONIcon = page.locator('[data-testid^="JSON"]')
    //     this.moduleTimeseriesIcon = page.locator('[data-testid^="Time Series"]')
    //     this.moduleBloomIcon = page.locator('[data-testid^="Probabilistic"]')
    //     this.moduleAIIcon = page.locator('[data-testid^="AI"]')
    //     this.moduleGearsIcon = page.locator('[data-testid^="Gears"]')
    //     this.redisStackIcon = page.getByTestId('redis-stack-icon')
    //     this.tooltipRedisStackLogo = page.getByTestId('tooltip-redis-stack-icon')
    //     this.iconNotUsedDatabase = page.locator('[data-testid^="database-status-tryDatabase-"]')
    //     this.iconDeletedDatabase = page.locator('[data-testid^="database-status-checkIfDeleted-"]')
    //
    //     // TEXT INPUTS
    //     this.searchInput = page.getByTestId('search-database-list')
    //     this.importDatabaseInput = page.getByTestId('import-file-modal-filepicker')
    //
    //     // TEXT ELEMENTS
    //     this.moduleTooltip = page.locator('.euiToolTipPopover')
    //     this.moduleQuantifier = page.getByTestId('_module')
        this.dbNameList = page.locator('[data-testid^="instance-name"]')
    //     this.tableRowContent = page.locator('[data-test-subj="database-alias-column"]')
    //     this.hostPort = page.getByTestId('host-port')
    //     this.failedImportMessage = page.getByTestId('result-failed')
    //     this.importResult = page.locator('[data-testid^="table-result-"]')
    //     this.userProfileAccountInfo = page.locator('[data-testid^="profile-account-"]')
    //     this.portCloudDb = page.locator('[class*="column_host"]')
    //
    //     // DIALOG
    //     this.successResultsAccordion = page.locator('[data-testid^="success-results-"]')
    //     this.partialResultsAccordion = page.locator('[data-testid^="partial-results-"]')
    //     this.failedResultsAccordion = page.locator('[data-testid^="failed-results-"]')
    //     this.notificationUnusedDbMessage = page.locator('[class^="_warningTooltipContent"]')
    //
    //     // CONTAINERS
    //     this.databaseContainer = page.locator('.databaseContainer')
    //     this.connectionTypeTitle = page.locator('[data-test-subj="tableHeaderCell_connectionType_2"]')
    //     this.addDatabaseImport = page.getByTestId('add-db_import')
    //
    //     // Additional property assumed for deleteDatabaseByName:
    //     this.deleteRowButton = page.locator('[data-testid^="delete-instance-"]')
    }

    async clickOnDBByName(dbName: string): Promise<void> {
       const toast = new Toast(this.page)
        if (await toast.isCloseButtonVisible()) {
            await toast.closeToast()
        }
        const db = this.dbNameList.filter({ hasText: dbName.trim() })
        await expect(db).toBeVisible({ timeout: 10000 })
        await db.first().click()
    }

    // async deleteAllDatabases(): Promise<void> {
    //     await this.navigationPanel.myRedisDBButton.click()
    //     const dbNames = this.tableRowContent
    //     const count = await dbNames.count()
    //     if (count > 1) {
    //         await this.selectAllCheckbox.click()
    //         await this.deleteButtonInPopover.click()
    //         await this.confirmDeleteAllDbButton.click()
    //     } else if (count === 1) {
    //         await this.deleteDatabaseButton.click()
    //         await this.confirmDeleteButton.click()
    //     }
    //     if (await this.toast.toastCloseButton.isVisible()) {
    //         await this.toast.toastCloseButton.click()
    //     }
    // }
    //
    // async deleteDatabaseByName(dbName: string): Promise<void> {
    //     const dbNames = this.tableRowContent
    //     const count = await dbNames.count()
    //     for (let i = 0; i < count; i++) {
    //         const text = (await dbNames.nth(i).textContent()) || ''
    //         if (text.includes(dbName)) {
    //             // Assuming deleteRowButton corresponds to a delete button for the row,
    //             // and we click the one at index i-1 (as per original logic)
    //             await this.deleteRowButton.nth(i - 1).click()
    //             await this.confirmDeleteButton.click()
    //             break
    //         }
    //     }
    // }
    //
    // async clickOnEditDBByName(databaseName: string): Promise<void> {
    //     const dbNames = this.dbNameList
    //     const count = await dbNames.count()
    //     for (let i = 0; i < count; i++) {
    //         const text = (await dbNames.nth(i).textContent()) || ''
    //         if (text.includes(databaseName)) {
    //             await this.editDatabaseButton.nth(i).click()
    //             break
    //         }
    //     }
    // }
    //
    // async checkModulesInTooltip(moduleNameList: string[]): Promise<void> {
    //     for (const item of moduleNameList) {
    //         await expect(this.moduleTooltip.locator('span', { hasText: `${item} v.` })).toBeVisible()
    //     }
    // }
    //
    // async checkModulesOnPage(moduleList: Locator[]): Promise<void> {
    //     for (const item of moduleList) {
    //         await expect(item).toBeVisible()
    //     }
    // }
    //
    // async getAllDatabases(): Promise<string[]> {
    //     const databases: string[] = []
    //     await expect(this.dbNameList).toBeVisible()
    //     const n = await this.dbNameList.count()
    //     for (let k = 0; k < n; k++) {
    //         const name = await this.dbNameList.nth(k).textContent()
    //         databases.push(name || '')
    //     }
    //     return databases
    // }
    //
    // async compareDatabases(actualList: string[], sortedList: string[]): Promise<void> {
    //     for (let k = 0; k < actualList.length; k++) {
    //         await expect(actualList[k].trim()).toEqual(sortedList[k].trim())
    //     }
    // }
    //
    // async verifyDatabaseStatusIsVisible(databaseName: string): Promise<void> {
    //     const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
    //     const databaseNewPoint = this.page.getByTestId(`database-status-new-${databaseId}`)
    //     await expect(databaseNewPoint).toBeVisible()
    // }
    //
    // async verifyDatabaseStatusIsNotVisible(databaseName: string): Promise<void> {
    //     const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
    //     const databaseEditBtn = this.page.getByTestId(`database-status-new-${databaseId}`)
    //     await expect(databaseEditBtn).not.toBeVisible()
    // }
    //
    // getDatabaseNamesFromListByResult(listOfDb: DatabasesForImport, result: string): string[] {
    //     return listOfDb.filter(element => element.result === result).map(item => item.name!)
    // }
}
