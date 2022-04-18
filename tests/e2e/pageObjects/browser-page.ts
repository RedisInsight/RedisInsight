import {t, Selector} from 'testcafe';
import {Common} from '../helpers/common';

const common = new Common();

export class BrowserPage {
    //DECLARATION OF CSS selectors
    cssSelectorGrid: string
    cssSelectorRows: string
    cssSelectorKey: string
    cssFilteringLabel: string
    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

    plusAddKeyButton: Selector
    addKeyButton: Selector
    keyTypeDropDown: Selector
    progressLine: Selector
    keyDetailsHeader: Selector
    keyListTable: Selector
    keyDetailsBadge: Selector
    deleteKeyButton: Selector
    confirmDeleteKeyButton: Selector
    keyNameFormDetails: Selector
    keyDetailsTTL: Selector
    editKeyTTLButton: Selector
    editKeyTTLInput: Selector
    ttlText: Selector
    closeEditTTL: Selector
    saveTTLValue: Selector
    refreshKeysButton: Selector
    refreshKeyButton: Selector
    applyButton: Selector
    applyEditButton: Selector
    filterByKeyTypeDropDown: Selector
    filterOptionType: Selector
    scanMoreButton: Selector
    resizeBtnKeyList: Selector
    editKeyNameButton: Selector
    stringKeyValue: Selector
    addKeyNameInput: Selector
    keyNameInput: Selector
    keyTTLInput: Selector
    ttlValueInKeysTable: Selector
    listKeyElementInput: Selector
    jsonKeyValueInput: Selector
    setMemberInput: Selector
    zsetMemberScoreInput: Selector
    stringKeyValueInput: Selector
    hashFieldNameInput: Selector
    hashFieldValueInput: Selector
    filterByPatterSearchInput: Selector
    notificationMessage: Selector
    stringOption: Selector
    jsonOption: Selector
    setOption: Selector
    zsetOption: Selector
    listOption: Selector
    hashOption: Selector
    closeKeyButton: Selector
    addKeyValueItemsButton: Selector
    hashFieldInput: Selector
    hashValueInput: Selector
    saveHashFieldButton: Selector
    saveMemberButton: Selector
    hashFieldsList: Selector
    hashValuesList: Selector
    setMembersList: Selector
    zsetMembersList: Selector
    zsetScoresList: Selector
    searchInput: Selector
    searchButtonInKeyDetails: Selector
    confirmRemoveSetMemberButton: Selector
    confirmRemoveHashFieldButton: Selector
    confirmRemovZSetMemberButton: Selector
    databaseNames: Selector
    addListKeyElementInput: Selector
    saveElementButton: Selector
    listElementsList: Selector
    removeElementFromListButton: Selector
    removeElementFromListIconButton: Selector
    confirmRemoveListElementButton: Selector
    removeElementFromListSelect: Selector
    removeFromHeadSelection: Selector
    addJsonObjectButton: Selector
    jsonKeyValue: Selector
    jsonScalarValue: Selector
    jsonValueInput: Selector
    jsonKeyInput: Selector
    jsonError: Selector
    editJsonObjectButton: Selector
    expandJsonObject: Selector
    addJsonFieldButton: Selector
    toastCloseButton: Selector
    keySizeDetails: Selector
    keyLengthDetails: Selector
    scoreButton: Selector
    noResultsFound: Selector
    searchAdvices: Selector
    countInput: Selector
    tooltip: Selector
    keyNameInTheList: Selector
    keysNumberOfResults: Selector
    keysNumberOfScanned: Selector
    keysTotalNumber: Selector
    overviewTotalKeys: Selector
    overviewTotalMemory: Selector
    overviewConnectedClients: Selector
    selectedFilterTypeString: Selector
    overviewCommandsSec: Selector
    overviewCpu: Selector
    modulesButton: Selector
    overviewMoreInfo: Selector
    overviewTooltip: Selector
    overviewTooltipStatTitle: Selector
    treeViewButton: Selector
    treeViewArea: Selector
    browserViewButton: Selector
    scannedValue: Selector
    treeViewSeparator: Selector
    treeViewKeysNumber: Selector
    treeViewPercentage: Selector
    treeViewFolders: Selector
    totalKeysNumber: Selector
    breadcrumbsContainer: Selector
    databaseInfoIcon: Selector
    databaseInfoToolTip: Selector
    removeHashFieldButton: Selector
    removeSetMemberButton: Selector
    removeZserMemberButton: Selector
    treeViewKeysItem: Selector
    treeViewNodeArrowIcon: Selector
    treeViewDeviceFolder: Selector
    treeViewDeviceKyesCount: Selector
    treeViewDelimiterButton: Selector
    treeViewDelimiterInput: Selector
    treeViewDelimiterValueSave: Selector
    treeViewDelimiterValueCancel: Selector
    treeViewNotPatternedKeys: Selector
    modulesTypeDetails: Selector
    internalLinkToWorkbench: Selector
    deleteFilterButton: Selector
    filteringLabel: Selector
    keysSummary: Selector
    multiSearchArea: Selector
    searchButton: Selector
    clearFilterButton: Selector
    clearSelectionButton: Selector
    filterOptionTypeSelected: Selector

