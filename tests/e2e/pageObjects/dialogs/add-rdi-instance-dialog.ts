import { Selector, t } from 'testcafe';

export class AddRdiInstanceDialog {
    //INPUTS
    rdiAliasInput = Selector('[data-testid=connection-form-name-input]');
    urlInput = Selector('[data-testid=connection-form-url-input]');
    usernameInput = Selector('[data-testid=connection-form-username-input]');
    passwordInput = Selector('[data-testid=connection-form-password-input]');

    //BUTTONS
    addInstanceButton = Selector('[data-testid=connection-form-add-button]');
    cancelInstanceBtn = Selector('[data-testid=connection-form-cancel-button]');

    connectToRdiForm = Selector('[data-testid=connection-form]');
    // ICONS
    urlInputInfoIcon = Selector('[data-testid=connection-form-url-input]').parent('div').parent('div').find('svg');
    usernameInputInfoIcon = Selector('[data-testid=connection-form-username-input]').parent('div').parent('div').find('svg');
    passwordInputInfoIcon = Selector('[data-testid=connection-form-password-input]').parent('div').parent('div').find('svg');
}

/**
 * String key parameters
 * @param alias The name of the rdi
 * @param url The url for rdi
 * @param version The version for rdi
 * @param lastConnection The last Connection to the rdi instance
 * @param username The username for rdi
 * @param password The password for rdi
 */
export type RdiInstance = {
    alias: string,
    url: string,
    version?: string,
    lastConnection?: string,
    username?: string,
    password?: string
};
