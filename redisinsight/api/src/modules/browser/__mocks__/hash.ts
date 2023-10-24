import {
  AddFieldsToHashDto,
  DeleteFieldsFromHashDto,
  GetHashFieldsDto,
  GetHashFieldsResponse,
  HashFieldDto,
} from 'src/modules/browser/hash/dto';
import { mockKeyDto } from 'src/modules/browser/__mocks__/keys';
import { flatMap } from 'lodash';

export const mockHashField: HashFieldDto = {
  field: Buffer.from('field1'),
  value: Buffer.from('value'),
};
export const mockAddFieldsDto: AddFieldsToHashDto = {
  keyName: mockKeyDto.keyName,
  fields: [mockHashField],
};
export const mockDeleteFieldsDto: DeleteFieldsFromHashDto = {
  keyName: mockAddFieldsDto.keyName,
  fields: mockAddFieldsDto.fields.map((item) => item.field),
};
export const mockGetFieldsDto: GetHashFieldsDto = {
  keyName: mockAddFieldsDto.keyName,
  cursor: 0,
  count: 15,
  match: '*',
};
export const mockGetFieldsResponse: GetHashFieldsResponse = {
  keyName: mockGetFieldsDto.keyName,
  nextCursor: 0,
  total: mockAddFieldsDto.fields.length,
  fields: mockAddFieldsDto.fields,
};
export const mockRedisHScanResponse = [
  0,
  flatMap(mockAddFieldsDto.fields, ({ field, value }: HashFieldDto) => [field, value]),
];
