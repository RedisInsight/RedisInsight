export type SentinelParameters = {
    sentinelHost: string
    sentinelPort: string
    masters?: {
        alias?: string
        db?: string
        name?: string
        password?: string
    }[]
    sentinelPassword?: string
    name?: string[]
}

export type OSSClusterParameters = {
    ossClusterHost: string
    ossClusterPort: string
    ossClusterDatabaseName: string
}

export type SSHParameters = {
    sshHost: string
    sshPort: string
    sshUsername: string
    sshPassword?: string
    sshPrivateKey?: string
    sshPassphrase?: string
}

/**
 * Nodes in OSS Cluster parameters
 * @param host The host of the node
 * @param port The port of the node
 */
export type ClusterNodes = {
    host: string
    port: string
}
