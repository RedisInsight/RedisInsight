import { ModifiedGetHashMembersResponse } from 'uiSrc/slices/interfaces/instances'

export interface StateHash {
  loading: boolean;
  error: string;
  data: ModifiedGetHashMembersResponse;
  updateValue: {
    loading: boolean;
    error: string;
  };
}
