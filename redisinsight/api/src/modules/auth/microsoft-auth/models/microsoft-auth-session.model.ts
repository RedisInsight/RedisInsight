import { Expose } from 'class-transformer';

/**
 * Data model for Microsoft Authentication session
 */
export class MicrosoftAuthSessionData {
  /**
   * Primary key
   */
  @Expose()
  id: string;

  /**
   * The serialized MSAL token cache
   */
  @Expose()
  tokenCache?: string;

  /**
   * Username of the authenticated user
   */
  @Expose()
  username?: string;

  /**
   * Account ID from Microsoft
   */
  @Expose()
  accountId?: string;

  /**
   * Tenant ID from Microsoft
   */
  @Expose()
  tenantId?: string;

  /**
   * Display name of the user
   */
  @Expose()
  displayName?: string;

  /**
   * Last updated timestamp
   */
  @Expose()
  lastUpdated?: number;
}