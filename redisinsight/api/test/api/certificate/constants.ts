import { Joi } from '../../helpers/test';

export const caCertSchema = Joi.object().keys({
  id: Joi.string().required(),
  name: Joi.string().required(),
  certificate: Joi.string(),
});

export const clientCertSchema = Joi.object().keys({
  id: Joi.string().required(),
  name: Joi.string().required(),
  certificate: Joi.string(),
  key: Joi.string(),
});
