<template>
  <div class="organization-switcher">
    <div class="switcher-container">
      <Select
        v-model="selectedOrganization"
        :options="organizations"
        optionLabel="name"
        placeholder="Select Organization"
        class="w-full"
        @change="handleOrganizationChange"
      >
        <template #value="slotProps">
          <div class="organization-option" v-if="slotProps.value">
            <Tag :value="slotProps.value.name?.substring(0, 1)" severity="primary" class="mr-2" />
            <div class="org-name">{{ slotProps.value.name }}</div>
          </div>
          <span v-else>
            Select Organization
          </span>
        </template>
        <template #option="slotProps">
          <div class="organization-option">
            <div class="org-name">{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watchEffect } from 'vue';
import useOrganizationStore from '../../stores/organizationStore';
import type { Organization } from '../../types/organization';
import Select from 'primevue/select';
import { useRoute, useRouter } from 'vue-router';
import { Tag } from 'primevue';

export default defineComponent({
  name: 'OrganizationSwitcher',
  components: {
    Select,
    Tag
  },
  setup() {
    const organizationStore = useOrganizationStore();
    const selectedOrganization = ref<Organization | null>(null);
    const route = useRoute();
    const router = useRouter();

    // Synchronise selectedOrganization avec l'URL au montage
    onMounted(async () => {
      const orgId = route.params.orgId as string;
      if (orgId && organizationStore.organizations.value.length > 0) {
        const found = organizationStore.organizations.value.find(org => org.id === orgId);
        if (found) {
          await organizationStore.setCurrentOrganization(found);
          selectedOrganization.value = found;
        } else {
          selectedOrganization.value = organizationStore.currentOrganization.value || organizationStore.organizations.value[0];
        }
      } else if (organizationStore.organizations.value.length > 0) {
        selectedOrganization.value = organizationStore.currentOrganization.value || organizationStore.organizations.value[0];
      }
    });

    watchEffect(() => {
      selectedOrganization.value = organizationStore.currentOrganization.value;
    });

    const organizations = computed(() => organizationStore.organizations.value);

    const getOrganizationInitials = (name: string) => {
      if (!name) return '';
      return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    const handleOrganizationChange = async ({value}) => {
      await organizationStore.setCurrentOrganization(value);
      if (selectedOrganization.value) {
        const newOrgId = value.id;
        const segments = route.path.split('/');
        segments[3] = newOrgId;
        const newPath = segments.join('/');
        router.push(newPath);
      }
    };

    return {
      selectedOrganization,
      organizations,
      getOrganizationInitials,
      handleOrganizationChange
    };
  }
});
</script>

<style lang="scss" scoped>
.organization-switcher {
  margin-bottom: 10px;
}

.switcher-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.organization-option {
  display: flex;
  align-items: center;
}


.org-name {
  font-weight: 500;
}
</style> 