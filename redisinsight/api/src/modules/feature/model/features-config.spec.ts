import {
  mockFeaturesConfig, mockFeaturesConfigEntity,
  mockFeaturesConfigJson,
} from 'src/__mocks__';
import { classToPlain, plainToClass } from 'class-transformer';
import { FeaturesConfig } from 'src/modules/feature/model/features-config';
import { classToClass } from 'src/utils';
import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';

const testCases = [
  {
    plain: {
      ...mockFeaturesConfig,
      data: { ...mockFeaturesConfigJson },
    },
    model: mockFeaturesConfig,
    entity: Object.assign(new FeaturesConfigEntity(), { ...mockFeaturesConfigEntity, id: undefined }),
  },
  {
    plain: {},
    model: {},
    entity: {},
  },
  {
    plain: null,
    model: null,
    entity: null,
  },
  {
    plain: undefined,
    model: undefined,
    entity: undefined,
  },
  {
    plain: 'incorrectdata',
    model: 'incorrectdata',
    entity: 'incorrectdata',
  },
];

describe('FeaturesConfig', () => {
  describe('transform', () => {
    testCases.forEach((tc) => {
      it(`input ${JSON.stringify(tc.plain)}`, async () => {
        const modelFromPlain = plainToClass(FeaturesConfig, tc.plain);
        const plainFromModel = classToPlain(modelFromPlain);
        const entityFromModel = classToClass(FeaturesConfigEntity, modelFromPlain);
        const modelFromEntity = classToClass(FeaturesConfig, entityFromModel);

        expect(tc.model).toEqual(modelFromPlain);
        expect(tc.plain).toEqual(plainFromModel);
        expect(tc.entity).toEqual(entityFromModel);
        expect(tc.model).toEqual(modelFromEntity);
      });
    });
  });
});
