import { Selector, t } from 'testcafe';

export class WorkbenchPage {
    //DECLARATION OF CSS selectors
    cssSelectorPaginationButtonPrevious: string
    cssSelectorPaginationButtonNext: string
    cssReRunCommandButton: string
    cssDeleteCommandButton: string
    cssQueryCardOutputResponseSuccess: string
    cssQueryCardOutputResponseFailed: string
    cssQueryCardCommand: string
    cssQueryCardCommandResult: string
    cssTableViewTypeOption: string
    cssMonacoCommandPaletteLine: string
    cssQueryTextResult: string
    cssQueryTableResult: string
    queryGraphContainer: string
    cssCustomPluginTableResult: string
    cssCommandExecutionDateTime: string
    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------
    submitCommandButton: Selector
    resizeButtonForScriptingAndResults: Selector
    paginationButtonPrevious: Selector
    paginationButtonNext: Selector
    queryInput: Selector
    queryCardContainer: Selector
    queryCardCommand: Selector
    queryTableResult: Selector
    selectViewType: Selector
    textViewTypeOption: Selector
    queryTextResult: Selector
    preselectList: Selector
    preselectIndexInfo: Selector
    queryColumns: Selector
    preselectSearch: Selector
    preselectHashCreate: Selector
    preselectManual: Selector
    scriptsLines: Selector
    queryInputScriptArea: Selector
    overviewTotalKeys: Selector
    overviewTotalMemory: Selector
    collapsePreselectAreaButton: Selector
    expandPreselectAreaButton: Selector
    preselectButtons: Selector
    reRunCommandButton: Selector
    queryCardNoModuleOutput: Selector
    queryCardNoModuleButton: Selector
    monacoCommandDetails: Selector
    monacoCloseCommandDetails: Selector
    monacoSuggestion: Selector
    monacoCommandIndicator: Selector
    monacoContextMenu: Selector
    monacoShortcutInput: Selector
    monacoSuggestionOption: Selector
    iframe: Selector
    internalLinkWorkingWithHashes: Selector
    preselectExactSearch: Selector
    preselectGroupBy: Selector
    tableViewTypeOption: Selector
    preselectArea: Selector
    expandArea: Selector
    monacoHintWithArguments: Selector
    noCommandHistorySection: Selector
    noCommandHistoryIcon: Selector
    noCommandHistoryTitle: Selector
    noCommandHistoryText: Selector
    scrolledEnablementArea: Selector
    enablementAreaPagination: Selector
    enablementAreaPaginationPopover: Selector
    paginationPopoverButtons: Selector
    enablementAreaTreeView: Selector
    fullScreenButton: Selector
    customPluginsViewType: Selector
    preselectCreateHashIndex: Selector
    commandExecutionResult: Selector
    commandExecutionResultFailed: Selector
    monacoWidget: Selector
    cancelButton: Selector
    applyButton: Selector
    documentButtonInQuickGuides: Selector
    redisStackTutorialsButton: Selector
    vectorSimilitaritySearchButton: Selector
    nextPageButton: Selector
    prevPageButton: Selector
    hashWithVectorButton: Selector
    redisStackLinks: Selector
    workingWithGraphLink: Selector
    createGraphBikeButton: Selector
    graphViewTypeOption: Selector
    preselectModelBikeSalesButton: Selector
    queryPluginResult: Selector
    resposeInfo: Selector
    showSalesPerRegiomButton: Selector
    timeSeriesLink: Selector
    chartViewTypeOptionSelected: Selector
    mainEditorArea: Selector
    runButtonToolTip: Selector
    nonRedisEditorResizeTop: Selector
    nonRedisEditorResizeBottom: Selector

