import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

// validating environment variables
const schema = joi
  .object({
    NODE_ENV: joi
    .string()
    .valid('development', 'production')
    .required(),
    DBUSER: joi.string().required(),
    DBPASSWORD: joi.string().required(),
    DBPORT: joi.number().port().required().default(5432),
    DATABASE: joi.string().required(),
    HOST: joi.string().required(),
    EMAIL: joi.string().required(),
    EMAIL_PASSWORD: joi.string().required(),
    PORT: joi.string().required(),
    SECRET: joi.string().required(),
    DATABASE_LOGGING: joi
      .boolean()
      .truthy('TRUE')
      .truthy('true')
      .falsy('FALSE')
      .falsy('false')
      .default(false),
  })
  .unknown()
  .required();

const { error, value: envVars } = schema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  isDevelopment:
    envVars.NODE_ENV === 'development'
      ? true
      : false,
  isLocahost: envVars.NODE_ENV === 'development' ? true : false,
  NODE_ENV: envVars.NODE_ENV,
  email: envVars.EMAIL,
  emailPassword: envVars.EMAIL_PASSWORD,
  port: envVars.PORT,
  secret: envVars.SECRET,
  db: {
    port: envVars.DBPORT,
    host: envVars.HOST,
    username: envVars.DBUSER,
    password: envVars.DBPASSWORD,
    name: envVars.DATABASE,
    logging: envVars.DATABASE_LOGGING,
  },
};