    constructor() {
        //CSS Selectors
        this.cssSelectorGrid = '[aria-label="grid"]';
        this.cssSelectorRows = '[aria-label="row"]';
        this.cssSelectorKey = '[data-testid^=key-]';
        this.cssFilteringLabel = '[data-testid=multi-search]';
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        //BUTTONS
        this.keyDetailsHeader = Selector('[data-testid=key-details-header]');
        this.keyListTable = Selector('[data-testid=keyList-table]');
        this.deleteKeyButton = Selector('[data-testid=delete-key-btn]');
        this.confirmDeleteKeyButton = Selector('[data-testid=delete-key-confirm-btn]');
        this.keyNameFormDetails = Selector('[data-testid=key-name-text]');
        this.keyDetailsTTL = Selector('[data-testid=key-ttl-text]');
        this.editKeyTTLButton = Selector('[data-testid=edit-ttl-btn]');
        this.closeEditTTL = Selector('[data-testid=cancel-btn]');
        this.saveTTLValue = Selector('[data-testid=apply-btn]');
        this.ttlValueInKeysTable = Selector('[data-testid^=ttl-]');
        this.refreshKeysButton = Selector('[data-testid=refresh-keys-btn]');
        this.refreshKeyButton = Selector('[data-testid=refresh-key-btn]')
        this.applyButton = Selector('[data-testid=apply-btn]');
        this.editKeyNameButton = Selector('[data-testid=edit-key-btn]');
        this.closeKeyButton = Selector('[data-testid=close-key-btn]');
        this.stringKeyValue = Selector('.key-details-body pre');
        this.keyDetailsBadge = Selector('.key-details-header .euiBadge__text');
        this.plusAddKeyButton = Selector('[data-testid=btn-add-key]');
        this.addKeyValueItemsButton = Selector('[data-testid=add-key-value-items-btn]');
        this.saveHashFieldButton = Selector('[data-testid=save-fields-btn]');
        this.saveMemberButton = Selector('[data-testid=save-members-btn]');
        this.searchButtonInKeyDetails = Selector('[data-testid=search-button]');
        this.addKeyButton = Selector('span').withExactText('Add Key');
        this.keyTypeDropDown = Selector('fieldset button.euiSuperSelectControl');
        this.progressLine = Selector('div.euiProgress');
        this.confirmRemoveHashFieldButton = Selector('[data-testid^=remove-hash-button-] span');
        this.removeSetMemberButton = Selector('[data-testid^=set-remove-btn]');
        this.removeHashFieldButton = Selector('[data-testid^=remove-hash-button]');
        this.removeZserMemberButton = Selector('[data-testid^=zset-remove-button]');
        this.confirmRemoveSetMemberButton = Selector('[data-testid^=set-remove-btn-] span');
        this.confirmRemovZSetMemberButton = Selector('[data-testid^=zset-remove-button-] span');
        this.saveElementButton = Selector('[data-testid=save-elements-btn]');
        this.removeElementFromListIconButton = Selector('[data-testid=remove-key-value-items-btn]');
        this.removeElementFromListButton = Selector('[data-testid=remove-elements-btn]');
        this.confirmRemoveListElementButton = Selector('[data-testid=remove-submit]');
        this.removeElementFromListSelect = Selector('[data-testid=destination-select]');
        this.addJsonObjectButton = Selector('[data-testid=add-object-btn]');
        this.addJsonFieldButton = Selector('[data-testid=add-field-btn]');
        this.expandJsonObject = Selector('[data-testid=expand-object]');
        this.toastCloseButton = Selector('[data-test-subj=toastCloseButton]');
        this.scoreButton = Selector('[data-testid=score-button]');
        this.editJsonObjectButton = Selector('[data-testid=edit-object-btn]');
        this.applyEditButton = Selector('[data-testid=apply-edit-btn]');
        this.filterByKeyTypeDropDown = Selector('[data-testid=filter-option-type-default]');
        this.filterOptionType = Selector('[data-test-subj^=filter-option-type-]');
        this.scanMoreButton = Selector('[data-testid=scan-more]');
        this.resizeBtnKeyList = Selector('[data-test-subj=resize-btn-keyList-keyDetails]');
        this.modulesButton = Selector('[data-testid$=_module]');
        this.overviewMoreInfo = Selector('[data-testid=overview-more-info-button]');
        this.overviewTooltip = Selector('[data-testid=overview-more-info-tooltip]');
        this.overviewTooltipStatTitle = Selector('[data-testid=overview-db-stat-title]');
        this.databaseInfoIcon = Selector('[data-testid=db-info-icon]');
        this.treeViewButton = Selector('[data-testid=view-type-list-btn]');
        this.browserViewButton = Selector('[data-testid=view-type-browser-btn]');
        this.treeViewSeparator = Selector('[data-testid=tree-view-delimiter-btn]');
        this.treeViewKeysItem = Selector('[data-testid*="keys:keys:"]');
        this.treeViewNotPatternedKeys = Selector('[data-testid*="node-item_keys"]');
        this.treeViewNodeArrowIcon = Selector('[data-test-subj^=node-arrow-icon_]');
        this.deleteFilterButton = Selector('[data-testid*=delete-btn]');
        this.searchButton = Selector('[data-testid=search-btn]');
        this.clearFilterButton = Selector('[data-testid=reset-filter-btn]');
        this.clearSelectionButton = Selector('[data-testid=clear-selection-btn]');
        //TEXT INPUTS (also referred to as 'Text fields')
        this.keySizeDetails = Selector('[data-testid=key-size-text]');
        this.keyLengthDetails = Selector('[data-testid=key-length-text]');
        this.addKeyNameInput = Selector('[data-testid=key]');
        this.keyNameInput = Selector('[data-testid=edit-key-input]');
        this.keyTTLInput = Selector('[data-testid=ttl]');
        this.editKeyTTLInput = Selector('[data-testid=edit-ttl-input]');
        this.ttlText = Selector('[data-testid=key-ttl-text] span')
        this.hashFieldValueInput = Selector('[data-testid=field-value]');
        this.hashFieldNameInput = Selector('[data-testid=field-name]');
        this.listKeyElementInput = Selector('[data-testid=element]');
        this.stringKeyValueInput = Selector('[data-testid=string-value]');
        this.jsonKeyValueInput = Selector('[data-testid=json-value]');
        this.setMemberInput = Selector('[data-testid=member-name]');
        this.zsetMemberScoreInput = Selector('[data-testid=member-score]');
        this.filterByPatterSearchInput = Selector('[data-testid=search-key]');
        this.notificationMessage = Selector('[data-test-subj=euiToastHeader]');
        this.stringOption = Selector('#string');
        this.jsonOption = Selector('#ReJSON-RL');
        this.setOption = Selector('#set');
        this.zsetOption = Selector('#zset');
        this.listOption = Selector('#list');
        this.hashOption = Selector('#hash');
        this.removeFromHeadSelection = Selector('#HEAD');
        this.keyNameInTheList = Selector(this.cssSelectorKey);
        this.databaseNames = Selector('[data-testid^=db_name_]');
        this.hashFieldInput = Selector('[data-testid=hash-field]');
        this.hashValueInput = Selector('[data-testid=hash-value]');
        this.hashFieldsList = Selector('[data-testid^=hash-field-] span');
        this.hashValuesList = Selector('[data-testid^=hash-field-value-] span');
        this.setMembersList = Selector('[data-testid^=set-member-value-]');
        this.zsetMembersList = Selector('[data-testid^=zset-member-value-]');
        this.zsetScoresList = Selector('[data-testid^=zset-score-value-]');
        this.listElementsList = Selector('[data-testid^=list-element-value-]');
        this.searchInput = Selector('[data-testid=search]');
        this.addListKeyElementInput = Selector('[data-testid=elements-input]');
        this.jsonKeyValue = Selector('[data-testid=json-data]');
        this.jsonScalarValue = Selector('[data-testid=json-scalar-value]');
        this.jsonKeyInput = Selector('[data-testid=json-key]');
        this.jsonValueInput = Selector('[data-testid=json-value]');
        this.jsonError = Selector('[data-testid=edit-json-error]');
        this.tooltip = Selector('[role=tooltip]');
        this.noResultsFound = Selector('[data-test-subj=no-result-found]');
        this.searchAdvices = Selector('[data-test-subj=search-advices]');
        this.countInput = Selector('[data-testid=count-input]');
        this.keysNumberOfResults = Selector('[data-testid=keys-number-of-results]');
        this.keysNumberOfScanned = Selector('[data-testid=keys-number-of-scanned]');
        this.keysTotalNumber = Selector('[data-testid=keys-total]');
        this.overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
        this.overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
        this.overviewConnectedClients = Selector('[data-test-subj=overview-connected-clients]');
        this.overviewCommandsSec = Selector('[data-test-subj=overview-commands-sec]');
        this.overviewCpu = Selector('[data-test-subj=overview-cpu]');
        this.selectedFilterTypeString = Selector('[data-testid=filter-option-type-selected-string]');
        this.breadcrumbsContainer = Selector('[data-testid=breadcrumbs-container]');
        this.treeViewArea = Selector('[data-test-subj=tree-view-panel]');
        this.scannedValue = Selector('[data-testid=keys-number-of-scanned]');
        this.treeViewKeysNumber = Selector('[data-testid^=count_]');
        this.treeViewPercentage = Selector('[data-testid^=percentage_]');
        this.treeViewFolders = Selector('[data-test-subj^=node-arrow-icon_]');
        this.totalKeysNumber = Selector('[data-testid=keys-total]');
        this.databaseInfoToolTip = Selector('[data-testid=db-info-tooltip]');
        this.treeViewDeviceFolder = Selector('[data-testid^=node-item_device] div');
        this.treeViewDeviceKyesCount = Selector('[data-testid^=count_device] span');
        this.treeViewDelimiterButton = Selector('[data-testid=tree-view-delimiter-btn]');
        this.treeViewDelimiterInput = Selector('[data-testid=tree-view-delimiter-input]');
        this.treeViewDelimiterValueSave = Selector('[data-testid=apply-btn]');
        this.treeViewDelimiterValueCancel = Selector('[data-testid=cancel-btn]');
        this.modulesTypeDetails = Selector('[data-testid=modules-type-details]');
        this.internalLinkToWorkbench = Selector('[data-testid=internal-workbench-link]');
        this.filteringLabel = Selector('[data-testid^=badge-]');
        this.keysSummary = Selector('[data-testid=keys-summary]');
        this.multiSearchArea = Selector(this.cssFilteringLabel);
        this.filterOptionTypeSelected = Selector('[data-testid^=filter-option-type-selected]');
    }

