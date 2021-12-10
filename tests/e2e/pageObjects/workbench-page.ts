import { Selector, t } from 'testcafe';

export class WorkbenchPage {
  //DECLARATION OF CSS selectors
  cssSelectorPaginationButtonPrevious: string
  cssSelectorPaginationButtonNext: string
  cssReRunCommandButton: string
  cssDeleteCommandButton: string
  cssQueryCardOutputResponceSuccess: string
  cssTableViewTypeOption: string
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
  preselectManual: Selector
  scriptsLines: Selector
  queryInputScriptArea: Selector
  overviewTotalKeys: Selector
  overviewTotalMemory: Selector
  resizeButtonForPreselectsArea: Selector
  preselectButtons: Selector
  preselectsAreaContainer: Selector
  reRunCommandButton: Selector
  queryCardNoModuleOutput: Selector
  queryCardNoModuleButton: Selector
  monacoCommandDetails: Selector
  monacoCloseCommandDetails: Selector
  monacoSuggestion: Selector
  iframe: Selector
  internalLinkWorkingWithHashes: Selector
  preselectExactSearch: Selector
  preselectGroupBy: Selector

  constructor() {
      //CSS selectors
      this.cssSelectorPaginationButtonPrevious = '[data-test-subj=pagination-button-previous]';
      this.cssSelectorPaginationButtonNext = '[data-test-subj=pagination-button-next]';
      this.cssReRunCommandButton = '[data-testid=re-run-command]';
      this.cssDeleteCommandButton = '[data-testid=delete-command]';
      this.cssQueryCardOutputResponceSuccess = '[data-testid=query-card-output-response-success]';
      this.cssTableViewTypeOption = '[data-testid=view-type-selected-Plugin-redisearch__redisearch]';
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      //BUTTONS
      this.submitCommandButton = Selector('[data-testid=btn-submit]');
      this.resizeButtonForScriptingAndResults = Selector('[data-test-subj=resize-btn-scripting-area-and-results]');
      this.resizeButtonForPreselectsArea = Selector('[data-test-subj=resize-btn-preselects-area]');
      this.paginationButtonPrevious = Selector(this.cssSelectorPaginationButtonPrevious);
      this.paginationButtonNext = Selector(this.cssSelectorPaginationButtonNext);
      this.selectViewType = Selector('[data-testid=select-view-type]');
      this.textViewTypeOption = Selector('[data-test-subj^=view-type-option-Text]');
      this.preselectList = Selector('[data-testid*=preselect-List]');
      this.preselectIndexInfo = Selector('[data-testid*=preselect-Index]');
      this.preselectSearch = Selector('[data-testid=preselect-Search]');
      this.preselectExactSearch = Selector('[data-testid="preselect-Exact text search"]');
      this.preselectGroupBy = Selector('[data-testid*=preselect-Group]');
      this.preselectButtons = Selector('[data-testid^=preselect-]');
      this.reRunCommandButton = Selector('[data-testid=re-run-command]');
      this.preselectManual = Selector('[data-testid=preselect-Manual]');
      this.internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-working-with-hashes]');
      // TEXT INPUTS (also referred to as 'Text fields')
      this.queryInput = Selector('[data-testid=query-input-container]');
      this.scriptsLines = Selector('[data-testid=query-input-container] .view-lines');
      this.queryCardContainer = Selector('[data-testid^=query-card-container]');
      this.queryCardCommand = Selector('[data-testid=query-card-command]');
      this.queryTableResult = Selector('[data-testid^=query-table-result-]');
      this.queryTextResult = Selector('[data-testid=query-cli-result]');
      this.queryColumns = Selector('[data-testid*=query-column-]');
      this.queryInputScriptArea = Selector('[data-testid=query-input-container] .view-line');
      this.overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
      this.overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
      this.preselectsAreaContainer = Selector('[data-test-subj=resize-container-preselects-area]');
      this.queryCardNoModuleOutput = Selector('[data-testid=query-card-no-module-output]');
      this.queryCardNoModuleButton = Selector('[data-testid=query-card-no-module-button] a');
      this.monacoCommandDetails = Selector('div.suggest-details-container');
      this.monacoCloseCommandDetails = Selector('span.codicon-close');
      this.monacoSuggestion = Selector('span.monaco-icon-name-container');
      this.iframe = Selector('[data-testid=pluginIframe]');
  }

  /**
  * Get card container by command
  * @param command The command
  */
  async getCardContainerByCommand(command: string): Promise<Selector> {
      return this.queryCardCommand.withExactText(command).parent('[data-testid^="query-card-container-"]');
  }

  //Select Text view option in Workbench results
  async selectViewTypeText(): Promise<void>{
      await t.click(this.selectViewType);
      await t.click(this.textViewTypeOption);
  }

  /**
  * Send a command in Workbench
  * @param command The command
  * @param speed The speed in seconds. Default is 1
  */
  async sendCommandInWorkbench(command: string, speed = 1): Promise<void>{
      await t.typeText(this.queryInput, command, { replace: true, speed: speed});
      await t.click(this.submitCommandButton);
  }
}
