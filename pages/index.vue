<template>
    <div>
        <SearchFeed :terms="terms" :size="route.query.size" :sort="route.query.sort" :debug="route.query.debug" />
    </div>
</template>

<script setup>

const route = useRoute();
const terms = ref([]);

onMounted(async () => {
    try {
        const response = await $fetch('/api/terms');
        terms.value = response.map(term => ({
            ...term,
            url: term.url.replace("{term}", encodeURIComponent(term.term).replace(/%20/g, '+')) || ""
        }));
    } catch (error) {
        console.error("Error fetching terms:", error);
    }
});

</script>