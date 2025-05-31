<template>
  <div class="diff-root">
    <h1>Differences</h1>
    <section>
      <Editor style="height: calc(100vh - 200px)"
        :diff="true"
      />
    </section>
  </div>
</template>

<script setup>
import args from './helpers/args.js';

const Editor = args.params.components.Editor;
</script>

<style scoped lang="scss">
.diff-root,.section-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
