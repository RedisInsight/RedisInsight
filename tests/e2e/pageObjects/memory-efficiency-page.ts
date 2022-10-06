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
    expandArrowBtn = Selector('[data-testid=expand-arrow-test]');
    sortByKeyPattern = Selector('[data-testid=tableHeaderSortButton]');
    showNoExpiryToggle = Selector('[data-testid=show-no-expiry-switch]');
    reportItem = Selector('[data-test-subj^=items-report-]');
    selectedReport = Selector('[data-testid=select-report]');
    // ICONS
    reportTooltipIcon = Selector('[data-testid=db-new-reports-icon]');
    // TEXT ELEMENTS
    noReportsText = Selector('[data-testid=empty-analysis-no-reports]');
    noKeysText = Selector('[data-testid=empty-analysis-no-keys]');
    // TABLE
    tableRows = Selector('tr[class*=euiTableRow]');
    expandedRow = Selector('#row_test_expansion');
    tableKeyPatternHeader = Selector('[data-test-subj*=tableHeaderCell_nsp]');
    tableMemoryHeader = Selector('[data-test-subj*=tableHeaderCell_memory]');
    tableKeysHeader = Selector('[data-test-subj*=tableHeaderCell_keys]');
    // GRAPH ELEMENTS
    donutTotalKeys = Selector('[data-testid=donut-title-keys]');
    firstPoint = Selector('[data-testid*=circle-3600]');
    thirdPoint = Selector('[data-testid*=circle-43200]');
    fourthPoint = Selector('[data-testid*=circle-86400]');
    noExpiryPoint = Selector('[data-testid*=circle-0]');
    noExpiryDefaultPoint = Selector('[data-testid=circle-0-0]');
}
