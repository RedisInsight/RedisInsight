import { filterArguments } from 'cli-argument-parser';

export const cliArguments = filterArguments('--', '=') as Arguments;

/**
 * The available/used CLI arguments
 * @param databaseHostname The hostname of the database
 * @param databasePort The port of the database
 * @param databaseName The name of the database
 * @param databaseUsername The username of the database
 * @param databasePassword The password of the database
 * @param sentinelHost The hostname of sentinel
 * @param sentinelPort The port of sentinel
 * @param sentinelPassword The password of sentinel
 * @param ossClusterHost The OSS Cluster host
 * @param ossClusterPort The OSS Cluster port
 * @param ossClusterDatabaseName The OSS Cluster database name
 */

export type Arguments = {
  databaseHostname?: string,
  databasePort?: string,
  databaseName?: string,
  databaseUsername?: string,
  databasePassword?: string,
  sentinelHost?: string,
  sentinelPort?: string,
  sentinelPassword?: string,
  ossClusterHost?: string,
  ossClusterPort?: string,
  ossClusterDatabaseName?: string,
  [key: string]: any
}
