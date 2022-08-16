import { Test, TestingModule } from '@nestjs/testing';
import { UTF8FormatterStrategy} from './strategies/utf8-formatter.strategy';
import { FormatterTypes } from './formatter.interface';
import { FormatterManager } from './formatter-manager';

const strategyName = FormatterTypes.UTF8;
const testStrategy = new UTF8FormatterStrategy();

describe('OutputFormatterManager', () => {
  let outputFormatter: FormatterManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormatterManager],
    }).compile();

    outputFormatter = module.get<FormatterManager>(
      FormatterManager,
    );
  });
  it('Should throw error if no strategy', () => {
    try {
      outputFormatter.getStrategy(strategyName);
    } catch (e) {
      expect(e.message).toEqual(
        `Unsupported formatter strategy: ${strategyName}`,
      );
    }
  });
  it('Should add strategy to formatter and get it back', () => {
    outputFormatter.addStrategy(strategyName, testStrategy);
    expect(outputFormatter.getStrategy(strategyName)).toEqual(testStrategy);
  });
  it('Should support TextFormatter strategy', () => {
    outputFormatter.addStrategy(
      FormatterTypes.UTF8,
      new UTF8FormatterStrategy(),
    );
    expect(
      outputFormatter.getStrategy(FormatterTypes.UTF8),
    ).toBeInstanceOf(UTF8FormatterStrategy);
  });
});
