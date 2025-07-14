<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { type FormInst, type FormRules, createDiscreteApi, darkTheme, lightTheme, NCard, NForm, NFormItem, NButton, NInput, NButtonGroup, NIcon, NDatePicker, NRow, NCol, NGrid, NFormItemGi, NList, NListItem } from 'naive-ui'

import { LinkOutline, CloseCircleOutline, InformationCircleOutline, AnalyticsOutline } from '@vicons/ionicons5'

import type { ConfigProviderProps } from 'naive-ui'
import axios from 'axios'
import { useSettingsStore, type ILinkEntity, type ILinkStats } from '@/stores/settings'

const { linkState, formState } = useSettingsStore()

const themeRef = ref<'light' | 'dark'>('dark')
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
  theme: themeRef.value === 'light' ? lightTheme : darkTheme
}))

const { message, notification, dialog, loadingBar, modal } = createDiscreteApi(
  ['message', 'dialog', 'notification', 'loadingBar', 'modal'],
  {
    configProviderProps: configProviderPropsRef
  }
)

const formRef = ref<FormInst | null>(null)

const formValue = ref<{ url: string, alias: string }>({ url: '', alias: '' })

const formTimestamp = ref(null)

const infoRef = ref<Pick<ILinkStats, 'clickCount' | 'originalUrl' | 'createdAt'>>()

const analyticsRef = ref<Pick<ILinkStats, 'clickCount' | 'lastFiveIPs' | 'createdAt'>>()

const rules: FormRules = {
  url: {
    required: true,
    min: 6,
    pattern: '(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})',
    // pattern: /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g,
    message: 'URL is incorrect',
    trigger: ['input']
  },
  alias: {
    required: false,
    min: 8,
    max: 20,
    message: 'Min 8 symbols and Max 20',
    trigger: ['input']
  }
}

function splitUrl(url: string): string {
  const path = url.split('/').splice(2);
  return path[1];
}

function handleValidateAndSubmitClick(e: MouseEvent, action: 'trim' | 'info' | 'analytics' | 'delete', params?: Pick<ILinkEntity, 'shortUrl'>) {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (errors) {
      console.log(errors)
      message.error('Invalid link')
      return
    }

    // message.success('Valid')
    if (action === 'trim') {
      try {
        const { data } = await axios.post('http://localhost:3000/shorten', {
          originalUrl: formValue.value.url,
          expiresAt: formTimestamp.value ?? undefined,
          alias: formValue.value.alias ? formValue.value.alias : undefined
        })
        formState.state = 'initial'
        linkState.entity = { shortUrl: data } as ILinkEntity
        // shortUrl.value = data
        console.log(data)
        message.success('Link Created')
      } catch (error) {
        console.error(error);
      }
    } else if (action === 'info' && params) {
      try {
        const { data } = await axios.get(`http://localhost:3000/info/${params.shortUrl}`)
        if (data) {
          formState.state = 'info'
          infoRef.value = data
          console.log(data, linkState.stats, formState.state)
        }
      } catch (error) {
        console.error(error);
      }
    } else if (action === 'analytics' && params) {
      try {
        const { data, status } = await axios.get(`http://localhost:3000/analytics/${params.shortUrl}`)
        console.log(status);
        formState.state = 'analytics'
        analyticsRef.value = data
      } catch (error) {
        console.error(error);
      }
    } else if (action === 'delete' && params) {
      try {
        const { status } = await axios.delete(`http://localhost:3000/delete/${params.shortUrl}`)
        console.log(status);
        formState.state = 'initial'
        formValue.value.url = ''
        message.success('Link Deleted')
      } catch (error) {
        console.error(error);
      }
    }

  })
}

</script>

<template>

  <section>

    <n-form ref="formRef" inline :label-width="80" :model="formValue" :rules="rules" size="large">

      <n-grid :span="24" :x-gap="12">

        <n-form-item-gi :span="12" path="url" @keydown.enter.prevent>
          <n-input v-model:value="formValue.url" name="url" type="text" placeholder="Insert URL" clearable />
        </n-form-item-gi>

        <n-form-item-gi :span="12">
          <n-button-group>
            <n-button type="primary" @click="(e) => handleValidateAndSubmitClick(e, 'trim')">
              <template #icon>
                <n-icon>
                  <LinkOutline />
                </n-icon>
              </template>
              Trim
            </n-button>
            <n-button type="info"
              @click="(e) => handleValidateAndSubmitClick(e, 'info', { shortUrl: formValue.alias || splitUrl(formValue.url) })">
              <template #icon>
                <n-icon>
                  <InformationCircleOutline />
                </n-icon>
              </template>
              Info
            </n-button>
            <n-button type="warning"
              @click="(e) => handleValidateAndSubmitClick(e, 'analytics', { shortUrl: formValue.alias || splitUrl(formValue.url) })">
              <template #icon>
                <n-icon>
                  <AnalyticsOutline />
                </n-icon>
              </template>
              Analytics
            </n-button>
            <n-button type="error" round
              @click="(e) => handleValidateAndSubmitClick(e, 'delete', { shortUrl: splitUrl(formValue.url) })">
              <template #icon>
                <n-icon>
                  <CloseCircleOutline />
                </n-icon>
              </template>
              Delete
            </n-button>
          </n-button-group>
        </n-form-item-gi>

        <template v-if="formState.state === 'initial'">

          <template v-if="!linkState.entity || !linkState.entity.shortUrl">
            <n-form-item-gi :span="12" path="alias" @keydown.enter.prevent>
              <n-input v-model:value="formValue.alias" name="alias" type="text" clearable
                placeholder="Set link alias (optional)" />
            </n-form-item-gi>

            <n-form-item-gi :span="12">
              <n-date-picker v-model:value="formTimestamp" type="datetime" clearable
                placeholder="Set link expiration (optional)" />
            </n-form-item-gi>
          </template>

          <n-form-item-gi :span="24" v-if="linkState.entity && linkState.entity.shortUrl">
            <n-button text tag="a" :href="`http://localhost:3000/${linkState.entity.shortUrl}`" target="_blank"
              type="primary">
              http://localhost:3000/{{ linkState.entity.shortUrl }}
            </n-button>
          </n-form-item-gi>

        </template>

        <template v-else-if="formState.state === 'info' && infoRef">
          <n-form-item-gi :span="24">

            <n-list bordered>
              <n-list-item>
                originalUrl: {{ infoRef.originalUrl }}
              </n-list-item>
              <n-list-item>
                createdAt: {{ infoRef.createdAt }}
              </n-list-item>
              <n-list-item>
                clickCount: {{ infoRef.clickCount }}
              </n-list-item>
            </n-list>

          </n-form-item-gi>
        </template>

        <template v-else-if="formState.state === 'analytics' && analyticsRef">
          <n-form-item-gi :span="24">
            <n-list bordered>
              <template #header>
                visits: {{ analyticsRef.clickCount ?? 0 }}
              </template>
              <template v-for="(visit, index) in analyticsRef.lastFiveIPs" :key="index">
                <n-list-item>
                  {{ visit.ip }} | {{ visit.createdAt }}
                </n-list-item>
              </template>
            </n-list>
          </n-form-item-gi>
        </template>

      </n-grid>
    </n-form>

  </section>

</template>
