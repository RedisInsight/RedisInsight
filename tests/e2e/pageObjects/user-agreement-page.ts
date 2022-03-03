import { t, Selector } from 'testcafe';

export class UserAgreementPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

  userAgreementsPopup: Selector
  submitButton: Selector
  switchOptionEula: Selector
  switchOptionEncryption: Selector
  pluginSectionWithText: Selector

  constructor() {
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      // COMPONENTS
      this.userAgreementsPopup = Selector('[data-testid=consents-settings-popup]', {timeout: 1000});
      //BUTTONS
      this.submitButton = Selector('[data-testid=btn-submit]');
      this.switchOptionEula = Selector('[data-testid=switch-option-eula]');
      this.switchOptionEncryption = Selector('[data-testid=switch-option-encryption]');
      this.pluginSectionWithText = Selector('[data-testid=plugin-section]')
  }

  //Accept RedisInsight License Terms
  async acceptLicenseTerms():Promise<void> {
      if (await this.switchOptionEula.exists) {
          await t.click(this.switchOptionEula);
          await t.click(this.switchOptionEncryption);
          await t.click(this.submitButton);
      }
  }
}
