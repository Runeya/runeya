<template>
  <Form
    :key="formKey"
    @submit="handleSubmit"
    :resolver="orgResolver"
    :initialValues="formInitialValues"
  >
    <template v-slot="$form">
      <div class="p-field">
        <label for="orgName">{{ $t('dashboard.orgSettings.nameLabel') }}</label>
        <InputText
          name="name"
          :placeholder="$t('dashboard.orgSettings.nameLabel')"
          class="w-full"
        />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <div class="p-field">
        <label for="orgSlug">
          <span>
            {{ $t('dashboard.orgSettings.slugLabel') }}
            <div class="text-xs text-red-600 font-semibold">({{ $t('dashboard.orgSettings.slugDefinitive') || 'Définitif, non modifiable' }})</div>
          </span>
        </label>
        <div class="flex items-center">
          <InputText value="@" disabled class="w-12"/>
          <InputText
            name="slug"
            :placeholder="$t('dashboard.orgSettings.slugLabel')"
            class="w-full"
            :readonly="props.isEdit"
            :disabled="props.isEdit"
          />
          <InputText value="/" disabled class="w-12"/>
        </div>
        <Message v-if="$form.slug?.invalid" severity="error" size="small" variant="simple">
          {{ $form.slug.error?.message }}
        </Message>
      </div>
      

      <div class="p-field">
        <label for="language">{{ $t('dashboard.orgSettings.languageLabel') }}</label>
        <Select name="metadata.language"
          :options="countries"
          :model-value="$form.metadata?.language?.value"
          filter
          optionLabel="name"
          option-value="code"
          placeholder="Select a Country"
          class="w-full md:w-56"/>

        <Message v-if="$form.metadata?.language?.invalid" severity="error" size="small" variant="simple">
          {{ $form.metadata?.language?.error?.message }}
        </Message>
      </div>
      
      <!-- <div class="p-field">
        <label for="orgLogo">{{ $t('dashboard.orgSettings.logoLabel') }}</label>
        <InputText
          name="logo"
          :placeholder="$t('dashboard.orgSettings.logoLabel')"
          class="w-full"
        />
        <Message v-if="$form.logo?.invalid" severity="error" size="small" variant="simple">
          {{ $form.logo.error?.message }}
        </Message>
      </div> -->
     

      <div class="dialog-footer">
        <Button
          :label="cancelLabel || $t('dashboard.orgSettings.cancelButton')"
          icon="fas fa-times"
          class="p-button-text"
          type="button"
          @click="() => onCancel && onCancel()"
        />
        <Button
          :label="submitLabel || $t('dashboard.orgSettings.saveButton')"
          icon="fas fa-check"
          :loading="loading"
          type="submit"
        />
      </div>
    </template>
  </Form>
</template>

<script setup>
import { ref, computed, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import * as yup from 'yup';
import useOrganizationStore from '../../stores/organizationStore.js';
import { Select } from 'primevue';
import countriesData from '../../helpers/countries.js';
import { yupResolver } from '@primevue/forms/resolvers/yup';

const organizationStore = useOrganizationStore();

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({ name: '', slug: '', metadata: { language: '' } })
  },
  loading: Boolean,
  submitLabel: String,
  cancelLabel: String,
  onSubmit: Function,
  onCancel: Function,
  isEdit: {
    type: Boolean,
    default: false
  }
});

const { t, locale } = useI18n();

const slugCheckLoading = ref(false);
const currentOrganization = computed(() => organizationStore.currentOrganization.value);


const countries = computed(() => {
  const lang = locale.value === 'fr' ? 'fr' : 'en';
  return countriesData.map(country => ({
    name: country[lang],
    code: country.code
  })).sort((a, b) => a.name.localeCompare(b.name));
});

const orgResolver = yupResolver(
  yup.object().shape({
    name: yup.string().min(3, t('dashboard.createOrg.nameRequired')).required(t('dashboard.createOrg.nameRequired')),
    slug: yup.string()
      .min(3, t('dashboard.createOrg.slugRequired'))
      .required(t('dashboard.createOrg.slugRequired'))
      .matches(/^[a-z0-9-]+$/, t('dashboard.createOrg.slugHelp') || 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets.')
      .test('slug-available', t('dashboard.createOrg.slugTaken'), async function (value) {
        if (!value) return false;
        if (props.isEdit || (props.initialValues && props.initialValues.slug && value !== currentOrganization.value?.slug)) return true;
        slugCheckLoading.value = true;
        try {
          const res = await organizationStore.checkSlug(value);
          return res?.data?.status === true;
        } catch (e) {
          return this.createError({ message: t('dashboard.createOrg.slugTaken') });
        } finally {
          slugCheckLoading.value = false;
        }
      }),
    metadata: yup.object().shape({
      language: yup.string().required(t('dashboard.orgSettings.languageRequired')),
    }),
    logo: yup.string().url(t('dashboard.orgSettings.logoLabel')).nullable()
  })
);

const formInitialValues = computed(() => {
  const lang = locale.value === 'fr' ? 'fr' : 'en';
  const value = props.initialValues ? props.initialValues : { name: '', slug: '', metadata: { language: lang } };
  if (!value.metadata.language) value.metadata.language = lang;
  return value;
});

const formKey = computed(() => formInitialValues.value.name + '-' + formInitialValues.value.slug);

function handleSubmit(event) {
  if (props.onSubmit) {
    const states = { ...event.values };
    const data = props.isEdit ? { ...states, slug: undefined } : states;
    props.onSubmit({ values: data, valid: event.valid });
  }
}

</script>

<style scoped>
.p-field {
  margin-bottom: 20px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style> 