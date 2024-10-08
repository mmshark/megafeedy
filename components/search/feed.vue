<template>
    <div :class="styleClass">
        <button 
            v-for="(term, index) in props.terms.slice(0, props.size)"
            :key="term.term" 
            class="feed-item"
            @click.prevent="onClickTerm(term, index)"
        >
            <span class="text" :class="term.decorColor">
                {{ term.term }} 
                <span v-if="props.debug">( I: {{term.events.impressions}} C: {{term.events.clicks}} CTR: {{term.metrics.ctr}} )</span>
            </span>
            <span class="icon"></span>
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    terms: {        
        type: Array,
        required: true
    },
    size: {
        type: Number,
        default: 5
    },
    sort: {
        type: String,
        default: 'random'
    },
    debug: {
        type: Boolean,
        default: true
    }
})

const { session, reset, update } = await useSession()

const styleClasses = [
    { class: 'feed-style-1', percentage: 50 },
    { class: 'feed-style-2', percentage: 50 }
];

let cumulativePercentage = 0;
const randomValue = Math.random() * 100;
const styleClass = styleClasses.find(option => {
    cumulativePercentage += option.percentage;
    return randomValue < cumulativePercentage;
}).class;

onBeforeMount(async () => {
    await reset()
    await update({ "styleClass": styleClass })
})

function resolvePath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
watch(
    () => props.terms,
    async () => {  
        if (props.sort === 'random') {
            props.terms.sort(() => Math.random() - 0.5);
        } else {
            props.terms.sort((a, b) => {
                const aValue = resolvePath(a, props.sort) || 0; 
                const bValue = resolvePath(b, props.sort) || 0;
                return bValue - aValue;
            });
        }
        for (const [index, term] of props.terms.slice(0, props.size).entries()) {
            try {
                const response = await $fetch('/api/event', {  
                    method: 'POST',
                    body: {
                        "session_id": session.value.id,
                        "type": "TERM_IMPRESSION",
                        "term": term.term,
                        "position": index,
                        "style": styleClass
                    }
                });
            } catch (error) {
                console.error("Error sending TERM_IMPRESSION event:", error); 
            }
        }   
    },
    { immediate: true } 
)

const onClickTerm = (term, index) => {
    try {
        const response = $fetch('/api/event', {
            method: 'POST',
            body: {
                "session_id": session.value.id,
                "type": "TERM_CLICK",
                "term": term.term,
                "position": index,
                "style": styleClass
            }
        });
    } catch (error) {
        console.error("Error calling API:", error);
    }
    window.location.href = term.url;
}
</script>

<style scoped>
.feed-style-1, .feed-style-2 {
    @apply w-full;
    @apply gap-[1px];
    @apply flex flex-col flex-nowrap;
}

.feed-style-1 .feed-item, .feed-style-2 .feed-item {
    @apply h-[60px] sm:h-[100px] md:h-[125px] lg:h-[125px];
    @apply p-3 sm:p-4 md:p-5 lg:p-5;
    @apply rounded-[25px]; 
    @apply text-left text-white font-bold text-ellipsis whitespace-nowrap overflow-hidden;
    @apply transition-all duration-300 ease-in-out; 
}

.feed-style-1 .feed-item {
    @apply border-[5px] border-[#214c96];
    @apply bg-[#214c96];
}

.feed-style-1 .feed-item:hover {
    @apply bg-[#036];
    @apply underline;
}

.feed-style-1 .feed-item .text {
    @apply border-l-[7px] p-7 pl-[25px];
    @apply text-sm sm:text-lg md:text-lg lg:text-xl;
}

.feed-style-1 .feed-item:nth-child(4n+1) .text { @apply border-yellow-300; }
.feed-style-1 .feed-item:nth-child(4n+2) .text { @apply border-green-300; }
.feed-style-1 .feed-item:nth-child(4n+3) .text { @apply border-blue-500; }
.feed-style-1 .feed-item:nth-child(4n+4) .text { @apply border-red-400; }

.feed-style-1 .feed-item .icon, .feed-style-2 .feed-item .icon {
    @apply w-6 h-6;
    @apply float-right;
    @apply transition-transform duration-300 ease-in-out;
    @apply bg-[url('https://bidkwd.com/img/call_to_action_arrow.svg')] bg-no-repeat bg-center;
}

.feed-style-2 .feed-item {
    @apply border-[5px] border-[#968621];
    @apply bg-[#214c96];
}

.feed-style-2 .feed-item:hover {
    @apply bg-[#036];
    @apply underline;
}

.feed-style-2 .feed-item .text {
    @apply border-l-[7px] p-7 pl-[25px];
    @apply text-sm sm:text-lg md:text-lg lg:text-xl;
}

.feed-style-2 .feed-item:nth-child(4n+1) .text { @apply border-yellow-300; }
.feed-style-2 .feed-item:nth-child(4n+2) .text { @apply border-green-300; }
.feed-style-2 .feed-item:nth-child(4n+3) .text { @apply border-blue-500; }
.feed-style-2 .feed-item:nth-child(4n+4) .text { @apply border-red-400; }
</style>