import { Selector } from 'testcafe';

export class Toast {
    toastHeader = Selector('[data-test-subj=euiToastHeader]', { timeout: 30000 });
    toastBody = Selector('[class*=euiToastBody]');
    toastSuccess = Selector('[class*=euiToast--success]');
    toastError = Selector('[class*=euiToast--danger]', { timeout: 30000 });
    toastCloseButton = Selector('[data-test-subj=toastCloseButton]');
    toastSubmitBtn = Selector('[data-testid=submit-tooltip-btn]');
    toastCancelBtn = Selector('[data-testid=toast-cancel-btn]');
}
