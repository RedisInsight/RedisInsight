import { Joi } from '../../helpers/test';

export const recommendationSchema = Joi.object({
  read: Joi.boolean().required(),
  id: Joi.string().required(),
  databaseId: Joi.string().required(),
  name: Joi.string().required(),
  disabled: Joi.boolean(),
  hide: Joi.boolean(),
  vote: Joi.string().valid('very useful', 'useful', 'not useful').allow(null),
  createdAt: Joi.date().required(),
});

export const recommendationsSchema = Joi.object({
  recommendations: Joi.array().items(recommendationSchema),
  totalUnread: Joi.number().required(),
});
