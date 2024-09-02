import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";

export default defineNuxtPlugin({
  name: "AmplifyAPIs",
  enforce: "pre",
  setup() {
    Amplify.configure(outputs);
  },
});