import * as classTransformer from 'class-transformer';
import { TransformToMap } from './transform-to-map.decorator';

const { Expose, classToPlain, plainToClass } = classTransformer;

class DummyClass {
  @Expose()
  value: string;
}

class TestDto {
  @TransformToMap(DummyClass)
  @Expose()
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

  it('should convert a class instance to a plain object', () => {
    const dummy1 = new DummyClass();
    dummy1.value = 'test1';
    const dummy2 = new DummyClass();
    dummy2.value = 'test2';

    const dataMap = {
      key1: { value: 'test1' },
      key2: { value: 'test2' },
    };

    const instance = new TestDto();
    instance.data = dataMap;

    const plain = classToPlain(instance);

    expect(plain).toHaveProperty('data');
    expect(plain.data).toEqual({
      key1: { value: 'test1' },
      key2: { value: 'test2' },
    });
  });

  it('should handle an empty Map gracefully on reverse conversion', () => {
    const instance = new TestDto();
    instance.data = {};

    const plain = classToPlain(instance);

    expect(plain.data).toEqual({});
  });

  it('should handle undefined values gracefully on reverse conversion', () => {
    const instance = new TestDto();
    instance.data = undefined;

    const plain = classToPlain(instance);

    expect(plain.data).toEqual(undefined);
  });

  it('should trigger plainToClass without triggering classToPlain', () => {
    const spyClassToPlain = jest.spyOn(classTransformer, 'classToPlain');

    const input = {
      data: {
        key1: { value: 'test1' },
        key2: { value: 'test2' },
      },
    };

    const instance = plainToClass(TestDto, input, {
      excludeExtraneousValues: true,
    });

    expect(instance.data).toBeDefined();
    expect(instance.data.key1).toBeInstanceOf(DummyClass);
    expect(instance.data.key1.value).toEqual('test1');

    expect(spyClassToPlain).not.toHaveBeenCalled();

    spyClassToPlain.mockRestore();
  });

  it('should trigger classToPlain without triggering plainToClass', () => {
    const spyPlainToClass = jest.spyOn(classTransformer, 'plainToClass');

    const dummy1 = new DummyClass();
    dummy1.value = 'test1';
    const dummy2 = new DummyClass();
    dummy2.value = 'test2';

    const instance = new TestDto();
    instance.data = {
      key1: dummy1,
      key2: dummy2,
    };

    const plain = classToPlain(instance);

    expect(plain).toHaveProperty('data');
    expect(plain.data).toEqual({
      key1: { value: 'test1' },
      key2: { value: 'test2' },
    });

    expect(spyPlainToClass).not.toHaveBeenCalled();

    spyPlainToClass.mockRestore();
  });
});
