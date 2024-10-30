import { pack as msgpackrPack } from 'msgpackr';
import * as fs from 'fs';
import * as fflate from 'fflate';
import * as proto from 'protobufjs';
import { BaseDatabasePopulator } from './base-decompressors-populator';


const COMPRESSED_PREFIX = 'Comp';
const GZIP_PREFIX = 'GZIP';

export class GzipDatabasePopulator extends BaseDatabasePopulator {

    /**
     * Create keys with all types of Gzip compression
     */
    protected async createCompressedKeys(): Promise<void> {
        await this.createGZIPUnicodeKeys();
        await this.createGZIPASCIIKeys();
        await this.createGZIPJSONKeys();
        await this.createGZIPPHPUnserializedJSONKeys();
        await this.createGZIPMsgpackKeys();
        await this.createGZIPProtobufKeys();
        await this.createGZIPPickleKeys();
        await this.createGZIPJavaSerializedObjectKeys();
        await this.createGZIPVectorKeys();
    }

    private async createGZIPUnicodeKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:Unicode`;
        const rawValue = '漢字';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.compressSync(buf));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createGZIPASCIIKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:ASCII`;
        const rawValue = '\xac\xed\x00\x05t\x0a4102';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.compressSync(buf));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createGZIPJSONKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:JSON`;
        const rawValue = '{"test":"test"}';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.compressSync(buf));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createGZIPPHPUnserializedJSONKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:PHP`;
        const rawValue =
            'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';
        const buf = fflate.strToU8(rawValue);
        const value = Buffer.from(fflate.compressSync(buf));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createGZIPJavaSerializedObjectKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:Java`;
        const rawValue = fs.readFileSync('./test-data/decompressors/test_serialised_obj.ser');
        const rawValue2 = fs.readFileSync('./test-data/decompressors/test_annotated_obj.ser');

        const value = Buffer.from(fflate.compressSync(rawValue));
        const value2 = Buffer.from(fflate.compressSync(rawValue2));

        await this.createString(prefix, value);
        await this.createString(prefix, value2);
        await this.createHash(prefix, [value,value2]);
    }

    private async createGZIPMsgpackKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:Msgpack`;
        const rawValue = msgpackrPack({
            hello: 'World',
            array: [1, 2],
            obj: {test: 'test'},
            boolean: false,
        });

        const value = Buffer.from(fflate.compressSync(rawValue));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private async createGZIPVectorKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:Vector`;
        const rawValue = JSON.parse(fs.readFileSync('./test-data/decompressors/vector.json', 'utf8'));
        const value = Buffer.from(fflate.compressSync(rawValue));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }

    private createGZIPProtobufKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:Proto`;

        return new Promise((resolve, reject) => {
            proto.load('./test-data/decompressors/awesome.proto', async (err, root) => {
                if (err || !root) {
                    console.error('Error loading protobuf:', err);
                    return reject(err);
                }

                const Book = root.lookupType('com.book.BookStore');
                const payloadBookStore = {
                    name: 'Test name',
                    books: {0: 'book 1', 1: 'book 2'},
                };
                const message = Book.create(payloadBookStore);
                const rawValue = Book.encode(message).finish();
                const value = Buffer.from(fflate.compressSync(rawValue));

                await this.createString(prefix, value);
                await this.createHash(prefix, [value]);

                resolve();
            });
        });
    }

    private async createGZIPPickleKeys(): Promise<void> {
        const prefix = `${COMPRESSED_PREFIX}:${GZIP_PREFIX}:Pickle`;
        const rawValue = fs.readFileSync('./test-data/decompressors/pickleFile1.pickle');
        const value = Buffer.from(fflate.compressSync(rawValue));

        await this.createString(prefix, value);
        await this.createHash(prefix, [value]);
    }
}
