import { Selector, t } from 'testcafe';

export class AddRdiInstance {
    //INPUTS
    rdiAliasInput = Selector('[data-testid=connection-form-name-input]');
    urlInput = Selector('[data-testid=connection-form-url-input]');
    usernameInput = Selector('[data-testid=connection-form-username-input]');
    passwordInput = Selector('[data-testid=connection-form-password-input]');

    //BUTTONS
    addInstanceButton = Selector('[data-testid=connection-form-add-button]');
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
