import { Joi } from '../../helpers/test';

export const recommendationSchema = Joi.object({
  read: Joi.boolean().required(),
  id: Joi.string().required(),
  name: Joi.string().required(),
  disabled: Joi.boolean(),
  vote: Joi.string().valid('very useful', 'useful', 'not useful').allow(null),
});

export const recommendationsSchema = Joi.object({
  recommendations: Joi.array().items(recommendationSchema),
  totalUnread: Joi.number().required(),
});
