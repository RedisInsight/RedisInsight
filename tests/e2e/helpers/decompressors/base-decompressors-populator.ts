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

    protected async createHash(
        prefix: string,
        value: Buffer,
        onlyOneItem = false,
        value2: Buffer = Buffer.from('')
    ): Promise<void> {
        let fields: string[] = [];

        const randomNumber = Array.from({ length: 5 }).map(() => Math.random());
        const field = `${value.toString()}:${randomNumber.toString()}`;
        const fieldValue = `${value.toString()}:${randomNumber.toString()}`;
        fields.push(field, fieldValue);

        if (onlyOneItem) {
            fields = [value.toString(), value.toString()];
        }

        if (value2) {
            fields.push(value2.toString(), value2.toString());
        }

        try {
            await this.client.hset(`${prefix}:hash`, ...fields);
            console.log(`Hash created with prefix: ${prefix}`);
        } catch (error) {
            console.error(`Error creating hash with prefix ${prefix}:`, error);
            throw error;
        }
    }

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
