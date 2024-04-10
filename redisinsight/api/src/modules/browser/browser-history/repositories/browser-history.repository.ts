import { SessionMetadata } from "src/common/models";
import { BrowserHistory } from "../models/browser-history";

export abstract class BrowserHistoryRepository {
  abstract save(sessionMetadata: SessionMetadata, history: BrowserHistory): Promise<BrowserHistory>;
  abstract cleanupDatabaseHistory(sessionMetadata: SessionMetadata, databaseId: string, mode: string): Promise<void>;
  abstract findById(sessionMetadata: SessionMetadata, id: string): Promise<BrowserHistory>;
  abstract getBrowserHistory(sessionMetadata: SessionMetadata, databaseId: string, mode: string): Promise<BrowserHistory[]>;
  abstract delete(sessionMetadata: SessionMetadata, id: string, databaseId: string): Promise<void>;
}
