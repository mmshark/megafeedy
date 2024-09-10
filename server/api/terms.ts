import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";

Amplify.configure(outputs);
const dataClient = generateClient();

export default defineEventHandler(async () => {    
    try {
        const { data } = await dataClient.models.Term.list();
        return data;
    } catch (error) {
        return error;
    }
});