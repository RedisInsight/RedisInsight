import { Expose, Type, plainToClass } from 'class-transformer';
import { TransformToMap } from './transform-to-map.decorator';

class DummyClass {
  @Expose()
  value: string;
}

class TestDto {
  @TransformToMap(DummyClass)
  @Expose()
  @Type(() => DummyClass)
  data: Record<string, DummyClass>;
}

describe('TransformToMap decorator', () => {
  it('should transform each map value into an instance of DummyClass', () => {
    const input = {
      data: {
        key1: { value: 'test1' },
        key2: { value: 'test2' },
      },
    };

    const instance = plainToClass(TestDto, input);

    expect(instance.data).toBeDefined();
    expect(instance.data.key1).toBeInstanceOf(DummyClass);
    expect(instance.data.key2).toBeInstanceOf(DummyClass);
    expect(instance.data.key1.value).toEqual('test1');
    expect(instance.data.key2.value).toEqual('test2');
  });

  it('should handle empty objects gracefully', () => {
    const input = { data: {} };
    const instance = plainToClass(TestDto, input);

    expect(instance.data).toEqual({});
  });

  it('should handle undefined values gracefully', () => {
    const input = { data: undefined };
    const instance = plainToClass(TestDto, input);

    expect(instance.data).toEqual(undefined);
  });
});
