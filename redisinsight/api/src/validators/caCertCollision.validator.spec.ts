import { TlsDto } from 'src/modules/instances/dto/database-instance.dto';
import { mockCaCertDto } from 'src/__mocks__';
import { CaCertCollisionValidator } from './caCertCollision.validator';

const validator = new CaCertCollisionValidator();

describe('CaCertCollisionValidator', () => {
  it('should return true for new certificates', () => {
    const dto: TlsDto = {
      verifyServerCert: true,
      newCaCert: mockCaCertDto,
    };
    expect(validator.validate(dto)).toEqual(true);
  });
  it('should return true for exist certificates', () => {
    const dto: TlsDto = {
      verifyServerCert: true,
      caCertId: 'a77b23c1-7816-4ea4-b61f-d37795a0f805',
    };
    expect(validator.validate(dto)).toEqual(true);
  });
  it('should return false', () => {
    const dto: TlsDto = {
      verifyServerCert: true,
      caCertId: 'a77b23c1-7816-4ea4-b61f-d37795a0f805',
      newCaCert: mockCaCertDto,
    };
    expect(validator.validate(dto)).toEqual(false);
  });

  it('should return particular message by default', () => {
    expect(validator.defaultMessage()).toEqual(
      "Can't use caCertId and newCaCert at the same time",
    );
  });
});
