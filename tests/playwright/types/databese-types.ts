export type DatabasesForImport = {
    host?: string,
    port?: number | string,
    name?: string,
    result?: string,
    username?: string,
    auth?: string,
    cluster?: boolean | string,
    indName?: string,
    db?: number,
    ssh_port?: number,
    timeout_connect?: number,
    timeout_execute?: number,
    other_field?: string,
    ssl?: boolean,
    ssl_ca_cert_path?: string,
    ssl_local_cert_path?: string,
    ssl_private_key_path?: string
}[]
export type AddNewDatabaseParameters = {
    host: string
    port: string
    databaseName?: string
    databaseUsername?: string
    databasePassword?: string
    // For OSS Cluster parameters, you might use these fields:
    ossClusterHost?: string
    ossClusterPort?: string
    ossClusterDatabaseName?: string
    caCert?: {
        name?: string
        certificate?: string
    }
    clientCert?: {
        name?: string
        certificate?: string
        key?: string
    }
}
