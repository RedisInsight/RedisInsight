import { HostingProvider } from 'src/modules/core/models/database-instance.entity';
import { IP_ADDRESS_REGEX, PRIVATE_IP_ADDRESS_REGEX } from 'src/constants';

export const getHostingProvider = (host: string): HostingProvider => {
  // Tries to detect the hosting provider from the hostname.
  if (host === '0.0.0.0' || host === 'localhost') {
    return HostingProvider.LOCALHOST;
  }
  if (IP_ADDRESS_REGEX.test(host) && PRIVATE_IP_ADDRESS_REGEX.test(host)) {
    return HostingProvider.LOCALHOST;
  }
  if (host.endsWith('rlrcp.com') || host.endsWith('redislabs.com')) {
    return HostingProvider.RE_CLOUD;
  }
  if (host.endsWith('cache.amazonaws.com')) {
    return HostingProvider.AWS;
  }
  if (host.endsWith('cache.windows.net')) {
    return HostingProvider.AZURE;
  }
  return HostingProvider.UNKNOWN;
};
