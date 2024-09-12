import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";

Amplify.configure(outputs);
const dataClient = generateClient();

export default defineEventHandler(async (event) => {    
    const query = getQuery(event);

    const fromDate = query.fromDate || "1900-01-01";
    const toDate = query.toDate || "2100-01-01";
    
    try {
        const terms = await dataClient.models.Term.list();

        const termsMap = terms.data.reduce((acc, term) => {
            acc[term.term] = term;
            acc[term.term].events = {}
            acc[term.term].metrics = {}
            return acc;
        }, {});

        const termsByDate = await dataClient.models.TermConsolidatedByDate.list({
            filter: {
                date: {
                    between: [fromDate, toDate]
                }
            }
        });

        const termsTotalMap = termsByDate.data.reduce((acc, curr) => {
            const { term, impressions = 0, clicks = 0 } = curr;
            if (!acc[term]) {
                acc[term] = { 
                    term,
                    events: {
                        impressions: 0, 
                        clicks: 0 
                    },
                    metrics: {}
                };
            }
            acc[term].events.impressions += impressions;
            acc[term].events.clicks += clicks;
            return acc;
        }, {});

        for (const term in termsTotalMap) {
            const { events } = termsTotalMap[term];
            termsMap[term].events = events;
            termsMap[term].metrics.ctr = events.impressions > 0 ? parseFloat((events.clicks / events.impressions).toFixed(3)) : 0;
        }

        const termsTotal = Object.values(termsMap);

        return termsTotal;
    } catch (error) {
        return { error: error.message }; 
    }
});