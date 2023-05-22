import { execSync } from 'child_process';

/**
 * Update features-config file in static server
 * @param filePath Path to feature config json
 */
export async function modifyFeaturesConfigJson(filePath: string): Promise<void> {
    const containerName = 'e2e-static-server-1';

    const command = `docker cp ${filePath} ${containerName}:/app/remote/features-config.json`;
    try {
        execSync(command);
    }
    catch (err) {
        console.error('Error copying file to the static server container:', err.message);
    }
}
