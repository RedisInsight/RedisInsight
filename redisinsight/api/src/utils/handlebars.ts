import Handlebars from 'hbs'

export const hbsEq = (arg1: any, arg2: any, options: Handlebars.HelperOptions) =>
  (arg1 === arg2) ? options.fn(this) : options.inverse(this);
