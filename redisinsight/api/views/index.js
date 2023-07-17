// eslint-disable-next-line import/no-extraneous-dependencies
import Handlebars from 'handlebars';
import template from './cloud_oauth_callback.hbs';
import logoPartial from './partials/logo_partial.hbs';
import errorsPartial from './partials/errors_partial.hbs';
import stylesPartial from './partials/styles_partial.hbs';
import { hbsEq } from '../src/utils/handlebars';

Handlebars.registerHelper('eq', hbsEq);
Handlebars.registerPartial('logo_partial', logoPartial);
Handlebars.registerPartial('errors_partial', errorsPartial);
Handlebars.registerPartial('styles_partial', stylesPartial);

document.body.innerHTML = template({
  error: {
    errorCode: 11008,
  },
});
