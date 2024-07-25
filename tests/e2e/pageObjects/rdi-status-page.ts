import { Selector, t } from 'testcafe';
import { BaseOverviewPage } from './base-overview-page';
import { RdiNavigationPanel } from './components/navigation/rdi-navigation-panel';

export class RdiStatusPage extends BaseOverviewPage {

    NavigationPanel = new RdiNavigationPanel();

    targetConnectionTable = Selector('[data-testid=target-connections-table]');
    processingPerformanceInformationContainer = Selector('[aria-controls=processing-performance-info]');
    processingPerformanceInformationTable = Selector('[id=processing-performance-info]');
    dataStreamsOverviewTable = Selector('[data-testid=data-streams-table]');
    clientsTable = Selector('[data-testid=clients-table]');

    refreshStreamsButton = Selector('[data-testid=data-streams-refresh-btn]');
    processingPerformanceRefreshMessage = Selector('[data-testid=processing-performance-info-refresh-message]');
    clientRefreshMessage = Selector('[data-testid=clients-refresh-message]');
    dataStreamsRefreshMessage = Selector('[data-testid=data-streams-refresh-message]');

    tooltip = Selector('[role=tooltip]', { timeout: 500 });

    /**
     * Get row data
     * @param tableSelector selector of the table
     * @param index number of the row
     */
    async getTableRowData(tableSelector: Selector, index: number): Promise<string[]> {
        const rowSelector = tableSelector.find('tr').nth(index);
        const text = await rowSelector.innerText;
        return text.split(/\s+/);
    }

    /**
     * Get row data
     * @param tableSelector selector of the table
     * @param index number of the row
     * @param columnIndex number of the column
     */
    async hoverValueInTable(tableSelector: Selector, rowIndex: number, columnIndex: number): Promise<void> {
        const itemSelector = tableSelector.find('tr').nth(rowIndex).find('td').nth(columnIndex);
        await t.hover(itemSelector);
    }

    /**
     * Get row data
     * @param tableSelector selector of the table
     * @param index number of the row
     * @param columnIndex number of the column
     */
    async getValueInTable(tableSelector: Selector, rowIndex: number, columnIndex: number): Promise<string> {
        const itemSelector = tableSelector.find('tr').nth(rowIndex).find('td').nth(columnIndex).find('span');
        const text =  await itemSelector.innerText;
        return text.replace(/\.{3}/g, '');
    }
}

