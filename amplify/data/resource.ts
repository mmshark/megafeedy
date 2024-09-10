import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { consolidationFunction } from '../functions/consolidation/resource';

const schema = a.schema({
  Term: a
  .model({
    term: a.string().required(),
    url: a.url().required(),
    impressions: a.integer().default(0),
    clicks: a.integer().default(0),
  }).identifier(['term'])
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
})
  // .authorization(allow => [
  //   allow.resource(consolidationFunction)
  // ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});