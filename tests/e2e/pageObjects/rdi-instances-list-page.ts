import { Selector, t } from 'testcafe';
import { AddRdiInstance, RdiInstance } from './components/myRedisDatabase/add-rdi-instance';
import { BaseOverviewPage } from './base-overview-page';
import { RdiNavigationPanel } from './components/navigation/rdi-navigation-panel';

export class RdiInstancesListPage extends BaseOverviewPage {
    NavigationPanel = new RdiNavigationPanel();
    AddRdiInstance = new AddRdiInstance();

    rdiInstanceButton = Selector('[data-testid=rdi-instance]');

    rdiInstanceRow = Selector('[class*=euiTableRow-isSelectable]');
    emptyRdiList = Selector('[data-testid=empty-rdi-instance-list]', { timeout: 1000 });
    rdiNameList = Selector('[class*=column_name] div', { timeout: 3000 });

    searchInput = Selector('[data-testid=search-rdi-instance-list]');

    sortBy = Selector('[data-test-subj=tableHeaderSortButton] span');

    cssRdiAlias = '[data-test-subj=rdi-alias-column]';
    cssUrl = '[data-testid=url]';
    cssRdiVersion = '[data-test-subj=rdi-instance-version-column]';
    cssLastConnection = '[data-test-subj=rdi-instance-last-connection-column]';

    /**
     * add Rdi instance
     * @param instanceValue rdi instance data
     */
    async addRdi(instanceValue: RdiInstance): Promise<void> {

        await t.click(this.rdiInstanceButton);
        await t
            .typeText(this.AddRdiInstance.rdiAliasInput, instanceValue.alias)
            .typeText(this.AddRdiInstance.urlInput, instanceValue.url)
            .typeText(this.AddRdiInstance.usernameInput, instanceValue.username as string)
            .typeText(this.AddRdiInstance.passwordInput, instanceValue.password as string);
        await t.click(this.AddRdiInstance.addInstanceButton);

    }

    /**
     * get Rdi instance by index
     * @param index index of rdi
     */
    async getRdiInstanceValuesByIndex(index: number): Promise<RdiInstance> {
        const alias: string = await this.rdiInstanceRow.nth(index).find(this.cssRdiAlias).innerText;
        const currentLastConnection: string =  await this.rdiInstanceRow.nth(0).find(this.cssLastConnection).innerText;
        const currentVersion: string =  await this.rdiInstanceRow.nth(0).find(this.cssRdiVersion).innerText;
        const currentUrl: string =  await this.rdiInstanceRow.nth(0).find(this.cssUrl).innerText;

        const rdiInstance: RdiInstance = {
            alias: alias,
            url: currentUrl,
            version: currentVersion,
            lastConnection: currentLastConnection
        };

        return rdiInstance;
    }

    /**
     * Delete Rdi by name
     * @param dbName The name of the rdi to be deleted
     */
    async deleteRdiByName(dbName: string): Promise<void> {
        const dbNames = this.rdiInstanceRow;
        const count = await dbNames.count;

        for (let i = 0; i < count; i++) {
            if ((await dbNames.nth(i).innerText || '').includes(dbName)) {
                await t
                    .click(this.deleteRowButton.nth(i))
                    .click(this.confirmDeleteButton);
                break;
            }
        }
    }

    /**
     * Edit Rdi by name
     * @param dbName The name of the rdi to be deleted
     */
    async editRdiByName(dbName: string): Promise<void> {
        const rdiNames = this.rdiInstanceRow;
        const count = await rdiNames.count;

        for (let i = 0; i < count; i++) {
            if ((await rdiNames.nth(i).innerText || '').includes(dbName)) {
                await t
                    .click(this.editRowButton.nth(i));
                break;
            }
        }
    }

    /**
     * click Rdi by name
     * @param dbName The name of the rdi
     */
    async clickRdiByName(rdiName: string): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        const rdi = this.rdiNameList.withExactText(rdiName.trim());
        await t.expect(rdi.exists).ok(`"${rdi}" rdi doesn't exist`, { timeout: 10000 });
        await t.click(rdi);
    }

    /**
     * Sort rdi list by column
     * @param columnName The name of column
     */
    async sortByColumn(columnName: string): Promise<void> {
        await t.click(this.sortBy.withText(columnName));
    }
    /**
     * Get all Rdi alias
     */
    async getAllRdiNames(): Promise<string[]> {
        const rdis: string[] = [];
        const n = await this.rdiInstanceRow.count;

        for(let k = 0; k < n; k++) {
            const name = await this.rdiInstanceRow.nth(k).find(this.cssRdiAlias).innerText;
            rdis.push(name);
        }
        return rdis;
    }
}

