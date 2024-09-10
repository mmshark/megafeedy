import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";

Amplify.configure(outputs);
const dataClient = generateClient();

export default defineEventHandler(async (input) => {
    const event = await readBody(input);
    
    try {
        const { data } = await dataClient.models.Event.create(event);
        return data;
    } catch (error) {
        return error;
    }
});