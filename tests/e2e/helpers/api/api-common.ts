import * as request from 'supertest';
import { Common } from '../common';
import { Methods } from '../constants';

const endpoint = Common.getEndpoint();

/**
 * Send request using API
 * @param method http method
 * @param resourcePath URI path segment
 * @param statusCode Expected status code of the response
 * @param body Request body
 */
export async function sendRequest(
    method: string,
    resourcePath: string,
    statusCode: number,
    body?: Record<string, unknown>
): Promise<any> {
    const windowId = Common.getWindowId();
    let requestEndpoint;

    if (method === Methods.post) {
        (requestEndpoint = request(endpoint)
            .post(resourcePath)
            .send(body)
            .set('Accept', 'application/json'));
    }
    else if (method === Methods.get) {
        (requestEndpoint = request(endpoint)
            .get(resourcePath)
            .set('Accept', 'application/json'));
    }
    else if (method === Methods.delete) {
        (requestEndpoint = request(endpoint)
            .delete(resourcePath)
            .send(body)
            .set('Accept', 'application/json'));
    }

    if (await windowId) {
        requestEndpoint.set('X-Window-Id', await windowId);
    }

    return await requestEndpoint.expect(statusCode);
}
