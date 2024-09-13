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
        const [termsResponse, termsByDateResponse] = await Promise.all([
            dataClient.models.Term.list(),
            dataClient.models.TermConsolidatedByDate.list({
                filter: {
                    date: {
                        between: [fromDate, toDate]
                    }
                }
            })
        ]);

        const termsMap = termsResponse.data.reduce((acc, term) => {
            acc[term.term] = {
                ...term,
                events: { impressions: 0, clicks: 0 },
                metrics: {}
            };
            return acc;
        }, {});

        for (const { term, impressions = 0, clicks = 0 } of termsByDateResponse.data) {
            if (!termsMap[term]) {
                termsMap[term] = {
                    term,
                    events: { impressions: 0, clicks: 0 },
                    metrics: {}
                };
            }
            termsMap[term].events.impressions += impressions;
            termsMap[term].events.clicks += clicks;
        }

        for (const termData of Object.values(termsMap)) {
            const { impressions, clicks } = termData.events;
            termData.metrics.ctr = impressions > 0 ? parseFloat((clicks / impressions).toFixed(3)) : 0;
        }

        return Object.values(termsMap);
    } catch (error) {
        return { error: error.message }; 
    }
});