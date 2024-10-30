import * as proto from 'protobufjs';
import { pack as msgpackrPack } from 'msgpackr';
import * as brotli from 'brotli-unicode';
import * as fflate from 'fflate';
import * as fs from 'fs';
import { BaseDatabasePopulator } from './base-decompressors-populator';

const COMPRESSED_PREFIX = 'Comp';
const BROTLI_PREFIX = 'BROTLI';

export class BrotliDatabasePopulator extends BaseDatabasePopulator {

    /**
     * Create keys with all types of Bolti compression
     */
        protected async createCompressedKeys(): Promise<void> {
        await this.createBrotliUnicodeKeys();
        await this.createBrotliASCIIKeys();
        await this.createBrotliVectorKeys();
        await this.createBrotliJSONKeys();
        await this.createBrotliPHPUnserializedJSONKeys();
        await this.createBrotliJavaSerializedObjectKeys();
        await this.createBrotliMsgpackKeys();
        await this.createBrotliProtobufKeys();
        await this.createBrotliPickleKeys();
    }

    private async createBrotliUnicodeKeys() {
        const encoder = new TextEncoder();
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:Unicode`;
        const rawValue = '漢字';
        const buf = encoder.encode(rawValue);
        const value = Buffer.from(await brotli.compress(buf));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createBrotliASCIIKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:ASCII`;
        const rawValue = '\xac\xed\x00\x05t\x0a4102';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(await brotli.compress(buf));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createBrotliVectorKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:Vector`;
        const rawValue = JSON.parse(fs.readFileSync('./test-data/decompressors/vector.json', 'utf8'));
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(await brotli.compress(buf));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createBrotliJSONKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:JSON`;
        const rawValue = '{"test":"test"}';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(await brotli.compress(buf));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createBrotliPHPUnserializedJSONKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:PHP`;
        const rawValue = 'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(await brotli.compress(buf));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createBrotliPickleKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:Pickle`;
        const rawValue = fs.readFileSync('./test-data/decompressors/pickleFile1.pickle');
        const value = Buffer.from(await brotli.compress(rawValue));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    };

    private async createBrotliJavaSerializedObjectKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:Java`;
        const rawValue = fs.readFileSync('./test-data/decompressors/test_serialised_obj.ser');
        const rawValue2 = fs.readFileSync('./test-data/decompressors/test_annotated_obj.ser');

        const value = Buffer.from(await brotli.compress(rawValue));
        const value2 = Buffer.from(await brotli.compress(rawValue2));

        await this.createString(prefix, value);
        await this.createString(prefix, value2);
        await this.createHash(prefix, [value,value2]);
    }

    private async createBrotliMsgpackKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:Msgpack`;
        const rawValue = msgpackrPack({
            hello: 'World',
            array: [1, 2],
            obj: {test: 'test'},
            boolean: false,
        });
        const value = Buffer.from(await brotli.compress(rawValue));
        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private createBrotliProtobufKeys(): Promise<void> {
        return new Promise((resolve, reject) => {
            const prefix = `${COMPRESSED_PREFIX}:${BROTLI_PREFIX}:Proto`;
            proto.load('./test-data/decompressors/awesome.proto', async (err, root) => {
                if (err || !root) {
                    console.error('Error loading protobuf:', err);
                    return reject(err);
                }

                try {
                    const Book = root.lookupType('com.book.BookStore');
                    const payload = {name: 'Test name', books: {0: 'book 1', 1: 'book 2'}};
                    const message = Book.create(payload);
                    const rawValue = Book.encode(message).finish();

                    const value = Buffer.from(await brotli.compress(rawValue));
                    await this.createString(prefix, value);
                    await this.createHash(prefix, [value]);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}

