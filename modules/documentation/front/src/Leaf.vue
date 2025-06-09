<template>
  <div class="leaf-root" :class="{active: active}" @click.stop="$emit('select')">
    <input v-model="node.label" v-if="edit" @change="emitEdit()" @blur="emitEdit()" @click.stop/>
    <div v-else>{{ node.label }}</div>
    <div class="actions" v-if="!edit">
      <i class="fas fa-edit" @click.stop="edit = true"></i>
      <!-- <i class="fas fa-plus" @click="addChild(node)"></i> -->
      <i class="fas fa-trash" @click.stop="$emit('deleteDoc', node)"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import axios from '../../../../fronts/app/src/helpers/axios';
import Service from '../../../../fronts/app/src/models/service'

const edit = ref(false)
const props = defineProps({
  node: {
    /**@type {import('primevue/treenode').TreeNode} */
    default: {key: ''}
  },
  service: {
    type: Service,
  },
  tree: {
    /**@type {import('primevue/treenode').TreeNode[]} */
    default: []
  },
  active: { 
    type: Boolean,
    default: false
  } 
})

const emit = defineEmits(['updateDoc'])

async function emitEdit() {
  edit.value = false
  emit('updateDoc', props.node)
}
async function addChild(node) {
  if(!node.children) node.children = []
  await axios.post('/documentations/services/') 
}

function walkthrough(children, cb) {
  children.forEach(node => {
    cb({node, parent: children})
    if(node.children) walkthrough(node.children, cb)
  });

}
function deleteChild(_node) {
  
}
</script>

<style lang="scss" scoped>

.leaf-root {
  transition: 300ms;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  &:hover {
    background-color: var(--system-primary100);
    .actions {
      opacity: 1;
      right: 0;
      cursor: pointer;
    }
  }
  &.active {
    background-color: var(--p-tree-node-selected-background);
    color: var(--p-tree-node-selected-color);
  }
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 3px 10px;
  input {
    width: 100%
  }
  .actions {
    position: absolute;
    opacity: 0;
    transition: 300ms;
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 10px;
    gap: 10px;
    background-color: var(--system-primary500);
    color: white;
    right: -100%;
  }
}
</style>
