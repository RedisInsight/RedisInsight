import { Page, Locator, expect } from '@playwright/test'
import { BaseOverviewPage } from './base-overview-page'
import { AddRdiInstanceDialog, RdiInstance } from './dialogs/add-rdi-instance-dialog'

export class RdiInstancesListPage extends BaseOverviewPage {
    readonly page: Page

    // readonly AddRdiInstanceDialog: AddRdiInstanceDialog

    readonly addRdiInstanceButton: Locator

    readonly addRdiFromEmptyListBtn: Locator

    readonly quickstartBtn: Locator

    readonly rdiInstanceRow: Locator

    readonly emptyRdiList: Locator

    readonly rdiNameList: Locator

    readonly searchInput: Locator

    readonly sortBy: Locator

    readonly cssRdiAlias: string

    readonly cssUrl: string

    readonly cssRdiVersion: string

    readonly cssLastConnection: string

    // Assuming these selectors exist—update their locators as needed.
    readonly deleteRowButton: Locator

    readonly confirmDeleteButton: Locator

    readonly editRowButton: Locator

    readonly Toast: { toastCloseButton: Locator }

    constructor(page: Page) {
        super(page)
        this.page = page

        // this.AddRdiInstanceDialog = new AddRdiInstanceDialog(page)

        // Use getByTestId for selectors with data-testid
        this.addRdiInstanceButton = page.getByTestId('rdi-instance')
        this.addRdiFromEmptyListBtn = page.getByTestId('empty-rdi-instance-button')
        this.quickstartBtn = page.getByTestId('empty-rdi-quickstart-button')

        this.rdiInstanceRow = page.locator('[class*=euiTableRow-isSelectable]')
        this.emptyRdiList = page.getByTestId('empty-rdi-instance-list')
        this.rdiNameList = page.locator('[class*=column_name] div')

        this.searchInput = page.getByTestId('search-rdi-instance-list')

        // Selector using data-test-subj remains as locator
        this.sortBy = page.locator('[data-test-subj=tableHeaderSortButton] span')

        // CSS selectors (kept as string constants)
        this.cssRdiAlias = '[data-test-subj=rdi-alias-column]'
        this.cssUrl = '[data-testid=url]'
        this.cssRdiVersion = '[data-test-subj=rdi-instance-version-column]'
        this.cssLastConnection = '[data-test-subj=rdi-instance-last-connection-column]'

        // These selectors are assumed. Adjust the test IDs as per your application.
        this.deleteRowButton = page.getByTestId('delete-row-button')
        this.confirmDeleteButton = page.getByTestId('confirm-delete-button')
        this.editRowButton = page.getByTestId('edit-row-button')
        this.Toast = {
            toastCloseButton: page.getByTestId('toast-close-button')
        }
    }

    // /**
    //  * Add Rdi instance.
    //  * @param instanceValue Rdi instance data
    //  */
    // async addRdi(instanceValue: RdiInstance): Promise<void> {
    //     await this.page.click(this.addRdiInstanceButton)
    //     await this.page.fill(this.AddRdiInstanceDialog.rdiAliasInput, instanceValue.alias)
    //     await this.page.fill(this.AddRdiInstanceDialog.urlInput, instanceValue.url)
    //     await this.page.fill(this.AddRdiInstanceDialog.usernameInput, instanceValue.username)
    //     await this.page.fill(this.AddRdiInstanceDialog.passwordInput, instanceValue.password)
    //     await this.page.click(this.AddRdiInstanceDialog.addInstanceButton)
    // }

    /**
     * Get Rdi instance values by index.
     * @param index Index of Rdi instance.
     */
    async getRdiInstanceValuesByIndex(index: number): Promise<RdiInstance> {
        const alias = await this.rdiInstanceRow.nth(index).locator(this.cssRdiAlias).innerText()
        const currentLastConnection = await this.rdiInstanceRow.nth(0).locator(this.cssLastConnection).innerText()
        const currentVersion = await this.rdiInstanceRow.nth(0).locator(this.cssRdiVersion).innerText()
        const currentUrl = await this.rdiInstanceRow.nth(0).locator(this.cssUrl).innerText()

        const rdiInstance: RdiInstance = {
            alias,
            url: currentUrl,
            version: currentVersion,
            lastConnection: currentLastConnection,
        }

        return rdiInstance
    }

    /**
     * Delete Rdi by name.
     * @param dbName The name of the Rdi to be deleted.
     */
    async deleteRdiByName(dbName: string): Promise<void> {
        const dbNames = this.rdiInstanceRow
        const count = await dbNames.count()
        for (let i = 0; i < count; i++) {
            const text = await dbNames.nth(i).innerText()
            if (text.includes(dbName)) {
                await this.page.click(this.deleteRowButton.nth(i))
                await this.page.click(this.confirmDeleteButton)
                break
            }
        }
    }

    /**
     * Edit Rdi by name.
     * @param dbName The name of the Rdi to be edited.
     */
    async clickEditRdiByName(dbName: string): Promise<void> {
        const rdiNames = this.rdiInstanceRow
        const count = await rdiNames.count()
        for (let i = 0; i < count; i++) {
            const text = await rdiNames.nth(i).innerText()
            if (text.includes(dbName)) {
                await this.page.click(this.editRowButton.nth(i))
                break
            }
        }
    }

    /**
     * Click Rdi by name.
     * @param rdiName The name of the Rdi.
     */
    async clickRdiByName(rdiName: string): Promise<void> {
        if (await this.Toast.toastCloseButton.isVisible()) {
            await this.page.click(this.Toast.toastCloseButton)
        }
        // Use getByText with exact match for the Rdi name
        const rdi = this.rdiNameList.getByText(rdiName.trim(), { exact: true })
        await expect(rdi).toBeVisible({ timeout: 3000 })
        await rdi.click()
    }

    /**
     * Sort Rdi list by column.
     * @param columnName The name of the column.
     */
    async sortByColumn(columnName: string): Promise<void> {
        await this.page.click(this.sortBy.filter({ hasText: columnName }))
    }

    /**
     * Get all Rdi aliases.
     */
    async getAllRdiNames(): Promise<string[]> {
        const rdis: string[] = []
        const count = await this.rdiInstanceRow.count()
        for (let i = 0; i < count; i++) {
            const name = await this.rdiInstanceRow.nth(i).locator(this.cssRdiAlias).innerText()
            rdis.push(name)
        }
        return rdis
    }
}
