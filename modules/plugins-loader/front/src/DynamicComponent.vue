<template>
  <div :style="{flexGrow: 1}">
    <component :is="componentName" class="dynamic-component" ></component>
    <component :is="route.params.plugin" class="dynamic-component" ></component>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  context: {
    type: String,
    default: '',
  },
});

const componentName = computed(() => {
  if(props.context) {
    return route.params.plugin + '-' + props.context;
  }
  return route.params.plugin;
});
</script>

<style lang="scss" scoped>
.dynamic-component{
  width: 100%;
}
</style>
