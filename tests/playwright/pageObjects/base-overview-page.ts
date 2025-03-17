import { expect, Locator, Page } from '@playwright/test'
import { Toast } from './components/common/toast'
import { BasePage } from './base-page'
import { RedisOverviewPage } from '../helpers/constants'
import { DatabaseAPIRequests } from '../helpers/api/api-databases'
import { DatabasesForImport } from '../types'


export class BaseOverviewPage extends BasePage {
    // Component instance used in methods
    private readonly toast: Toast

    // BUTTONS & ACTION SELECTORS
    private readonly deleteRowButton: Locator

    private readonly confirmDeleteButton: Locator

    private readonly confirmDeleteAllDbButton: Locator

    // TABLE / LIST SELECTORS
    private readonly instanceRow: Locator

    private readonly selectAllCheckbox: Locator

    private readonly deleteButtonInPopover: Locator

    private readonly dbNameList: Locator

    private readonly tableRowContent: Locator

    private readonly editDatabaseButton: Locator

    // NAVIGATION SELECTORS
    private readonly databasePageLink: Locator

    private readonly rdiPageLink: Locator

    // Additional – used for deletion by name
    private readonly deleteDatabaseButton: Locator

    // MODULE
    private readonly moduleTooltip: Locator

    // API instance if needed in child pages (unused in these methods but may be used externally)
    protected readonly databaseAPIRequests: DatabaseAPIRequests

    constructor(page: Page) {
        super(page)
        this.databaseAPIRequests = new DatabaseAPIRequests()
        this.toast = new Toast(page)

        // BUTTONS & ACTION SELECTORS
        this.deleteRowButton = page.locator('[data-testid^="delete-instance-"]')
        this.confirmDeleteButton = page.locator('[data-testid^="delete-instance-"]', { hasText: 'Remove' })
        this.confirmDeleteAllDbButton = page.getByTestId('delete-selected-dbs')

        // TABLE / LIST SELECTORS
        this.instanceRow = page.locator('[class*=euiTableRow-isSelectable]')
        this.selectAllCheckbox = page.locator('[data-test-subj="checkboxSelectAll"]')
        this.deleteButtonInPopover = page.locator('#deletePopover button')
        this.dbNameList = page.locator('[data-testid^="instance-name"]')
        this.tableRowContent = page.locator('[data-test-subj="database-alias-column"]')
        this.editDatabaseButton = page.locator('[data-testid^="edit-instance"]')

        // NAVIGATION SELECTORS
        this.databasePageLink = page.getByTestId('home-tab-databases')
        this.rdiPageLink = page.getByTestId('home-tab-rdi-instances')

        // Additional – we alias deleteDatabaseButton to the same as deleteRowButton
        this.deleteDatabaseButton = page.locator('[data-testid^="delete-instance-"]')

        // MODULE
        this.moduleTooltip = page.locator('.euiToolTipPopover')
    }

    async reloadPage(): Promise<void> {
        await this.page.reload()
    }

    async setActivePage(type: RedisOverviewPage): Promise<void> {
        if (type === RedisOverviewPage.Rdi) {
            await this.rdiPageLink.click()
        } else {
            await this.databasePageLink.click()
        }
    }

    async deleteAllInstance(): Promise<void> {
        const count = await this.instanceRow.count()
        if (count > 1) {
            await this.selectAllCheckbox.click()
            await this.deleteButtonInPopover.click()
            await this.confirmDeleteAllDbButton.click()
        } else if (count === 1) {
            await this.deleteDatabaseButton.click()
            await this.confirmDeleteButton.click()
        }
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
    }

    async deleteDatabaseByName(dbName: string): Promise<void> {
        const count = await this.tableRowContent.count()
        for (let i = 0; i < count; i++) {
            const text = (await this.tableRowContent.nth(i).textContent()) || ''
            if (text.includes(dbName)) {
                // Assumes that the delete button for the row is located at index i-1.
                await this.deleteRowButton.nth(i - 1).click()
                await this.confirmDeleteButton.click()
                break
            }
        }
    }

    async clickOnDBByName(dbName: string): Promise<void> {
        const db = this.dbNameList.filter({ hasText: dbName.trim() })
        await expect(db).toBeVisible({ timeout: 10000 })
        await db.first().click()
    }

    async clickOnEditDBByName(databaseName: string): Promise<void> {
        const count = await this.dbNameList.count()
        for (let i = 0; i < count; i++) {
            const text = (await this.dbNameList.nth(i).textContent()) || ''
            if (text.includes(databaseName)) {
                await this.editDatabaseButton.nth(i).click()
                break
            }
        }
    }

    async checkModulesInTooltip(moduleNameList: string[]): Promise<void> {
        for (const item of moduleNameList) {
            await expect(this.moduleTooltip.locator('span', { hasText: `${item} v.` })).toBeVisible()
        }
    }

    async checkModulesOnPage(moduleList: Locator[]): Promise<void> {
        for (const item of moduleList) {
            await expect(item).toBeVisible()
        }
    }

    async getAllDatabases(): Promise<string[]> {
        const databases: string[] = []
        await expect(this.dbNameList).toBeVisible()
        const n = await this.dbNameList.count()
        for (let k = 0; k < n; k++) {
            const name = await this.dbNameList.nth(k).textContent()
            databases.push(name || '')
        }
        return databases
    }

    async compareInstances(actualList: string[], sortedList: string[]): Promise<void> {
        for (let k = 0; k < actualList.length; k++) {
            await expect(actualList[k].trim()).toEqual(sortedList[k].trim())
        }
    }

    getDatabaseNamesFromListByResult(listOfDb: DatabasesForImport, result: string): string[] {
        return listOfDb.filter(element => element.result === result).map(item => item.name!)
    }
}
