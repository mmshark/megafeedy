import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Term: a
  .model({
    term: a.string().required(),
    url: a.string().required(),
    impressions: a.integer().required(),
    clicks: a.integer().required(),
  })
    .authorization(allow => [allow.publicApiKey()]),
  Event: a
    .model({
      session_id: a.string().required(),
      type: a.enum(["TERM_IMPRESSION", "TERM_CLICK"]),
      term: a.string().required(),
      position: a.integer().required(),
      style: a.string(),
    })
    .authorization(allow => [allow.publicApiKey()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});