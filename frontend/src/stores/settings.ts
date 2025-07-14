import { reactive } from 'vue'
import { defineStore } from 'pinia'

export interface IFormState {
  state: 'initial' | 'info' | 'analytics'
}

export interface ILinkEntity {
  originalUrl: string
  shortUrl?: string
  alias?: string
  expiresAt?: Date
  createdAt?: Date
  deleted?: boolean
}

export interface ILinkStats {
  clickCount: number
  createdAt: Date
  originalUrl: string
  lastFiveIPs?: { ip: string; createdAt: string }[]
}

export interface ILinkState {
  entity?: ILinkEntity
  stats?: ILinkStats
}

interface ISettingsStore {
  formState: IFormState
  linkState: ILinkState
}

export const useSettingsStore = defineStore('settings', {
  state: (): ISettingsStore => ({
    formState: { state: 'initial' },
    linkState: reactive({
      entity: {
        originalUrl: '',
      },
      stats: undefined,
    }),
  }),
})
