import { pack as msgpackrPack } from 'msgpackr';
import * as fflate from 'fflate';
import * as fs from 'fs';
import * as proto from 'protobufjs';
import { BaseDatabasePopulator } from './base-decompressors-populator';

const COMPRESSED_PREFIX = 'Comp';
const GZLIB_PREFIX = 'GZLIB';

export class PhpGzcompressDatabasePopulator extends BaseDatabasePopulator {

    /**
     * Create keys with all types of LZ4 compression
     */

    protected async createCompressedKeys(): Promise<void> {
        await this.createGZCompressUnicodeKeys();
        await this.createGZCompressASCIIKeys();
        await this.createGZCompressJSONKeys();
        await this.createGZCompressPHPUnserializedJSONKeys();
        await this.createGZCompressMsgpackKeys();
        await this.createGZCompressProtobufKeys();
        await this.createGZCompressPickleKeys();
        await this.createGZCompressJavaSerializedObjectKeys();
        await this.createGZCompressVectorKeys();
    };

    private async createGZCompressUnicodeKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:Unicode`;
        const rawValue = '漢字';

        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.zlibSync(buf));

        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    };

    private async createGZCompressASCIIKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:ASCII`;
        const rawValue = '\xac\xed\x00\x05t\x0a4102';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.zlibSync(buf));

        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    };

    private async createGZCompressJSONKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:JSON`;
        const rawValue = '{"test":"test"}';

        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.zlibSync(buf));

        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    };

    private async createGZCompressPHPUnserializedJSONKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:PHP`;
        const rawValue = 'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';

        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.zlibSync(buf));

        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    };

    private async createGZCompressJavaSerializedObjectKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:Java`;
        const rawValue = fs.readFileSync('./test-data/decompressors/test_serialised_obj.ser');
        const rawValue2 = fs.readFileSync('./test-data/decompressors/test_annotated_obj.ser');

        const value = Buffer.from(fflate.zlibSync(rawValue));
        const value2 = Buffer.from(fflate.zlibSync(rawValue2));

        await this.createHash(prefix, [value,value2]);
        await this.createString(prefix, value);
    };

    private async createGZCompressMsgpackKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:Msgpack`;
        const rawValue = msgpackrPack({
            hello: 'World',
            array: [1, 2],
            obj: {test: 'test'},
            boolean: false,
        });

        const value = Buffer.from(fflate.zlibSync(rawValue));

        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    };

    private async createGZCompressVectorKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:Vector`;
        const rawValue = JSON.parse(fs.readFileSync('./test-data/decompressors/vector.json', 'utf8'));

        const value = Buffer.from(fflate.zlibSync(rawValue));

        await this.createHash(prefix, [value]);
        await this.createString(prefix, value);
    };

    private createGZCompressProtobufKeys() : Promise<void> {
        return new Promise((resolve, reject) => {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:Proto`;

            proto.load('./test-data/decompressors/awesome.proto', async (err, root) => {
                if (err || !root) {
                    console.error('Error loading protobuf:', err);
                    return reject(err);
                }
                try {
                    const Book = root.lookupType('com.book.BookStore')
                    const payloadBookStore = {
                        name: 'Test name',
                        books: { 0: 'book 1', 1: 'book 2' },
                    };
                    const message = Book.create(payloadBookStore); // or use .fromObject if conversion is necessary

                    // Encode a message to an Uint8Array (browser) or Buffer (node)
                    const rawValue = Book.encode(message).finish();

                    const value = Buffer.from(fflate.zlibSync(rawValue));
                    await this.createHash(prefix, [value]);
                    await this.createString(prefix, value);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    };

    private async createGZCompressPickleKeys() {
        const prefix = `${COMPRESSED_PREFIX}:${GZLIB_PREFIX}:Pickle`;

        const rawValue = fs.readFileSync('./test-data/decompressors/test_serialised_obj.ser');
        const rawValue2 = fs.readFileSync('./test-data/decompressors/test_annotated_obj.ser');

        const value = Buffer.from(fflate.zlibSync(rawValue));
        const value2 = Buffer.from(fflate.zlibSync(rawValue2));
        await this.createHash(prefix, [value,value2]);
        await this.createString(prefix, value);
    };
}

