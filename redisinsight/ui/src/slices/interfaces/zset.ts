import { ModifiedZsetMembersResponse } from 'uiSrc/slices/interfaces/instances'

export interface StateZsetData extends ModifiedZsetMembersResponse {
  sortOrder?: string;
}

export interface StateZset {
  loading: boolean;
  searching: boolean;
  error: string;
  data: StateZsetData;
  updateScore: {
    loading: boolean;
    error: string;
  };
}
