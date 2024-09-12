import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { env } from '$amplify/env/consolidation';
import { Logger } from "@aws-lambda-powertools/logger";
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import { type Event } from './graphql/API';

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

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "consolidation",
});

const dateDay = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0'); 
  return `${year}-${month}-${day}`;
};

interface GroupedEvents {
  [date: string]: {
    [term: string]: {
      [type: string]: Event[];
    };
  };
}

const groupEventsByDateTermType = (items: Event[]): GroupedEvents => {
  return items.reduce((acc: GroupedEvents, event: Event) => {
    if (typeof event.term === 'string' && typeof event.type === 'string' && typeof event.createdAt === 'string') {
      const date = dateDay(event.createdAt);
      const term = event.term;
      const type = event.type;

      if (!acc[date]) {
        acc[date] = {};
      }

      if (!acc[date][term]) {
        acc[date][term] = {};
      }

      if (!acc[date][term][type]) {   
        acc[date][term][type] = [];
      }

      acc[date][term][type].push(event);
    }
    return acc;
  }, {} as GroupedEvents);
};

const dataClient = generateClient();

export const handler = async (event: any, context: any) => {
  try {
    const { data } = await dataClient.graphql({
      query: queries.listEvents,
    });

    const terms = data.listEvents.items;
    const groupedTerms = groupEventsByDateTermType(terms);

    for (const date in groupedTerms) {
      for (const term in groupedTerms[date]) {
        const eventCountsByType: { [type: string]: number } = {};
        for (const type in groupedTerms[date][term]) {
          eventCountsByType[type] = groupedTerms[date][term][type].length;
        }

        const input = {
          term: term,
          date: date,
          impressions: eventCountsByType['TERM_IMPRESSION'] || 0,
          clicks: eventCountsByType['TERM_CLICK'] || 0,
        };

        try {
            const existingItem = await dataClient.graphql({
                query: queries.getTermConsolidatedByDate,
                variables: { term: term, date: date },
            });
              
            const item = {
                term: term,
                date: date,
                impressions: eventCountsByType['TERM_IMPRESSION'] || 0,
                clicks: eventCountsByType['TERM_CLICK'] || 0,
            }

            if (existingItem.data.getTermConsolidatedByDate) {
                await dataClient.graphql({
                  query: mutations.updateTermConsolidatedByDate,
                  variables: { input: item },
                });
            } else {
                await dataClient.graphql({
                  query: mutations.createTermConsolidatedByDate,
                  variables: { input: item },
                });
            }
        } catch (err) {
          logger.error("Error updating term consolidated by date", { error: err, input: input });
        }
      }
    }
  } catch (err) {
    logger.error("Error fetching list of events", { error: err });
  }
};