import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { consolidationFunction } from '../functions/consolidation/resource';

const schema = a.schema({
    Event: a.model({
        session_id: a.string().required(),
        type: a.enum(["TERM_IMPRESSION", "TERM_CLICK"]),
        term: a.string().required(),
        position: a.integer().required(),
        style: a.string(),
    }).authorization(allow => [allow.publicApiKey()]),
    Term: a.model({
        term: a.string().required(),
        url: a.url().required(),
        impressions: a.integer().default(0),
        clicks: a.integer().default(0),
    }).identifier(['term'])
    .authorization(allow => [allow.publicApiKey()]),
    TermConsolidatedByDate: a.model({
        term: a.string().required(),
        date: a.string().required(),
        impressions: a.integer().default(0),
        clicks: a.integer().default(0),
    }).identifier(['term', 'date'])
    .authorization(allow => [allow.publicApiKey()]),
}).authorization(allow => [
    allow.resource(consolidationFunction)
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
})