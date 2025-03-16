export const ToastSelectors: Record<string, string> = {
  toastHeader: '[data-test-subj=euiToastHeader]',
  toastBody: '[class*=euiToastBody]',
  toastSuccess: '[class*=euiToast--success]',
  toastError: '[class*=euiToast--danger]',
  toastCloseButton: '[data-test-subj=toastCloseButton]',
  toastSubmitBtn: 'submit-tooltip-btn',
  toastCancelBtn: 'toast-cancel-btn'
};
