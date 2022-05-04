import { GetStreamEntriesResponse } from 'apiSrc/modules/browser/dto/stream.dto'

export interface StateStream {
  loading: boolean;
  error: string;
  data: GetStreamEntriesResponse;
}
