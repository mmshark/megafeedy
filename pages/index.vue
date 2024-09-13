<template>
    <div>
    <SearchFeed :terms="terms" />
    </div>
</template>

<script setup>
const terms = ref([]);

onMounted(async () => {
    try {
        const response = await $fetch('/api/terms');
        terms.value = response.map(term => ({
            ...term,
            url: term.url
                .replace("{term}", encodeURIComponent(term.term).replace(/%20/g, '+'))
        }));
    } catch (error) {
        console.error("Error fetching terms:", error);
    }
});

</script>