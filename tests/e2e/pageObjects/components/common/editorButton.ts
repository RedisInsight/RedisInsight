import { Selector } from 'testcafe';

export class EditorButton {
    cancelBtn = Selector('[data-testid=cancel-btn]');
    applyBtn = Selector('[data-testid=apply-btn]');
}
