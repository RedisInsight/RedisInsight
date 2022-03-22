import { HostingProvider } from 'src/modules/core/models/database-instance.entity';
import { IP_ADDRESS_REGEX, PRIVATE_IP_ADDRESS_REGEX } from 'src/constants';

// Ignore LGTM [js/incomplete-url-substring-sanitization] alert.
// Because we do not bind potentially dangerous logic to this.
// We define a hosting provider for telemetry only.
export const getHostingProvider = (host: string): HostingProvider => {
  // Tries to detect the hosting provider from the hostname.
  if (host === '0.0.0.0' || host === 'localhost') {
    return HostingProvider.LOCALHOST;
  }
  if (IP_ADDRESS_REGEX.test(host) && PRIVATE_IP_ADDRESS_REGEX.test(host)) {
    return HostingProvider.LOCALHOST;
  }
  if (host.endsWith('rlrcp.com') || host.endsWith('redislabs.com')) { // lgtm[js/incomplete-url-substring-sanitization]
    return HostingProvider.RE_CLOUD;
  }
  if (host.endsWith('cache.amazonaws.com')) { // lgtm[js/incomplete-url-substring-sanitization]
    return HostingProvider.AWS;
  }
  if (host.endsWith('cache.windows.net')) { // lgtm[js/incomplete-url-substring-sanitization]
    return HostingProvider.AZURE;
  }
  return HostingProvider.UNKNOWN;
};
