import { t, Selector } from 'testcafe';

export class AddRedisDatabase {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // BUTTONS
    addDatabaseButton = Selector('[data-testid^=add-redis-database]');
    addRedisDatabaseButton = Selector('[data-testid=btn-submit]');
    addDatabaseManually = Selector('[data-testid=add-manual]');
    addAutoDiscoverDatabase = Selector('[data-testid=add-auto]');
    redisClusterType = Selector('[data-test-subj=radio-btn-enterprise-cluster]');
    redisCloudProType = Selector('[data-test-subj=radio-btn-cloud-pro]');
    redisSentinelType = Selector('[data-test-subj=radio-btn-sentinel]');
    showDatabasesButton = Selector('[data-testid=btn-show-databases]');
    databaseName = Selector('.euiTableCellContent.column_name');
    selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
    databaseIndexCheckbox = Selector('[data-testid=showDb]~div', { timeout: 500 });
    connectToDatabaseButton = Selector('[data-testid=connect-to-db-btn]');
    connectToRedisStackButton = Selector('[aria-label="Connect to database"]');
    cloneDatabaseButton = Selector('[data-testid=clone-db-btn]');
    sentinelNavigation = Selector('[data-testid=sentinel-nav-group]');
    cloneSentinelNavigation = Selector('[data-testid=sentinel-nav-group-clone]');
    sentinelDatabaseNavigation = Selector('[data-testid=database-nav-group]');
    cloneSentinelDatabaseNavigation = Selector('[data-testid=database-nav-group-clone]');
    cancelButton = Selector('[data-testid=btn-cancel]');
    showPasswordBtn = Selector('[aria-label^="Show password"]');
    testConnectionBtn = Selector('[data-testid=btn-test-connection]');
    // TEXT INPUTS (also referred to as 'Text fields')
    disabledDatabaseInfo = Selector('[class=euiListGroupItem__label]');
    hostInput = Selector('[data-testid=host]');
    portInput = Selector('[data-testid=port]');
    databaseAliasInput = Selector('[data-testid=name]');
    passwordInput = Selector('[data-testid=password]');
    usernameInput = Selector('[data-testid=username]');
    accessKeyInput = Selector('[data-testid=access-key]');
    secretKeyInput = Selector('[data-testid=secret-key]');
    databaseIndexInput = Selector('[data-testid=db]');
    databaseIndexMessage = Selector('[data-testid=db-index-message]');
    primaryGroupNameInput = Selector('[data-testid=primary-group]');
    masterGroupPassword = Selector('[data-testid=sentinel-master-password]');
    connectionType = Selector('[data-testid=connection-type]');
    sentinelForm = Selector('[data-testid=form]');
    sshHostInput = Selector('[data-testid=sshHost]');
    sshPortInput = Selector('[data-testid=sshPort]');
    sshUsernameInput = Selector('[data-testid=sshUsername]');
    sshPasswordInput = Selector('[data-testid=sshPassword]');
    sshPrivateKeyInput = Selector('[data-testid=sshPrivateKey]');
    sshPassphraseInput = Selector('[data-testid=sshPassphrase]');
    timeoutInput = Selector('[data-testid=timeout]');
    // DROPDOWNS
    caCertField = Selector('[data-testid=select-ca-cert]', { timeout: 500 });
    clientCertField = Selector('[data-testid=select-cert]', { timeout: 500 });
    selectCompressor = Selector('[data-testid=select-compressor]', { timeout: 1000 });
    useCloudAccount = Selector('[data-testid=use-cloud-account-accordion]');
    useCloudKeys = Selector('[data-testid=use-cloud-keys-accordion]');
    // CHECKBOXES
    useSSHCheckbox = Selector('[data-testid=use-ssh]~div', { timeout: 500 });
    dataCompressorCheckbox = Selector('[data-testid=showCompressor] ~ label');
    // RADIO BUTTONS
    sshPasswordRadioBtn = Selector('#password~div', { timeout: 500 });
    sshPrivateKeyRadioBtn = Selector('#privateKey~div', { timeout: 500 });
    // LABELS
    dataCompressorLabel = Selector('[data-testid=showCompressor] ~ label', { timeout: 1000 });

