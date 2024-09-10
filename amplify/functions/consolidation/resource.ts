import { defineFunction } from '@aws-amplify/backend';

export const consolidationFunction = defineFunction({
    name: 'consolidation',
    entry: './handler.ts',
    runtime: 20,
    timeoutSeconds: 30,
    memoryMB: 256,
    schedule: "every 5m"
});