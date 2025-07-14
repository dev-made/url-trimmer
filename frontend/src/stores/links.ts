import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ILink {
  originalUrl: string
  shortUrl: string
  alias?: string
  expiresAt?: Date
  createdAt?: Date
}

export const useLinksStore = defineStore('links', () => {
  const linksState = ref<ILink>()

  function setLinksState(state: ILink) {
    linksState.value = state
  }

  return { linksState, setLinksState }
})
