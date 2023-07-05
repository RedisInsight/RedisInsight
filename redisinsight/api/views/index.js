// eslint-disable-next-line import/no-extraneous-dependencies
import Handlebars from 'handlebars';
import template from './cloud_oauth_callback.hbs';
import { hbsEq } from '../src/utils/handlebars';

Handlebars.registerHelper('eq', hbsEq);

document.body.innerHTML = template({
  errorCode: 11005,
});