    /**
     * Adding a new String key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param value The key value
     */
    async addStringKey(keyName: string, value = ' ', TTL?: string): Promise<void> {
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.stringOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName);
        if (TTL) {
            await t.click(this.keyTTLInput);
            await t.typeText(this.keyTTLInput, TTL);
        }
        await t.click(this.stringKeyValueInput);
        await t.typeText(this.stringKeyValueInput, value);
        await t.click(this.addKeyButton);
    }

    /**
     *Adding a new Json key
     * @param keyName The name of the key
     * @param value The key value
     * @param TTL The Time to live value of the key (optional parameter)
     */
    async addJsonKey(keyName: string, value = ' ', TTL?: string): Promise<void> {
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.jsonOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName);
        await t.click(this.jsonKeyValueInput);
        await t.typeText(this.jsonKeyValueInput, value);
        if (TTL) {
            await t.click(this.keyTTLInput);
            await t.typeText(this.keyTTLInput, TTL);
        }
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new Set key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param members The key members
     */
    async addSetKey(keyName: string, TTL = ' ', members = ' '): Promise<void> {
        await common.waitForElementNotVisible(this.progressLine);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.setOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName);
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL);
        await t.typeText(this.setMemberInput, members);
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new ZSet key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param members The key members
     * @param scores The score of the key member
     */
    async addZSetKey(keyName: string, scores = ' ', TTL = ' ', members = ' '): Promise<void> {
        await common.waitForElementNotVisible(this.progressLine);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.zsetOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName);
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL);
        await t.typeText(this.setMemberInput, members);
        await t.typeText(this.zsetMemberScoreInput, scores);
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new List key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param element The key element
     */
    async addListKey(keyName: string, TTL = ' ', element = ' '): Promise<void> {
        await common.waitForElementNotVisible(this.progressLine);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.listOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName);
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL);
        await t.click(this.listKeyElementInput);
        await t.typeText(this.listKeyElementInput, element);
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new Hash key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param field The field name of the key
     * @param value The value of the key
     */
    async addHashKey(keyName: string, TTL = ' ', field = ' ', value = ' '): Promise<void> {
        await common.waitForElementNotVisible(this.progressLine);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.hashOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName);
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL);
        await t.typeText(this.hashFieldNameInput, field);
        await t.typeText(this.hashFieldValueInput, value);
        await t.click(this.addKeyButton);
    }

    /**
     * Select keys filter group type
     * @param groupName The group name
     */
    async selectFilterGroupType(groupName: string): Promise<void> {
        if (await this.deleteFilterButton.visible) {
            await t.click(this.deleteFilterButton);
        }
        await t.click(this.filterByKeyTypeDropDown);
        await t.click(this.filterOptionType.withExactText(groupName));
    }

    /**
     * Searching by Key name in the list
     * @param keyName The name of the key
     */
    async searchByKeyName(keyName: string): Promise<void> {
        await t.click(this.filterByPatterSearchInput);
        await t.pressKey('ctrl+a delete');
        await t.typeText(this.filterByPatterSearchInput, keyName);
        await t.pressKey('enter')
    }

    /**
     * Verifying if the Key is in the List of keys
     * @param keyName The name of the key
     */
    async isKeyIsDisplayedInTheList(keyName: string): Promise<boolean> {
        const keyNameInTheList = Selector(`[data-testid="key-${keyName}"]`);
        return keyNameInTheList.exists;
    }

    //Getting the text of the Notification message
    async getMessageText(): Promise<string> {
        return this.notificationMessage.textContent;
    }

    //Delete key from details
    async deleteKey(): Promise<void> {
        if (await this.toastCloseButton.exists) {
            await t.click(this.toastCloseButton);
        }
        await t.click(this.keyNameInTheList);
        await t.click(this.deleteKeyButton);
        await t.click(this.confirmDeleteKeyButton);
    }

    /**
     * Delete key by Name from details
     * @param keyName The name of the key
     */
    async deleteKeyByName(keyName: string): Promise<void> {
        if (await this.toastCloseButton.visible) {
            await t.click(this.toastCloseButton);
        }
        await this.searchByKeyName(keyName);
        await t.click(this.keyNameInTheList);
        await t.click(this.deleteKeyButton);
        await t.click(this.confirmDeleteKeyButton);
    }

    /**
     * Edit key name from details
     * @param keyName The name of the key
     */
    async editKeyName(keyName: string): Promise<void> {
        await t
            .click(this.editKeyNameButton)
            .pressKey('ctrl+a delete')
            .typeText(this.keyNameInput, keyName)
            .click(this.applyButton);
    }

    /**
     * Edit String key value from details
     * @param value The value of the key
     */
    async editStringKeyValue(value: string): Promise<void> {
        await t
            .click(this.stringKeyValue)
            .pressKey('ctrl+a delete')
            .typeText(this.stringKeyValueInput, value)
            .click(this.applyButton);
    }

    //Get string key value from details
    async getStringKeyValue(): Promise<string> {
        return this.stringKeyValue.textContent;
    }

    /**
     * Add field to hash key
     * @param keyFieldValue The value of the hash field
     * @param keyValue The hash value
     */
    async addFieldToHash(keyFieldValue: string, keyValue: string): Promise<void> {
        if (await this.toastCloseButton.exists) {
            await t.click(this.toastCloseButton);
        }
        await t.click(this.addKeyValueItemsButton);
        await t.typeText(this.hashFieldInput, keyFieldValue);
        await t.typeText(this.hashValueInput, keyValue);
        await t.click(this.saveHashFieldButton);
    }

    /**
     * Search by the value in the key details
     * @param value The value of the search parameter
     */
    async searchByTheValueInKeyDetails(value: string): Promise<void> {
        await t.click(this.searchButtonInKeyDetails);
        await t.pressKey('ctrl+a delete');
        await t.typeText(this.searchInput, value);
        await t.pressKey('enter');
    }

    /**
     * Search by the value in the set key details
     * @param value The value of the search parameter
     */
    async searchByTheValueInSetKey(value: string): Promise<void> {
        await t.click(this.searchInput);
        await t.pressKey('ctrl+a delete');
        await t.typeText(this.searchInput, value);
        await t.pressKey('enter');
    }

    /**
     * Add member to the Set key
     * @param keyMember The value of the set member
     */
    async addMemberToSet(keyMember: string): Promise<void> {
        if (await this.toastCloseButton.exists) {
            await t.click(this.toastCloseButton);
        }
        await t.click(this.addKeyValueItemsButton);
        await t.typeText(this.setMemberInput, keyMember);
        await t.click(this.saveMemberButton);
    }

    /**
     * Add member to the ZSet key
     * @param keyMember The value of the Zset member
     * @param score The value of the score
     */
    async addMemberToZSet(keyMember: string, score: string): Promise<void> {
        if (await this.toastCloseButton.exists) {
            await t.click(this.toastCloseButton);
        }
        await t.click(this.addKeyValueItemsButton);
        await t.typeText(this.setMemberInput, keyMember);
        await t.typeText(this.zsetMemberScoreInput, score);
        await t.click(this.saveMemberButton);
    }

    //Get databases name
    async getDatabasesName(): Promise<string> {
        return this.databaseNames.textContent;
    }

    //Open key details
    async openKeyDetails(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName);
        await t.click(this.keyNameInTheList);
    }

    /**
     * Add element to the List key
     * @param element The value of the list element
     */
    async addElementToList(element: string): Promise<void> {
        if (await this.toastCloseButton.exists) {
            await t.click(this.toastCloseButton);
        }
        await t.click(this.addKeyValueItemsButton);
        await t.typeText(this.addListKeyElementInput, element);
        await t.click(this.saveElementButton);
    }

    //Remove List element from tail for Redis databases less then v. 6.2.
    async removeListElementFromTailOld(): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    //Remove List element from head for Redis databases less then v. 6.2.
    async removeListElementFromHeadOld(): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        //Select Remove from head selection
        await t.click(this.removeElementFromListSelect);
        await t.click(this.removeFromHeadSelection);
        //Confirm removing
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    /**
     * Remove List element from tail
     * @param count The count if elements for removing
     */
    async removeListElementFromTail(count: string): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        await t.typeText(this.countInput, count);
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    /**
     * Remove List element from head
     * @param count The count if elements for removing
     */
    async removeListElementFromHead(count: string): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        //Enter count of the removing elements
        await t.typeText(this.countInput, count);
        //Select Remove from head selection
        await t.click(this.removeElementFromListSelect);
        await t.click(this.removeFromHeadSelection);
        //Confirm removing
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    /**
     * Add json key with value on the same level of the structure
     * @param jsonKey The json key name
     * @param jsonKeyValue The value of the json key
     */
    async addJsonKeyOnTheSameLevel(jsonKey: string, jsonKeyValue: any): Promise<void> {
        await t.click(this.addJsonObjectButton);
        await t.typeText(this.jsonKeyInput, jsonKey);
        await t.typeText(this.jsonValueInput, jsonKeyValue);
        await t.click(this.applyButton);
    }

    /**
     * Add json key with value inside the Json structure
     * @param jsonKey The json key name
     * @param jsonKeyValue The value of the json key
     */
    async addJsonKeyInsideStructure(jsonKey: string, jsonKeyValue: any): Promise<void> {
        await t.click(this.expandJsonObject);
        await t.click(this.addJsonFieldButton);
        await t.typeText(this.jsonKeyInput, jsonKey);
        await t.typeText(this.jsonValueInput, jsonKeyValue);
        await t.click(this.applyButton);
    }

    /**
     * Add json structure
     * @param jsonStructure The structure of the json key
     */
    async addJsonStructure(jsonStructure: string): Promise<void> {
        await t.click(this.expandJsonObject);
        await t.click(this.editJsonObjectButton);
        await t.pressKey('ctrl+a delete');
        await t.typeText(this.jsonValueInput, jsonStructure);
        await t.click(this.applyEditButton);
    }

    /**
     * Get Values list of the key
     * @param element Selector of the element with list
     */
    async getValuesListByElement(element): Promise<string[]> {
        const keyValues = [];
        const count = await element.count;
        for (let i = 0; i < count; i++) {
            keyValues[i] = await element.nth(i).textContent;
            i++;
        }
        return keyValues;
    }

    /**
     * Check tree view structure
     * @folders name of folders for tree view build
     * @delimiter string with delimiter value
     * @commonKeyFolder flag if not patterned keys will be displayed
     */
    async checkTreeViewFoldersStructure(folders: string[][], delimiter: string, commonKeyFolder: boolean): Promise<void> {
        // Verify that all keys that are not inside of tree view doesn't contain delimiter
        if (commonKeyFolder) {
            await t.expect(this.treeViewNotPatternedKeys.exists).ok('Folder with not patterned keys');
            await t.click(this.treeViewNotPatternedKeys);
            const notPatternedKeys = await Selector('[data-test-subj=key-list-panel]').find(this.cssSelectorKey);
            const notPatternedKeysNumber = await notPatternedKeys.count;
            for (let i = 0; i < notPatternedKeysNumber; i++) {
                await t.expect(notPatternedKeys.nth(i).withText(delimiter).exists).notOk('Not contained delimiter keys');
            }
        }
        // Verify that every level of tree view is clickable
        const foldersNumber = folders.length;
        for(let i = 0; i < foldersNumber; i++) {
            const innerFoldersNumber = folders[i].length;
            const array: string[] = [];
            for(let j = 0; j < innerFoldersNumber; j++) {
                if (j === 0) {
                    const folderSelector = `[data-testid="node-item_${folders[i][j]}${delimiter}"]`;
                    array.push(folderSelector);
                    await t.click(await Selector(folderSelector));
                }
                else {
                    const lastSelector = array[array.length - 1].substring(0, array[array.length - 1].length - 2);
                    const folderSelector = `${lastSelector}${folders[i][j]}${delimiter}"]`;
                    array.push(folderSelector);
                    await t.click(await Selector(folderSelector));
                }
            }
            // Verify that the last folder level contains required keys
            const lastSelector = array[array.length - 1].substring(0, array[array.length - 1].length - 2);
            const folderSelector = `${lastSelector}keys${delimiter}keys${delimiter}"]`
            await t.click(await Selector(folderSelector));
            const foundKeyName = `${folders[i].join(delimiter)}`;
            await t.expect(Selector(`[data-testid*="key-${foundKeyName}"]`).visible).ok('Specific key');
        }
    }
}

/**
 * Add new keys parameters
 * @param keyName The name of the key
 * @param TTL The ttl of the key
 * @param value The value of the key
 * @param members The members of the key
 * @param scores The scores of the key member
 * @param field The field of the key
 */
export type AddNewKeyParameters = {
    keyName: string,
    value?: string,
    TTL?: string,
    members?: string,
    scores?: string,
    field?: string
}