    /**
     * Adding a new redis database
     * @param parameters the parameters of the database
     */
    async addRedisDataBase(parameters: AddNewDatabaseParameters): Promise<void> {

        await this.addDatabaseButton.with({ visibilityCheck: true, timeout: 10000 })();
        await t
            .click(this.addDatabaseButton)
            .click(this.addDatabaseManually);

        await t
            .typeText(this.hostInput, parameters.host, { replace: true, paste: true })
            .typeText(this.portInput, parameters.port, { replace: true, paste: true })
            .typeText(this.databaseAliasInput, parameters.databaseName!, { replace: true, paste: true });
        if (!!parameters.databaseUsername) {
            await t.typeText(this.usernameInput, parameters.databaseUsername, { replace: true, paste: true });
        }
        if (!!parameters.databasePassword) {
            await t.typeText(this.passwordInput, parameters.databasePassword, { replace: true, paste: true });
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
            .click(this.addDatabaseManually);

        await t
            .typeText(this.hostInput, parameters.host, { replace: true, paste: true })
            .typeText(this.portInput, parameters.port, { replace: true, paste: true })
            .typeText(this.databaseAliasInput, parameters.databaseName!, { replace: true, paste: true });
        if (!!parameters.databaseUsername) {
            await t.typeText(this.usernameInput, parameters.databaseUsername, { replace: true, paste: true });
        }
        if (!!parameters.databasePassword) {
            await t.typeText(this.passwordInput, parameters.databasePassword, { replace: true, paste: true });
        }
        // Enter logical index
        await t.click(this.databaseIndexCheckbox);
        await t.typeText(this.databaseIndexInput, index, { replace: true, paste: true });
        // Click for saving
        await t.click(this.addRedisDatabaseButton);
    }

    /**
     * Adding a new standalone database with SSH
     * @param databaseParameters the parameters of the database
     * @param sshParameters the parameters of ssh
     */
    async addStandaloneSSHDatabase(databaseParameters: AddNewDatabaseParameters, sshParameters: SSHParameters): Promise<void> {

        await t
            .click(this.addDatabaseButton)
            .click(this.addDatabaseManually);

        await t
            .typeText(this.hostInput, databaseParameters.host, { replace: true, paste: true })
            .typeText(this.portInput, databaseParameters.port, { replace: true, paste: true })
            .typeText(this.databaseAliasInput, databaseParameters.databaseName!, { replace: true, paste: true });
        if (!!databaseParameters.databaseUsername) {
            await t.typeText(this.usernameInput, databaseParameters.databaseUsername, { replace: true, paste: true });
        }
        if (!!databaseParameters.databasePassword) {
            await t.typeText(this.passwordInput, databaseParameters.databasePassword, { replace: true, paste: true });
        }
        // Select SSH Tunnel checkbox
        await t.click(this.useSSHCheckbox);
        // Enter SSH fields
        await t
            .typeText(this.sshHostInput, sshParameters.sshHost, { replace: true, paste: true })
            .typeText(this.sshPortInput, sshParameters.sshPort, { replace: true, paste: true })
            .typeText(this.sshUsernameInput, sshParameters.sshUsername, { replace: true, paste: true });
        if (!!sshParameters.sshPassword) {
            await t.typeText(this.sshPasswordInput, sshParameters.sshPassword, { replace: true, paste: true });
        }
        if (!!sshParameters.sshPrivateKey) {
            await t
                .click(this.sshPrivateKeyRadioBtn)
                .typeText(this.sshPrivateKeyInput, sshParameters.sshPrivateKey, { replace: true, paste: true });
        }
        if (!!sshParameters.sshPassphrase) {
            await t
                .click(this.sshPrivateKeyRadioBtn)
                .typeText(this.sshPrivateKeyInput, sshParameters.sshPrivateKey!, { replace: true, paste: true })
                .typeText(this.sshPassphraseInput, sshParameters.sshPassphrase, { replace: true, paste: true });
        }
        // Click for saving
        await t.click(this.addRedisDatabaseButton);
    }

    /**
     * Auto-discover Master Groups from Sentinel
     * @param parameters - Parameters of Sentinel: host, port and Sentinel password
     */
    async discoverSentinelDatabases(parameters: SentinelParameters): Promise<void> {

        await t
            .click(this.addDatabaseButton)
            .click(this.addAutoDiscoverDatabase);

        await t.click(this.redisSentinelType);
        if (!!parameters.sentinelHost) {
            await t.typeText(this.hostInput, parameters.sentinelHost, { replace: true, paste: true });
        }
        if (!!parameters.sentinelPort) {
            await t.typeText(this.portInput, parameters.sentinelPort, { replace: true, paste: true });
        }
        if (!!parameters.sentinelPassword) {
            await t.typeText(this.passwordInput, parameters.sentinelPassword, { replace: true, paste: true });
        }
    }

    /**
     * Adding a new database from RE Cluster via auto-discover flow
     * @param parameters the parameters of the database
     */
    async addAutodiscoverREClusterDatabase(parameters: AddNewDatabaseParameters): Promise<void> {

        await t
            .click(this.addDatabaseButton)
            .click(this.addAutoDiscoverDatabase);

        await t.click(this.redisClusterType);
        await t
            .typeText(this.hostInput, parameters.host, { replace: true, paste: true })
            .typeText(this.portInput, parameters.port, { replace: true, paste: true })
            .typeText(this.usernameInput, parameters.databaseUsername!, { replace: true, paste: true })
            .typeText(this.passwordInput, parameters.databasePassword!, { replace: true, paste: true });
    }

    /**
     * Adding a new database from RE Cloud via auto-discover flow
     * @param parameters the parameters of the database
     */
    async addAutodiscoverRECloudDatabase(cloudAPIAccessKey: string, cloudAPISecretKey: string): Promise<void> {

        await t
            .click(this.addDatabaseButton)
            .click(this.addAutoDiscoverDatabase);

        await t
            .typeText(this.accessKeyInput, cloudAPIAccessKey, { replace: true, paste: true })
            .typeText(this.secretKeyInput, cloudAPISecretKey, { replace: true, paste: true });
    }

    /**
     * Auto-discover Master Groups from Sentinel
     * @param parameters - Parameters of Sentinel: host, port and Sentinel password
     */
    async addOssClusterDatabase(parameters: OSSClusterParameters): Promise<void> {

        await t
            .click(this.addDatabaseButton)
            .click(this.addDatabaseManually);

        if (!!parameters.ossClusterHost) {
            await t.typeText(this.hostInput, parameters.ossClusterHost, { replace: true, paste: true });
        }
        if (!!parameters.ossClusterPort) {
            await t.typeText(this.portInput, parameters.ossClusterPort, { replace: true, paste: true });
        }
        if (!!parameters.ossClusterDatabaseName) {
            await t.typeText(this.databaseAliasInput, parameters.ossClusterDatabaseName, { replace: true, paste: true });
        }
    }

    /**
     * set copressor value in dropdown
     * @param compressor - compressor value
     */
    async setCompressorValue(compressor: string): Promise<void> {

        if(!await this.selectCompressor.exists) {
            await t.click(this.dataCompressorLabel);
        }
        await t.click(this.selectCompressor);
        await t.click(Selector(`[id="${compressor}"]`));
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
    databasePassword?: string,
    caCert?: {
        name?: string,
        certificate?: string
    },
    clientCert?: {
        name?: string,
        certificate?: string,
        key?: string
    }
};

/**
 * Sentinel database parameters
 * @param sentinelHost The host of sentinel
 * @param sentinelPort The port of sentinel
 * @param sentinelPassword The password of sentinel
 */
export type SentinelParameters = {
    sentinelHost: string,
    sentinelPort: string,
    masters?: {
        alias?: string,
        db?: string,
        name?: string,
        password?: string
    }[],
    sentinelPassword?: string,
    name?: string[]
};

/**
 * OSS Cluster database parameters
 * @param ossClusterHost The host of OSS Cluster
 * @param ossClusterPort The port of OSS Cluster
 * @param ossClusterDatabaseName Database name for OSS Cluster
 */

export type OSSClusterParameters = {
    ossClusterHost: string,
    ossClusterPort: string,
    ossClusterDatabaseName: string
};

/**
 * Already existing database parameters
 * @param id The id of the database
 * @param host The host of the database
 * @param port The port of the database
 * @param name The name of the database
 * @param connectionType The connection type of the database
 * @param lastConnection The last connection time of the database
 */
export type databaseParameters = {
    id: string,
    host?: string,
    port?: string,
    name?: string,
    connectionType?: string,
    lastConnection?: string
};

/**
 * Nodes in OSS Cluster parameters
 * @param host The host of the node
 * @param port The port of the node
 */
export type ClusterNodes = {
    host: string,
    port: string
};

/**
 * SSH parameters
 * @param sshHost The hostname of ssh
 * @param sshPort The port of ssh
 * @param sshUsername The username of ssh
 * @param sshPassword The password of ssh
 * @param sshPrivateKey The private key of ssh
 * @param sshPassphrase The passphrase of ssh
 */
export type SSHParameters = {
    sshHost: string,
    sshPort: string,
    sshUsername: string,
    sshPassword?: string,
    sshPrivateKey?: string,
    sshPassphrase?: string
};
