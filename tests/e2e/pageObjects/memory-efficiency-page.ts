import { Selector } from 'testcafe';

export class MemoryEfficiencyPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // BUTTONS
    newReportBtn = Selector('[data-testid=start-database-analysis-btn]');
    expandArrowBtn = Selector('[data-testid^=expand-arrow-]');
    sortByKeyPattern = Selector('[data-testid=tableHeaderSortButton]');
    showNoExpiryToggle = Selector('[data-testid=show-no-expiry-switch]');
    reportItem = Selector('[data-test-subj^=items-report-]');
    selectedReport = Selector('[data-testid=select-report]');
    sortByLength = Selector('[data-testid=btn-change-table-keys]');
    // ICONS
    reportTooltipIcon = Selector('[data-testid=db-new-reports-icon]');
    // TEXT ELEMENTS
    noReportsText = Selector('[data-testid=empty-analysis-no-reports]');
    noKeysText = Selector('[data-testid=empty-analysis-no-keys]');
    scannedPercentageInReport = Selector('[data-testid=analysis-progress]');
    scannedKeysInReport = Selector('[data-testid=bulk-delete-summary]');
    topKeysTitle = Selector('[data-testid=top-keys-title]');
    topKeysKeyName = Selector('[data-testid=top-keys-table-name]');
    // TABLE
    namespaceTable = Selector('[data-testid=nsp-table-memory]');
    nameSpaceTableRows = this.namespaceTable.find('[data-testid^=row-]');
    expandedRow = Selector('[data-testid^=expanded-]');
    expandedItem = this.expandedRow.find('button');
    tableKeyPatternHeader = Selector('[data-test-subj*=tableHeaderCell_nsp]');
    tableMemoryHeader = Selector('[data-test-subj*=tableHeaderCell_memory]');
    tableKeysHeader = Selector('[data-test-subj*=tableHeaderCell_keys]');
    // GRAPH ELEMENTS
    donutTotalKeys = Selector('[data-testid=donut-title-keys]');
    firstPoint = Selector('[data-testid*=bar-3600]');
    thirdPoint = Selector('[data-testid*=bar-43200]');
    fourthPoint = Selector('[data-testid*=bar-86400]');
    noExpiryPoint = Selector('[data-testid*=bar-0-]:not(rect[data-testid=bar-0-0])');
}
