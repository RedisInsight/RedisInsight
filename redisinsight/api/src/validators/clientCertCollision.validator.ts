import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TlsDto } from 'src/modules/instances/dto/database-instance.dto';

@ValidatorConstraint({ name: 'tls-cert', async: false })
export class ClientCertCollisionValidator
implements ValidatorConstraintInterface {
  validate(tls: TlsDto): boolean {
    return !(!!tls.clientCertPairId && !!tls.newClientCertPair);
  }

  defaultMessage(): string {
    return "Can't use clientCertPairId and newClientCertPair at the same time";
  }
}
