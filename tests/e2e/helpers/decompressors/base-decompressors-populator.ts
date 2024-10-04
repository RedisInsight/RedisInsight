import { createClient } from 'redis';

export abstract class BaseDatabasePopulator {
    private client: ReturnType<typeof createClient>;

    protected abstract createCompressedKeys(): Promise<void>;

    constructor(private host: string, private port: string) {
        const dbConf = { port: Number.parseInt(port), host, username: 'default' };
        this.client = createClient(dbConf);

        this.client.on('error', (error: string) => {
            throw new Error(`Redis connection error: ${error}`);
        });
    }

    /**
     * Populate db with compressed keys
     */
    public async populateDB(): Promise<void> {
        this.client.on('connect', async () => {
            console.log('Connected to Redis');
            try {
                await this.createCompressedKeys();
            } catch (error) {
                console.error('Error during key creation:', error);
            } finally {
                await this.client.quit();
            }
        });
    }

    /**
     * create a hash
     * @param prefix prefix of the key name
     * @param values values of the hash
     */
    protected async createHash(
        prefix: string,
        values: Buffer[]
    ): Promise<void> {
        let fields: string[] = [];

        const randomNumber = Array.from({ length: 5 }).map(() => Math.random());

        values.forEach((value) => {
            const field = `${value.toString()}:${randomNumber.toString()}`;
            const fieldValue = `${value.toString()}:${randomNumber.toString()}`;
            fields.push(field, fieldValue);
        });

        try {
            await this.client.hset(`${prefix}:hash`, ...fields);
            console.log(`Hash created with prefix: ${prefix}`);
        } catch (error) {
            console.error(`Error creating hash with prefix ${prefix}:`, error);
            throw error;
        }
    }

    /**
     * create a string
     * @param prefix prefix of the key name
     * @param value values of the string
     */
    protected async createString(prefix: string, value: Buffer): Promise<void> {
        this.client.set(`${prefix}:string`, value, (error: Error | null) => {
            if (error) {
                console.error(`Error saving key ${prefix}:`, error);
                throw error;
            }
            console.log(`Key ${prefix} successfully saved.`);
        });
    }
}
