<template>
  <div>
    <h1>Test</h1>
    <ul>
      <li v-for="event in events" :key="event.id">{{ event }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { generateClient } from "aws-amplify/data";

const client = generateClient();
const events = ref([]);

onMounted(async () => {
  const { data } = await client.models.Event.list();
  events.value = data;
});
</script>