    constructor() {
        //CSS selectors
        this.cssSelectorPaginationButtonPrevious = '[data-test-subj=pagination-button-previous]';
        this.cssSelectorPaginationButtonNext = '[data-test-subj=pagination-button-next]';
        this.cssReRunCommandButton = '[data-testid=re-run-command]';
        this.cssDeleteCommandButton = '[data-testid=delete-command]';
        this.cssQueryCardOutputResponseSuccess = '[data-testid=query-card-output-response-success]';
        this.cssQueryCardOutputResponseFailed = '[data-testid=query-card-output-response-failed]';
        this.cssTableViewTypeOption = '[data-testid=view-type-selected-Plugin-redisearch__redisearch]';
        this.cssMonacoCommandPaletteLine = '[aria-label="Command Palette"]';
        this.cssQueryTextResult = '[data-testid=query-cli-result]';
        this.cssQueryTableResult = '[data-testid^=query-table-result-]';
        this.queryGraphContainer = '[data-testid=query-graph-container]';
        this.cssQueryCardCommand = '[data-testid=query-card-command]';
        this.cssQueryCardCommandResult = '[data-testid=query-common-result]';
        this.cssCustomPluginTableResult = '[data-testid^=query-table-result-client]';
        this.cssCommandExecutionDateTime = '[data-testid=command-execution-date-time]';
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        //BUTTONS
        this.submitCommandButton = Selector('[data-testid=btn-submit]');
        this.resizeButtonForScriptingAndResults = Selector('[data-test-subj=resize-btn-scripting-area-and-results]');
        this.collapsePreselectAreaButton = Selector('[data-testid=collapse-enablement-area]');
        this.expandPreselectAreaButton = Selector('[data-testid=expand-enablement-area]');
        this.paginationButtonPrevious = Selector(this.cssSelectorPaginationButtonPrevious);
        this.paginationButtonNext = Selector(this.cssSelectorPaginationButtonNext);
        this.selectViewType = Selector('[data-testid=select-view-type]');
        this.textViewTypeOption = Selector('[data-test-subj^=view-type-option-Text]');
        this.tableViewTypeOption = Selector('[data-test-subj^=view-type-option-Plugin]');
        this.graphViewTypeOption = Selector('[data-test-subj^=view-type-option-Plugin-graph]');
        this.preselectList = Selector('[data-testid*=preselect-List]');
        this.preselectHashCreate = Selector('[data-testid=preselect-Create]');
        this.preselectIndexInfo = Selector('[data-testid*=preselect-Index]');
        this.preselectSearch = Selector('[data-testid=preselect-Search]');
        this.preselectExactSearch = Selector('[data-testid="preselect-Exact text search"]');
        this.preselectCreateHashIndex = Selector('[data-testid="preselect-Create a hash index"]');
        this.preselectGroupBy = Selector('[data-testid*=preselect-Group]');
        this.preselectButtons = Selector('[data-testid^=preselect-]');
        this.reRunCommandButton = Selector('[data-testid=re-run-command]');
        this.preselectManual = Selector('[data-testid=preselect-Manual]');
        this.internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-working-with-hashes]');
        this.enablementAreaPagination = Selector('[data-testid=enablement-area__pagination-popover-btn]');
        this.paginationPopoverButtons = Selector('[data-testid=enablement-area__pagination-popover] button');
        this.fullScreenButton = Selector('[data-testid=toggle-full-screen]');
        this.cancelButton = Selector('[data-testid=cancel-btn]');
        this.applyButton = Selector('[data-testid=apply-btn]');
        this.documentButtonInQuickGuides = Selector('[data-testid=accordion-button-document]');
        this.redisStackTutorialsButton = Selector('[data-testid=accordion-button-redis_stack]');
        this.vectorSimilitaritySearchButton = Selector('[data-testid=internal-link-vector_similarity_search]');
        this.nextPageButton = Selector('[data-testid=enablement-area__next-page-btn]');
        this.prevPageButton = Selector('[data-testid=enablement-area__prev-page-btn]');
        this.hashWithVectorButton = Selector('[data-testid="preselect-A hash with vector embeddings"]');
        this.redisStackLinks = Selector('[data-testid=accordion-redis_stack] [data-testid^=internal-link]');
        this.workingWithGraphLink = Selector('[data-testid=internal-link-working_with_graphs]');
        this.createGraphBikeButton = Selector('[data-testid="preselect-Create a bike node"]');
        this.preselectModelBikeSalesButton = Selector('[data-testid="preselect-Model bike sales"]');
        this.queryPluginResult = Selector('[data-testid=query-plugin-result]');
        this.resposeInfo = Selector('[class="responseInfo"]');
        this.showSalesPerRegiomButton = Selector('[data-testid="preselect-Show all sales per region"]');
        this.timeSeriesLink = Selector('[data-testid=internal-link-redis_for_time_series]');
        // TEXT INPUTS (also referred to as 'Text fields')
        this.queryInput = Selector('[data-testid=query-input-container]');
        this.scriptsLines = Selector('[data-testid=query-input-container] .view-lines');
        this.queryCardContainer = Selector('[data-testid^=query-card-container]');
        this.queryCardCommand = Selector('[data-testid=query-card-command]');
        this.queryTableResult = Selector('[data-testid^=query-table-result-]');
        this.mainEditorArea = Selector('[data-testid=main-input-container-area]')
        this.queryTextResult = Selector(this.cssQueryTextResult);
        this.queryColumns = Selector('[data-testid*=query-column-]');
        this.queryInputScriptArea = Selector('[data-testid=query-input-container] .view-line');
        this.overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
        this.overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
        this.queryCardNoModuleOutput = Selector('[data-testid=query-card-no-module-output]');
        this.queryCardNoModuleButton = Selector('[data-testid=query-card-no-module-button] a');
        this.monacoCommandDetails = Selector('div.suggest-details-container');
        this.monacoCloseCommandDetails = Selector('span.codicon-close');
        this.monacoSuggestion = Selector('span.monaco-icon-name-container');
        this.monacoContextMenu = Selector('div.shadow-root-host').shadowRoot();
        this.monacoShortcutInput = Selector('input.input');
        this.monacoSuggestionOption = Selector('div.monaco-list-row');
        this.iframe = Selector('[data-testid=pluginIframe]', {timeout: 10000});
        this.monacoHintWithArguments = Selector('[widgetid="editor.widget.parameterHintsWidget"]');
        this.noCommandHistorySection = Selector('[data-testid=wb_no-results]');
        this.preselectArea = Selector('[data-testid=enablementArea]');
        this.expandArea = Selector('[data-testid=enablement-area-container]');
        this.noCommandHistoryIcon = Selector('[data-testid=wb_no-results__icon]');
        this.noCommandHistoryTitle = Selector('[data-testid=wb_no-results__title]');
        this.noCommandHistoryText = Selector('[data-testid=wb_no-results__summary]');
        this.monacoCommandIndicator = Selector('div.monaco-glyph-run-command');
        this.scrolledEnablementArea = Selector('[data-testid=enablement-area__page]');
        this.enablementAreaPaginationPopover = Selector('[data-testid=enablement-area__pagination-popover]');
        this.enablementAreaTreeView = Selector('[data-testid=enablementArea-treeView]');
        this.customPluginsViewType = Selector('[data-test-subj*=clients-list]');
        this.commandExecutionResult = Selector('[data-testid=query-common-result]');
        this.commandExecutionResultFailed = Selector('[data-testid=cli-output-response-fail]');
        this.monacoWidget = Selector('[data-testid=monaco-widget]');
        this.chartViewTypeOptionSelected = Selector('[data-testid=view-type-selected-Plugin-redistimeseries__redistimeseries-chart]');
        this.runButtonToolTip = Selector('[data-testid=run-query-tooltip]');
        this.nonRedisEditorResizeBottom = Selector('.t_resize-bottom');
        this.nonRedisEditorResizeTop = Selector('.t_resize-top');
    }

    /**
     * Get card container by command
     * @param command The command
     */
    async getCardContainerByCommand(command: string): Promise<Selector> {
        return this.queryCardCommand.withExactText(command).parent('[data-testid^="query-card-container-"]');
    }

    //Select Text view option in Workbench results
    async selectViewTypeText(): Promise<void> {
        await t.click(this.selectViewType);
        await t.click(this.textViewTypeOption);
    }

    //Select Table view option in Workbench results
    async selectViewTypeTable(): Promise<void> {
        await t.click(this.selectViewType);
        await t.click(this.tableViewTypeOption);
    }

    //Select view option in Workbench results
    async selectViewTypeGraph(): Promise<void> {
        await t.click(this.selectViewType);
        await t.click(this.graphViewTypeOption);
    }

    /**
     * Send a command in Workbench
     * @param command The command
     * @param speed The speed in seconds. Default is 1
     * @param paste
     */
    async sendCommandInWorkbench(command: string, speed = 1, paste = true): Promise<void> {
        await t.typeText(this.queryInput, command, { replace: true, speed, paste });
        await t.click(this.submitCommandButton);
    }

    /**
     * Send commands array in Workbench page
     * @param commands The array of commands to send
     */
    async sendCommandsArrayInWorkbench(commands: string[]): Promise<void> {
        for (const command of commands) {
            await this.sendCommandInWorkbench(command);
        }
    }

    /**
     * Send commands array in Workbench page
     * @param command The array of commands to send
     * @param result The array of commands to send
     */
    async checkWorkbenchCommandResult(command: string, result: string): Promise<void> {
        //Compare the command with executed command
        const actualCommand = await this.queryCardContainer.nth(0).find(this.cssQueryCardCommand).textContent;
        await t.expect(actualCommand).eql(command);
        //Compare the command result with executed command
        const actualCommandResult = await this.queryCardContainer.nth(0).find(this.cssQueryCardCommandResult).textContent;
        await t.expect(actualCommandResult).eql(result);
    }
}
