export interface ICloudApiCredentials {
  accessToken?: string;
  apiSessionId?: string;
  csrf?: string;
}

export interface ICloudApiUser {
  id: string; // what difference between user_id?
  current_account_id: string;
  name: string;
  email: string;
  user_id: number;
  role: string;
}

export interface ICloudApiAccount {
  id: number;
  name: string;
  api_access_key: string;
}

export interface ICloudCApiKey {
  id: number;
  name: string;
  user_account: number;
  secret_key?: string;
}
