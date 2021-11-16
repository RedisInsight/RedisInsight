import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TlsDto } from 'src/modules/instances/dto/database-instance.dto';

@ValidatorConstraint({ name: 'tls-cert', async: false })
export class CaCertCollisionValidator implements ValidatorConstraintInterface {
  validate(tls: TlsDto): boolean {
    return !(!!tls.caCertId && !!tls.newCaCert);
  }

  defaultMessage(): string {
    return "Can't use caCertId and newCaCert at the same time";
  }
}
