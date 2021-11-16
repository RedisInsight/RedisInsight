import { TlsDto } from 'src/modules/instances/dto/database-instance.dto';
import { mockClientCertDto } from 'src/__mocks__';
import { ClientCertCollisionValidator } from './clientCertCollision.validator';

const validator = new ClientCertCollisionValidator();

describe('ClientCertCollisionValidator', () => {
  it('should return true for new certificates', () => {
    const dto: TlsDto = {
      verifyServerCert: true,
      newClientCertPair: mockClientCertDto,
    };
    expect(validator.validate(dto)).toEqual(true);
  });
  it('should return true for exist certificates', () => {
    const dto: TlsDto = {
      verifyServerCert: true,
      clientCertPairId: 'a77b23c1-7816-4ea4-b61f-d37795a0f805',
    };
    expect(validator.validate(dto)).toEqual(true);
  });
  it('should return false', () => {
    const dto: TlsDto = {
      verifyServerCert: true,
      clientCertPairId: 'a77b23c1-7816-4ea4-b61f-d37795a0f805',
      newClientCertPair: mockClientCertDto,
    };
    expect(validator.validate(dto)).toEqual(false);
  });

  it('should return particular message by default', () => {
    expect(validator.defaultMessage()).toEqual(
      "Can't use clientCertPairId and newClientCertPair at the same time",
    );
  });
});
