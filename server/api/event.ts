import { generateClient } from "aws-amplify/data";

export default defineEventHandler(async (input) => {
    const event = await readBody(input);
    console.log(event);

    const client = generateClient();

    try {
        await client.models.Event.create(event);
    } catch (error) {
        console.error("Error creating event:", error);
    }
});