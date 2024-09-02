  import { generateClient } from "aws-amplify/data";
  import outputs from "../amplify_outputs.json";
  import type { Schema } from "@/amplify/data/resource";
  import { Amplify } from "aws-amplify";
  
  if (process.client) {
    Amplify.configure(outputs);
  }
  
  // generate your data client using the Schema from your backend
  const client = generateClient<Schema>();
  
  export default defineNuxtPlugin({
    name: "AmplifyAPIs",
    enforce: "pre",
    setup() {
      return {
        client, // Return the client to make it available in the context
      };
    },
  });