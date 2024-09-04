import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";

import { generateClient } from "aws-amplify/data";

export default defineEventHandler(async () => {
    Amplify.configure(outputs, {ssr: true});
    const dataClient = generateClient();
    
    try {
        const terms = await dataClient.models.Term.list();
        return terms.data;
    } catch (error) {
        console.error("Error fetching terms:", error);
        return { error: "Failed to fetch terms" };
    }
});