import { ClientFunction } from 'testcafe';

export const goBackHistory = ClientFunction(() => window.history.back());
