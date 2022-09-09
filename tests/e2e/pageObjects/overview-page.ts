import { Selector } from 'testcafe';

export class OverviewPage {
    //CSS Selectors
    cssTableRow = 'tr[class=euiTableRow]';
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    overviewTab = Selector('[data-testid=analytics-tab-ClusterDetails]');
    clusterDetailsUptime = Selector('[data-testid=cluster-details-uptime]');
    tableHeaderCell = Selector('[data-test-subj^=tableHeaderCell]');
    primaryNodesTable = Selector('[data-testid=primary-nodes-table]');
    tableRow = Selector('tr[class=euiTableRow]');

    /**
     * Get Primary nodes count in table
     */
     async getPrimaryNodesCount(): Promise<number> {
        return await this.primaryNodesTable.find(this.cssTableRow).count;
    }
}
