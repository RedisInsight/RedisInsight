import { RequestLogger, t } from 'testcafe';

export class Telemetry {
    /**
     * Create new logger
     */
    createLogger(): RequestLogger {
        const options = { logRequestBody: true, logRequestHeaders: true, stringifyRequestBody: true };
        const logger = RequestLogger(/.*/, options);
        return logger;
    }

    /**
     * Wait for telemetry event request sent by its name
     * @param eventName The telemetry event name
     * @param logger The logger object
     */
    async waitForEventRequestSentByName(eventName: string, logger: any): Promise<LoggedRequest> {
        const request = logger.requests.find(request => {
            const requestBody = request.request.body.toString();
            if (!requestBody) {
                return false;
            } // make sure the request body is not empty
            try {
                const requestBodyJson = JSON.parse(requestBody);
                return requestBodyJson.event === eventName;
            }
            catch (error) {
                console.error(`Failed to parse JSON in request body: ${error}`);
                return false;
            }
        });

        await t.expect(request).ok(`${eventName} Event not found or does not have expected body`);
        return request!;
    }

    /**
     * Verify that event has properties
     * @param eventName The telemetry event name
     * @param properties The telemetry event properties
     * @param logger The logger object
     */
    async verifyEventHasProperties(eventName: string, properties: string[], logger: any): Promise<void> {
        // Extract the request body as JSON
        const request = await this.waitForEventRequestSentByName(eventName, logger);
        const requestBody = JSON.parse(request.request.body.toString());

        // Verify that event has all properties
        for (const property of properties) {
            t.expect(requestBody).hasOwnProperty(property);
        }
    }

    /**
     * Verify that event has property with value
     * @param eventName The telemetry event name
     * @param property The telemetry event property
     * @param value The property value
     * @param logger The logger object
     */
    async verifyEventPropertyValue(eventName: string, property: string, value: string, logger: any): Promise<void> {
        // Extract the request body as JSON
        const request = await this.waitForEventRequestSentByName(eventName, logger);
        const requestBody = JSON.parse(request.request.body.toString());

        // Verify that event has correct property value
        await t.expect(String(requestBody.eventData[property])).eql(value);
    }
}
