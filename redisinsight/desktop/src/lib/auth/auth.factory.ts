import { AuthStrategy } from './auth.interface'
import { TcpAuthStrategy } from './tcp.auth.strategy'
import { ServiceAuthStrategy } from './service.auth.strategy'

export const createAuthStrategy = (
  isDevelopment: boolean,
  beApp: any
): AuthStrategy => {
  if (isDevelopment) {
    return TcpAuthStrategy.getInstance()
  }
  return ServiceAuthStrategy.getInstance(beApp)
}
