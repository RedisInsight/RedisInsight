import { t, Selector } from 'testcafe';

export class AddRedisDatabasePage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

  addDatabaseButton: Selector
  addDatabaseManually: Selector
  addAutoDiscoverDatabase: Selector
  redisClusterType: Selector
  redisCloudProType: Selector
  redisSentinelType: Selector
  databaseName: Selector
  hostInput: Selector
  portInput: Selector
  databaseAliasInput: Selector
  passwordInput: Selector
  usernameInput: Selector
  addRedisDatabaseButton: Selector
  discoverSentinelDatabaseButton: Selector
  accessKeyInput: Selector
  showDatabasesButton: Selector
  selectAllCheckbox: Selector
  welcomePageTitle: Selector
  databaseIndexCheckbox: Selector
  databaseIndexInput: Selector
  errorMessage: Selector
  secretKeyInput: Selector;

  constructor() {
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      //BUTTONS
      this.addDatabaseButton = Selector('[data-testid=add-redis-database]');
      this.addRedisDatabaseButton = Selector('[data-testid=btn-submit]');
      this.addDatabaseManually = Selector('[data-testid=add-manual]');
      this.addAutoDiscoverDatabase = Selector('[data-testid=add-auto]');
      this.redisClusterType = Selector('[data-test-subj=radio-btn-enterprise-cluster]');
      this.redisCloudProType = Selector('[data-test-subj=radio-btn-cloud-pro]');
      this.redisSentinelType = Selector('[data-test-subj=radio-btn-sentinel]');
      this.showDatabasesButton = Selector('[data-testid=btn-show-databases]');
      this.databaseName = Selector('.euiTableCellContent.column_name');
      this.selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
      this.databaseIndexCheckbox = Selector('[data-testid=showDb]~div');
      //TEXT INPUTS (also referred to as 'Text fields')
      this.hostInput = Selector('[data-testid=host]');
      this.portInput = Selector('[data-testid=port]');
      this.databaseAliasInput = Selector('[data-testid=name]');
      this.passwordInput = Selector('[data-testid=password]');
      this.usernameInput = Selector('[data-testid=username]');
      this.discoverSentinelDatabaseButton = Selector('[data-testid=btn-submit]');
      this.accessKeyInput = Selector('[data-testid=access-key]');
      this.secretKeyInput = Selector('[data-testid=secret-key]');
      this.welcomePageTitle = Selector('[data-testid=welcome-page-title]');
      this.databaseIndexInput = Selector('[data-testid=db]');
      this.errorMessage = Selector('[data-test-subj=toast-error]');
  }

  /**
   * Adding a new redis database
   * @param parameters the parameters of the database
   */
  async addRedisDataBase(parameters: AddNewDatabaseParameters): Promise<void> {
      await t
          .click(this.addDatabaseButton)
          .click(this.addDatabaseManually)
      await t
          .typeText(this.hostInput, parameters.host, { replace: true, paste: true })
          .typeText(this.portInput, parameters.port, { replace: true, paste: true })
          .typeText(this.databaseAliasInput, parameters.databaseName, { replace: true, paste: true })
      if (!!parameters.databaseUsername) {
          await t.typeText(this.usernameInput, parameters.databaseUsername, { replace: true, paste: true })
      }
      if (!!parameters.databasePassword) {
          await t.typeText(this.passwordInput, parameters.databasePassword, { replace: true, paste: true })
      }
  }

  /**
   * Adding a new redis database with index
   * @param parameters the parameters of the database
   * @param index the logical index of database
   */
   async addLogicalRedisDatabase(parameters: AddNewDatabaseParameters, index: string): Promise<void> {
    await t
        .click(this.addDatabaseButton)
        .click(this.addDatabaseManually)
    await t
        .typeText(this.hostInput, parameters.host, { replace: true, paste: true })
        .typeText(this.portInput, parameters.port, { replace: true, paste: true })
        .typeText(this.databaseAliasInput, parameters.databaseName, { replace: true, paste: true })
    if (!!parameters.databaseUsername) {
        await t.typeText(this.usernameInput, parameters.databaseUsername, { replace: true, paste: true })
    }
    if (!!parameters.databasePassword) {
        await t.typeText(this.passwordInput, parameters.databasePassword, { replace: true, paste: true })
    }
    //Enter logical index
    await t.click(this.databaseIndexCheckbox);
    await t.typeText(this.databaseIndexInput, index, { paste: true });
    //Click for saving
    await t.click(this.addRedisDatabaseButton);
}

  /**
   * Auto-discover Master Groups from Sentinel
   * @param parameters - Parameters of Sentinel: host, port and Sentinel password
   */
  async discoverSentinelDatabases(parameters: SentinelParameters): Promise<void> {
      await t
          .click(this.addDatabaseButton)
          .click(this.addAutoDiscoverDatabase)
          .click(this.redisSentinelType)
      if (!!parameters.sentinelHost) {
          await t.typeText(this.hostInput, parameters.sentinelHost, { replace: true, paste: true })
      }
      if (!!parameters.sentinelPort) {
          await t.typeText(this.portInput, parameters.sentinelPort, { replace: true, paste: true })
      }
      if (!!parameters.sentinelPassword) {
          await t.typeText(this.passwordInput, parameters.sentinelPassword, { replace: true, paste: true })
      }
  }

  /**
   * Adding a new database from RE Cluster via auto-discover flow
   * @param prameters the parameters of the database
   */
  async addAutodiscoverREClucterDatabase(parameters: AddNewDatabaseParameters): Promise<void> {
      await t
          .click(this.addDatabaseButton)
          .click(this.addAutoDiscoverDatabase)
          .click(this.redisClusterType)
      await t
          .typeText(this.hostInput, parameters.host, { replace: true, paste: true })
          .typeText(this.portInput, parameters.port, { replace: true, paste: true })
          .typeText(this.usernameInput, parameters.databaseUsername, { replace: true, paste: true })
          .typeText(this.passwordInput, parameters.databasePassword, { replace: true, paste: true })
  }

  /**
   * Adding a new database from RE Cloud via auto-discover flow
   * @param parameters the parameters of the database
   */
  async addAutodiscoverRECloudDatabase(cloudAPIAccessKey: string, cloudAPISecretKey: string): Promise<void> {
      await t
          .click(this.addDatabaseButton)
          .click(this.addAutoDiscoverDatabase)
          .click(this.redisCloudProType)
      await t
          .typeText(this.accessKeyInput, cloudAPIAccessKey, { replace: true, paste: true })
          .typeText(this.secretKeyInput, cloudAPISecretKey, { replace: true, paste: true })
  }

  /**
   * Auto-discover Master Groups from Sentinel
   * @param parameters - Parameters of Sentinel: host, port and Sentinel password
   */
  async addOssClusterDatabase(parameters: OSSClusterParameters): Promise<void> {
      await t
          .click(this.addDatabaseButton)
          .click(this.addDatabaseManually)
      if (!!parameters.ossClusterHost) {
          await t.typeText(this.hostInput, parameters.ossClusterHost, { replace: true, paste: true })
      }
      if (!!parameters.ossClusterPort) {
          await t.typeText(this.portInput, parameters.ossClusterPort, { replace: true, paste: true })
      }
      if (!!parameters.ossClusterDatabaseName) {
          await t.typeText(this.databaseAliasInput, parameters.ossClusterDatabaseName, { replace: true, paste: true })
      }
  }
}

/**
 * Add new database parameters
 * @param host The hostname of the database
 * @param port The port of the database
 * @param databaseName The name of the database
 * @param databaseUsername The username of the database
 * @param databasePassword The password of the database
 */
export type AddNewDatabaseParameters = {
  host: string,
  port: string,
  databaseName?: string,
  databaseUsername?: string,
  databasePassword?: string
}

/**
 * Add new database parameters
 * @param sentinelHost The host of sentinel
 * @param sentinelPort The port of sentinel
 * @param sentinelPassword The password of sentinel
 */
export type SentinelParameters = {
  sentinelHost: string,
  sentinelPort: string,
  sentinelPassword?: string
}

/**
 * Add new database parameters
 * @param ossClusterHost The host of OSS Cluster
 * @param ossClusterPort The port of OSS Cluster
 * @param ossClusterDatabaseName Database name for OSS Cluster
 */

export type OSSClusterParameters = {
  ossClusterHost: string,
  ossClusterPort: string,
  ossClusterDatabaseName: string
}
