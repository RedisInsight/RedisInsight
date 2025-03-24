export const ToggleAnalyticsReason = {
  None: 'none',
  OauthAgreement: 'oauth-agreement',
  Google: 'google',
  GitHub: 'github',
  SSO: 'sso',
  User: 'user',
} as const;
export type ToggleAnalyticsReasonType = typeof ToggleAnalyticsReason[keyof typeof ToggleAnalyticsReason];
