import {Selector} from 'testcafe';

export class MemoryEfficiencyPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // CSS Selectors
    cssCodeChangesLabel = '[data-testid=code_changes]';
    cssConfigurationChangesLabel = '[data-testid=configuration_changes]';
    cssReadMoreLink = '[data-testid=read-more-link]';
    cssToTutorialsBtn = '[data-testid=RTS-to-tutorial-btn]';
    // BUTTONS
    newReportBtn = Selector('[data-testid=start-database-analysis-btn]');
    expandArrowBtn = Selector('[data-testid^=expand-arrow-]');
    sortByKeyPattern = Selector('[data-testid=tableHeaderSortButton]');
    showNoExpiryToggle = Selector('[data-testid=show-no-expiry-switch]');
    reportItem = Selector('[data-test-subj^=items-report-]');
    selectedReport = Selector('[data-testid=select-report]');
    sortByLength = Selector('[data-testid=btn-change-table-keys]');
    recommendationsTab = Selector('[data-testid=Recommendations-tab]');
    luaScriptButton = Selector('[data-test-subj=luaScript-button]');
    useSmallKeysButton = Selector('[data-test-subj=useSmallerKeys-button]');
    // ICONS
    reportTooltipIcon = Selector('[data-testid=db-new-reports-icon]');
    // TEXT ELEMENTS
    noReportsText = Selector('[data-testid=empty-analysis-no-reports]');
    noKeysText = Selector('[data-testid=empty-analysis-no-keys]');
    scannedPercentageInReport = Selector('[data-testid=analysis-progress]');
    scannedKeysInReport = Selector('[data-testid=bulk-delete-summary]');
    topKeysTitle = Selector('[data-testid=top-keys-title]');
    topKeysKeyName = Selector('[data-testid=top-keys-table-name]');
    topNamespacesEmptyContainer = Selector('[data-testid=top-namespaces-empty]');
    topNamespacesEmptyMessage = Selector('[data-testid=top-namespaces-message]');
    noRecommendationsMessage =  Selector('[data-testid=empty-recommendations-message]');
    codeChangesLabel = Selector('[data-testid=code_changes]');
    configurationChangesLabel = Selector('[data-testid=configuration_changes]');
    topKeysKeySizeCell = Selector('[data-testid^=nsp-usedMemory-value]');
    topKeysLengthCell = Selector('[data-testid^=length-value]');
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
    // LINKS
    treeViewLink = Selector('[data-testid=tree-view-page-link]');
    readMoreLink = Selector('[data-testid=read-more-link]');
    // CONTAINERS
    luaScriptAccordion = Selector('[data-testid=luaScript-accordion]');
    luaScriptTextContainer = Selector('#luaScript');
    useSmallKeysAccordion = Selector('[data-testid=useSmallerKeys-accordion]');
    bigHashesAccordion = Selector('[data-testid=bigHashes-accordion]');
    combineStringsAccordion = Selector('[data-testid=combineSmallStringsToHashes-accordion]');
    increaseSetAccordion = Selector('[data-testid=increaseSetMaxIntsetEntries-accordion]');
    avoidLogicalDbAccordion = Selector('[data-testid=avoidLogicalDatabases-accordion]');
    convertHashToZipAccordion = Selector('[data-testid=convertHashtableToZiplist-accordion]');
    compressHashAccordion = Selector('[data-testid=compressHashFieldNames-accordion]');
    veryUsefulVoteBtn = Selector('[data-testid=very-useful-vote-btn]').nth(0);
    usefulVoteBtn = Selector('[data-testid=useful-vote-btn]').nth(0);
    notUsefulVoteBtn = Selector('[data-testid=not-useful-vote-btn]').nth(0);
    recommendationsFeedbackBtn = Selector('[data-testid=recommendation-feedback-btn]');
    toTutorialsBtn = Selector('[data-testid=RTS-to-tutorial-btn]');
    rtsAccordeon = Selector('[data-testid=RTS-accordion]');

    /**
     * Find recommendation selector by name
     * @param name A recommendation name
     */
    async getRecommendationByName(name: string): Promise<Selector> {
        return Selector('div').withExactText(name).parent('[data-testid=RTS-accordion]').parent();
    }
}
