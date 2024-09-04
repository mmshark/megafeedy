import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";

import { generateClient } from "aws-amplify/data";

export default defineEventHandler(async (input) => {
    Amplify.configure(outputs, {ssr: true});
    const dataClient = generateClient();

    const event = await readBody(input);

    try {
        await client.models.Event.create(event);
    } catch (error) {
        console.error("Error creating event:", error);
    }
});