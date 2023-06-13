import { Selector } from 'testcafe';
import { TriggersAndFunctionLibrary } from '../interfaces/triggers-and-functions';
import { InstancePage } from './instance-page';

export class TriggersAndFunctionsPage extends InstancePage {
    //Containers
    libraryRow = Selector('[data-testid=row-]');
    /**
     * Is library displayed in the table
     * @param libraryName The Library Name
     */
    getLibraryNameSelector(libraryName: string):  Selector {
        return Selector(`[data-testid=row-${libraryName}]`);
    }

    /**
     * Get library item by name
     * @param libraryName The Library Name
     */
    async getLibraryItem(libraryName: string):  Promise<TriggersAndFunctionLibrary> {
        const item = {} as TriggersAndFunctionLibrary;
        const row = this.getLibraryNameSelector(libraryName);
        item.name = await row.find('span').nth(0).textContent;
        item.user = await row.find('span').nth(1).textContent;
        item.pending = parseInt(await row.find('span').nth(2).textContent);
        item.totalFunctions = parseInt(await row.find('span').nth(3).textContent);

        return item;
    }
}

