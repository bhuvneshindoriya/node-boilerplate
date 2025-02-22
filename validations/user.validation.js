import Joi from 'joi';

export const userValidation = {
  register: {
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/)
    })
  },
  login: {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }
  // ... other validations
}; 