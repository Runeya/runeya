<template>
    <component :is="'runeya-' + component" class="dynamic-component"></component>
    <!-- <{{ component }}/> -->
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const component = ref();
const urlcss = ref();
watchEffect(() => {
  component.value = router.currentRoute.value.params.plugin;
});
function moveStyles(shadowDOM) {
  observeHeadForStyles(shadowDOM)
  const styles = document.querySelectorAll('head > style[type="text/css"]')
  styles.forEach((styleEl) => {
      const clonedStyleEl = styleEl.cloneNode(true)
      shadowDOM.prepend(clonedStyleEl)
  })
}

function observeHeadForStyles(shadowDOM) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement) {
          const clonedStyleEl = node.cloneNode(true)
          shadowDOM.appendChild(clonedStyleEl)
        }
      })
    })
  })

  observer.observe(document.head, { childList: true, subtree: false })
}
const tryAttachCSS = () => {
  const el = document.querySelector(`runeya-${component.value}`)?.shadowRoot
  if (el) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `http://localhost:5469/plugins/${component.value}/0.0.1/index.css`
    el.appendChild(link)
    moveStyles(el)
  } else {
    setTimeout(tryAttachCSS)
  }
}
async function loadScript() {
  const url = `http://localhost:5469/plugins/${component.value}/0.0.1/index.umd.js`
  await import(url)
  tryAttachCSS()
}
watchEffect(() => {
  if (component.value) {
    loadScript()
  }
})
onMounted(() => {
  console.log('DynamicComponent mounted')
  loadScript()
})
</script>

<style lang="scss" scoped>
.dynamic-component{
  width: 100%;
}
</style>
