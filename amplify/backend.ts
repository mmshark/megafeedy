import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { consolidationFunction } from './functions/consolidation/resource';

const backend = defineBackend({
  data,
  consolidationFunction
});