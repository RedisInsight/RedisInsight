import { pack as msgpackrPack } from 'msgpackr';
import * as fflate from 'fflate';
import * as fs from 'fs';
import * as lz4js from 'lz4js';
import * as proto from 'protobufjs';
import { BaseDatabasePopulator } from './base-decompressors-populator';

const COMPRESSED_PREFIX = 'Comp';
const LZ4_PREFIX = 'LZ4';

export class LZ4DatabasePopulator extends BaseDatabasePopulator{

    /**
     * Create keys with all types of LZ4 compression
     */
    protected async createCompressedKeys(): Promise<void> {
        await this.createLZ4UnicodeKeys();
        await this.createLZ4ASCIIKeys();
        await this.createLZ4JSONKeys();
        await this.createLZ4PHPUnserializedJSONKeys();
        await this.createLZ4MsgpackKeys();
        await this.createLZ4ProtobufKeys();
        await this.createLZ4PickleKeys();
        await this.createLZ4JavaSerializedObjectKeys();
        await this.createLZ4VectorKeys();
    }

    private async createLZ4UnicodeKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:Unicode`;
        const rawValue = '漢字';
        const buf = new TextEncoder().encode(rawValue);
        const value = Buffer.from(lz4js.compress(buf));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }

    private async createLZ4ASCIIKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:ASCII`;
        const rawValue = '\xac\xed\x00\x05t\x0a4102';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(lz4js.compress(buf));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }

    private async createLZ4JSONKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:JSON`;
        const rawValue = '{"test":"test"}';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(lz4js.compress(buf));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }

    private async createLZ4PHPUnserializedJSONKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:PHP`;
        const rawValue = 'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(lz4js.compress(buf));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }

    private async createLZ4JavaSerializedObjectKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:Java`;
        const rawValue = fs.readFileSync('./test-data/decompressors/test_serialised_obj.ser');
        const rawValue2 = fs.readFileSync('./test-data/decompressors/test_annotated_obj.ser');
        const value = Buffer.from(lz4js.compress(rawValue));
        const value2 = Buffer.from(lz4js.compress(rawValue2));
        await this.createHash(prefix, [value,value2]);
        await this.createString(prefix, value);
    }

    private async createLZ4MsgpackKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:Msgpack`;
        const rawValue = msgpackrPack({
            hello: 'World',
            array: [1, 2],
            obj: { test: 'test' },
            boolean: false,
        });
        const value = Buffer.from(lz4js.compress(rawValue));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }

    private createLZ4ProtobufKeys(): Promise<void> {
        return new Promise((resolve, reject) => {
            const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:Proto`;
            proto.load('./test-data/decompressors/awesome.proto', async (err, root) => {
                if (err || !root) {
                    console.error('Error loading protobuf:', err);
                    return reject(err);
                }
                try {
                    const Book = root.lookupType('com.book.BookStore');
                    const payload = { name: 'Test name', books: { 0: 'book 1', 1: 'book 2' } };
                    const message = Book.create(payload);
                    const rawValue = Book.encode(message).finish();
                    const value = Buffer.from(lz4js.compress(rawValue));
                    await this.createHash(prefix, [value]);
                    await this.createString(prefix, value);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    private async createLZ4PickleKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:Pickle`;
        const rawValue = fs.readFileSync('./test-data/decompressors/pickleFile1.pickle');
        const value = Buffer.from(lz4js.compress(rawValue));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }

    private async createLZ4VectorKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${LZ4_PREFIX}:Vector`;
        const rawValue = JSON.parse(fs.readFileSync('./test-data/decompressors/vector.json', 'utf8'));
        const value = Buffer.from(lz4js.compress(rawValue));
        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    }
}
