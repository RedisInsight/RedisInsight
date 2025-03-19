import { HttpClient } from './http-client'
import { ResourcePath } from '../constants'


/**
 * Synchronize features
 */
export async function syncFeaturesApi(apiUrl: string, xWindowsId: string): Promise<void> {
    const apiClient = new HttpClient(apiUrl).getClient()
    const response = await apiClient.post(ResourcePath.SyncFeatures, {},
        {headers:{
                'X-Window-Id': xWindowsId
            }
        })
    if (response.status !== 200) {
        throw new Error('Failed to synchronize features')
    }
}
