import { Selector } from 'testcafe';

export class Toast {
    toastHeader = Selector('[data-test-subj=euiToastHeader]');
    toastBody = Selector('[class*=euiToastBody]');
    toastSuccess = Selector('[class*=euiToast--success]');
    toastError = Selector('[class*=euiToast--danger]');
    toastCloseButton = Selector('[data-test-subj=toastCloseButton]');
    toastSubmitBtn = Selector('[data-testid=submit-tooltip-btn]');
    toastCancelBtn = Selector('[data-testid=toast-cancel-btn]');
}
