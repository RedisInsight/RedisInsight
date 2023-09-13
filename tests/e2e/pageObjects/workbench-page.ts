import { Selector, t } from 'testcafe';
import { InstancePage } from './instance-page';

export class WorkbenchPage extends InstancePage {
    //CSS selectors
    cssSelectorPaginationButtonPrevious = '[data-test-subj=pagination-button-previous]';
    cssSelectorPaginationButtonNext = '[data-test-subj=pagination-button-next]';
    cssReRunCommandButton = '[data-testid=re-run-command]';
    cssDeleteCommandButton = '[data-testid=delete-command]';
    cssTableViewTypeOption = '[data-testid=view-type-selected-Plugin-redisearch__redisearch]';
    cssClientListViewTypeOption = '[data-testid=view-type-selected-Plugin-client-list__clients-list]';
    cssJsonViewTypeOption = '[data-testid=view-type-selected-Plugin-client-list__json-view]';
    cssMonacoCommandPaletteLine = '[aria-label="Command Palette"]';
    cssQueryTextResult = '[data-testid=query-cli-result]';
    cssWorkbenchCommandInHistory = '[data-testid=wb-command]';
    cssQueryTableResult = '[data-testid^=query-table-result-]';
    queryGraphContainer = '[data-testid=query-graph-container]';
    cssQueryCardCommand = '[data-testid=query-card-command]';
    cssCommandExecutionDateTime = '[data-testid=command-execution-date-time]';
    cssRowInVirtualizedTable = '[data-testid^=row-]';
    cssTutorialDeleteIcon = '[data-testid^=delete-tutorial-icon-]';
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    customTutorials = Selector('[data-testid=accordion-button-custom-tutorials]');
    tutorialOpenUploadButton = Selector('[data-testid=open-upload-tutorial-btn]');
    tutorialLinkField = Selector('[data-testid=tutorial-link-field]');
    tutorialLatestDeleteIcon = Selector('[data-testid^=delete-tutorial-icon-]').nth(0);
    tutorialDeleteButton = Selector('button[data-testid^=delete-tutorial-]');
    tutorialSubmitButton = Selector('[data-testid=submit-upload-tutorial-btn]');
    tutorialImport = Selector('[data-testid=import-tutorial]');
    tutorialAccordionButton = Selector('[data-testid^=accordion-button-]');
    submitCommandButton = Selector('[data-testid=btn-submit]');
    resizeButtonForScriptingAndResults = Selector('[data-test-subj=resize-btn-scripting-area-and-results]');
    collapsePreselectAreaButton = Selector('[data-testid=collapse-enablement-area]');
    expandPreselectAreaButton = Selector('[data-testid=expand-enablement-area]');
    paginationButtonPrevious = Selector(this.cssSelectorPaginationButtonPrevious);
    paginationButtonNext = Selector(this.cssSelectorPaginationButtonNext);
    preselectIndexInformation = Selector('[data-testid="preselect-Additional index information"]');
    preselectHashCreate = Selector('[data-testid=preselect-Create]');
    preselectExactSearch = Selector('[data-testid="preselect-Exact text search"]');
    preselectCreateHashIndex = Selector('[data-testid="preselect-Create a hash index"]');
    preselectGroupBy = Selector('[data-testid*=preselect-Group]');
    preselectButtons = Selector('[data-testid^=preselect-]');
    reRunCommandButton = Selector('[data-testid=re-run-command]');
    preselectManual = Selector('[data-testid=preselect-Manual]');
    enablementAreaPagination = Selector('[data-testid=enablement-area__pagination-popover-btn]');
    paginationPopoverButtons = Selector('[data-testid=enablement-area__pagination-popover] button');
    fullScreenButton = Selector('[data-testid=toggle-full-screen]');
    cancelButton = Selector('[data-testid=cancel-btn]');
    applyButton = Selector('[data-testid=apply-btn]');
    documentButtonInQuickGuides = Selector('[data-testid=accordion-button-document]');
    guidesGraphAccordion = Selector('[data-testid=accordion-button-graph]');
    redisStackTutorialsButton = Selector('[data-testid=accordion-button-redis_stack]');
    nextPageButton = Selector('[data-testid=enablement-area__next-page-btn]');
    prevPageButton = Selector('[data-testid=enablement-area__prev-page-btn]');
    hashWithVectorButton = Selector('[data-testid="preselect-A hash with vector embeddings"]');
    createGraphBikeButton = Selector('[data-testid="preselect-Create a bike node"]');
    preselectModelBikeSalesButton = Selector('[data-testid="preselect-Model bike sales"]');
    showSalesPerRegiomButton = Selector('[data-testid="preselect-Show all sales per region"]');
    queryCardNoModuleButton = Selector('[data-testid=query-card-no-module-button] a');
    rawModeBtn = Selector('[data-testid="btn-change-mode"]');
    closeEnablementPage = Selector('[data-testid=enablement-area__page-close]');
    groupMode = Selector('[data-testid=btn-change-group-mode]');
    copyCommand = Selector('[data-testid=copy-command]');
    redisStackTimeSeriesLoadMorePoints = Selector('[data-testid=preselect-Load more data points]');
    uploadDataBulkBtn = Selector('[data-testid=upload-data-bulk-btn]');
    uploadDataBulkApplyBtn = Selector('[data-testid=upload-data-bulk-apply-btn]');
    clearResultsBtn = Selector('[data-testid=clear-history-btn]');
    //ICONS
    noCommandHistoryIcon = Selector('[data-testid=wb_no-results__icon]');
    parametersAnchor = Selector('[data-testid=parameters-anchor]');
    groupModeIcon = Selector('[data-testid=group-mode-tooltip]');
    rawModeIcon = Selector('[data-testid=raw-mode-tooltip]');
    silentModeIcon = Selector('[data-testid=silent-mode-tooltip]');
    //LINKS
    timeSeriesLink = Selector('[data-testid=internal-link-redis_for_time_series]');
    redisStackLinks = Selector('[data-testid=accordion-redis_stack] [data-testid^=internal-link]');
    tutorialsWorkingWithGraphLink = Selector('[data-testid=internal-link-working_with_graphs]');
    guidesIntroductionGraphLink = Selector('[data-testid=internal-link-introduction]');
    internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-working-with-hashes]');
    vectorSimilitaritySearchButton = Selector('[data-testid=internal-link-vector_similarity_search]');
    //TEXT INPUTS (also referred to as 'Text fields')
    queryInput = Selector('[data-testid=query-input-container]');
    iframe = Selector('[data-testid=pluginIframe]');
    //TEXT ELEMENTS
    queryPluginResult = Selector('[data-testid=query-plugin-result]');
    responseInfo = Selector('[class="responseInfo"]');
    parsedRedisReply = Selector('[class="parsedRedisReply"]');
    scriptsLines = Selector('[data-testid=query-input-container] .view-lines');
    queryCardContainer = Selector('[data-testid^=query-card-container]');
    queryCardCommand = Selector('[data-testid=query-card-command]');
    queryTableResult = Selector('[data-testid^=query-table-result-]');
    queryJsonResult = Selector('[data-testid=json-view]');
    mainEditorArea = Selector('[data-testid=main-input-container-area]');
    queryTextResult = Selector(this.cssQueryTextResult);
    queryColumns = Selector('[data-testid*=query-column-]');
    queryInputScriptArea = Selector('[data-testid=query-input-container] .view-line');
    noCommandHistorySection = Selector('[data-testid=wb_no-results]');
    preselectArea = Selector('[data-testid=enablementArea]');
    expandArea = Selector('[data-testid=enablement-area-container]');
    noCommandHistoryTitle = Selector('[data-testid=wb_no-results__title]');
    noCommandHistoryText = Selector('[data-testid=wb_no-results__summary]');
    scrolledEnablementArea = Selector('[data-testid=enablement-area__page]');
    enablementAreaPaginationPopover = Selector('[data-testid=enablement-area__pagination-popover]');
    enablementAreaTreeView = Selector('[data-testid=enablementArea-treeView]');
    commandExecutionResult = Selector('[data-testid=query-common-result]');
    commandExecutionResultFailed = Selector('[data-testid=cli-output-response-fail]');
    chartViewTypeOptionSelected = Selector('[data-testid=view-type-selected-Plugin-redistimeseries__redistimeseries-chart]');
    runButtonToolTip = Selector('[data-testid=run-query-tooltip]');
    loadedCommand = Selector('[class=euiLoadingContent__singleLine]');
    runButtonSpinner = Selector('[data-testid=loading-spinner]');
    enablementAreaEmptyContent = Selector('[data-testid=enablement-area__empty-prompt]');
    commandExecutionDateAndTime = Selector('[data-testid=command-execution-date-time]');
    executionCommandTime = Selector('[data-testid=command-execution-time-value]');
    executionCommandIcon = Selector('[data-testid=command-execution-time-icon]');
    //MONACO ELEMENTS
    monacoCommandDetails = Selector('div.suggest-details-container');
    monacoSuggestion = Selector('span.monaco-icon-name-container');
    monacoContextMenu = Selector('div.shadow-root-host').shadowRoot();
    monacoShortcutInput = Selector('input.input');
    monacoSuggestionOption = Selector('div.monaco-list-row');
    monacoHintWithArguments = Selector('[widgetid="editor.widget.parameterHintsWidget"]');
    monacoCommandIndicator = Selector('div.monaco-glyph-run-command');
    monacoWidget = Selector('[data-testid=monaco-widget]');
    nonRedisEditorResizeBottom = Selector('.t_resize-bottom');
    nonRedisEditorResizeTop = Selector('.t_resize-top');
    //OPTIONS
    selectViewType = Selector('[data-testid=select-view-type]');
    textViewTypeOption = Selector('[data-test-subj^=view-type-option-Text]');
    jsonStringViewTypeOption = Selector('[data-test-subj=view-type-option-Plugin-client-list__json-string-view]');
    tableViewTypeOption = Selector('[data-test-subj^=view-type-option-Plugin]');
    graphViewTypeOption = Selector('[data-test-subj^=view-type-option-Plugin-graph]');
    typeSelectedClientsList = Selector('[data-testid=view-type-selected-Plugin-client-list__clients-list]');
    viewTypeOptionClientList = Selector('[data-test-subj=view-type-option-Plugin-client-list__clients-list]');
    viewTypeOptionsText = Selector('[data-test-subj=view-type-option-Text-default__Text]');
    /**
     * Get card container by command
     * @param command The command
     */
    async getCardContainerByCommand(command: string): Promise<Selector> {
        return this.queryCardCommand.withExactText(command).parent('[data-testid^="query-card-container-"]');
    }

    // Select Text view option in Workbench results
    async selectViewTypeText(): Promise<void> {
        await t
            .click(this.selectViewType)
            .click(this.textViewTypeOption);
    }

    // Select Json view option in Workbench results
    async selectViewTypeJson(): Promise<void> {
        await t
            .click(this.selectViewType)
            .click(this.jsonStringViewTypeOption);
    }

    // Select Table view option in Workbench results
    async selectViewTypeTable(): Promise<void> {
        await t
            .click(this.selectViewType)
            .doubleClick(this.tableViewTypeOption);
    }

    // Select view option in Workbench results
    async selectViewTypeGraph(): Promise<void> {
        await t
            .click(this.selectViewType)
            .click(this.graphViewTypeOption);
    }

    /**
     * Send a command in Workbench
     * @param command The command
     * @param speed The speed in seconds. Default is 1
     * @param paste
     */
    async sendCommandInWorkbench(command: string, speed = 1, paste = true): Promise<void> {
        await t
            .click(this.queryInput)
            .typeText(this.queryInput, command, { replace: true, speed, paste })
            .click(this.submitCommandButton);
    }

    /**
     * Send multiple commands in Workbench
     * @param commands The commands
     */
    async sendMultipleCommandsInWorkbench(commands: string[]): Promise<void> {
        for (const command of commands) {
            await t
                .typeText(this.queryInput, command, { replace: false, speed: 1, paste: true })
                .pressKey('enter');
        }
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
     * Check the last command and result in workbench
     * @param command The command to check
     * @param result The result to check
     * @param childNum Indicator which command result need to check
     */
    async checkWorkbenchCommandResult(command: string, result: string, childNum = 0): Promise<void> {
        // Compare the command with executed command
        const actualCommand = await this.queryCardContainer.nth(childNum).find(this.cssQueryCardCommand).textContent;
        await t.expect(actualCommand).contains(command, 'Actual command is not equal to executed');
        // Compare the command result with executed command
        const actualCommandResult = await this.queryCardContainer.nth(childNum).find(this.cssQueryTextResult).textContent;
        await t.expect(actualCommandResult).contains(result, 'Actual command result is not equal to executed');
    }

    /**
     * Get selector with tutorial name
     * @param tutorialName name of the uploaded tutorial
     */
    getAccordionButtonWithName(tutorialName: string): Selector {
        return Selector(`[data-testid=accordion-button-${tutorialName}]`);
    }

    /**
     * Get internal tutorial link with .md name
     * @param internalLink name of the .md file
     */
    getInternalLinkWithManifest(internalLink: string): Selector {
        return Selector(`[data-testid="internal-link-${internalLink}.md"]`);
    }

    /**
     * Get internal tutorial link without .md name
     * @param internalLink name of the label
     */
    getInternalLinkWithoutManifest(internalLink: string): Selector {
        return Selector(`[data-testid="internal-link-${internalLink}"]`);
    }

    /**
     * Find tutorial selector by name
     * @param name A tutorial name
     */
    getTutorialByName(name: string): Selector {
        return Selector('div').withText(name);
    }

    /**
     * Delete tutorial by name
     * @param name A tutorial name
     */
    async deleteTutorialByName(name: string): Promise<void> {
        const deleteTutorialBtn = this.tutorialAccordionButton.withText(name).find(this.cssTutorialDeleteIcon);
        if (await this.closeEnablementPage.exists) {
            await t.click(this.closeEnablementPage);
        }
        await t.click(deleteTutorialBtn);
        await t.click(this.tutorialDeleteButton);
    }

    /**
     * Find image in tutorial by alt text
     * @param alt Image alt text
     */
    getTutorialImageByAlt(alt: string): Selector {
        return Selector('img').withAttribute('alt', alt);
    }

    /**
     * Wait until image rendered
     * @param selector Image selector
     */
    async waitUntilImageRendered(selector: Selector): Promise<void> {
        const searchTimeout = 5 * 1000; // 5 sec maximum wait
        const startTime = Date.now();
        let imageHeight = await selector.getStyleProperty('height');

        do {
            imageHeight = await selector.getStyleProperty('height');
        }
        while ((imageHeight == '0px') && Date.now() - startTime < searchTimeout);
    }
}
