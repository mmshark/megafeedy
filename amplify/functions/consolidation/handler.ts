import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { env } from '$amplify/env/consolidation';

import { Logger } from "@aws-lambda-powertools/logger";

import { listEvents } from './graphql/queries';


Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
          region: env.AWS_REGION,
          defaultAuthMode: 'identityPool'
        }
      }
    },
    {
      Auth: {
        credentialsProvider: {
          getCredentialsAndIdentityId: async () => ({
            credentials: {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              sessionToken: env.AWS_SESSION_TOKEN,
            },
          }),
          clearCredentialsAndIdentityId: () => {
            /* noop */
          },
        },
      },
    }
  );

const dataClient = generateClient();

const logger = new Logger({
    logLevel: "INFO",
    serviceName: "consolidation",
});

export const handler = async (event: any, context: any) => {
    logger.info("Consolidating events");
    logger.info(JSON.stringify(env));
    const filter = {
        createdAt: {
            between: ["2024-09-01T00:00:00Z", "2024-09-31T23:59:59Z"]
        }
    };

    let response = await dataClient.graphql({
        query: listEvents,
        variables: { filter }
    });
    logger.info("response", JSON.stringify(response));
};