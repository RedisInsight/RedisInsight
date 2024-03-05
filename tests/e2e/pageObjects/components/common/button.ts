import { Selector } from 'testcafe';

export class Button {
    cancelBtn = Selector('[data-testid=cancel-btn]');
    applyBtn = Selector('[data-testid=apply-btn]');
}
