// eslint-disable-next-line import/no-extraneous-dependencies
import Handlebars from 'handlebars';
import template from './cloud_oauth_callback/index.hbs';
import logoTemplate from './cloud_oauth_callback/partials/logo.hbs';
import errorsTemplate from './cloud_oauth_callback/partials/errors.hbs';
import stylesTemplate from './cloud_oauth_callback/partials/styles.hbs';
import { hbsEq } from '../src/utils/handlebars';

Handlebars.registerHelper('eq', hbsEq);
Handlebars.registerPartial('logoPartial', logoTemplate);
Handlebars.registerPartial('errorsPartial', errorsTemplate);
Handlebars.registerPartial('stylesPartial', stylesTemplate);

document.body.innerHTML = template({
  errorCode: 11008,
});
