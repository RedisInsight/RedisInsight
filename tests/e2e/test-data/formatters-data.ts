import {
    ASCIIFormatter,
    BinaryFormatter,
    HEXFormatter,
    JavaFormatter,
    JSONFormatter,
    MsgpackFormatter,
    PHPFormatter,
    PickleFormatter,
    ProtobufFormatter,
    Vector32BitFormatter,
    Vector64BitFormatter
} from './formatters';
import { DataTimeFormatter } from './formatters/DataTime';

interface IFormatter {
    format: string,
    fromText?: string,
    fromTextEdit?: string,
    fromBigInt?: string,
    formattedText?: string,
    fromHexText?: string,
    formattedTextEdit?: string
}

/**
 * Formatters objects with test data for format convertion
 */
export const formatters: IFormatter[] = [
    JSONFormatter,
    MsgpackFormatter,
    ProtobufFormatter,
    PHPFormatter,
    JavaFormatter,
    ASCIIFormatter,
    HEXFormatter,
    BinaryFormatter,
    PickleFormatter,
    Vector32BitFormatter,
    Vector64BitFormatter,
    DataTimeFormatter
];

export const binaryFormattersSet: IFormatter[] = [
    ASCIIFormatter,
    HEXFormatter,
    BinaryFormatter
];

export const formattersHighlightedSet: IFormatter[] = [JSONFormatter, PHPFormatter];
export const fromBinaryFormattersSet: IFormatter[] = [
    MsgpackFormatter,
    ProtobufFormatter,
    JavaFormatter,
    PickleFormatter,
    Vector32BitFormatter,
    Vector64BitFormatter
];
export const formattersForEditSet: IFormatter[] = [
    JSONFormatter,
    MsgpackFormatter,
    PHPFormatter
];
export const formattersWithTooltipSet: IFormatter[] = [
    JSONFormatter,
    MsgpackFormatter,
    ProtobufFormatter,
    PHPFormatter,
    JavaFormatter,
    PickleFormatter
];
export const vectorFormattersSet: IFormatter[] = [
    Vector64BitFormatter,
    Vector32BitFormatter
];
export const notEditableFormattersSet: IFormatter[] = [
    ProtobufFormatter,
    JavaFormatter,
    PickleFormatter,
    Vector32BitFormatter,
    Vector64BitFormatter
];
