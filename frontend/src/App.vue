<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NFlex, NH1, NButtonGroup, NButton, NIcon } from 'naive-ui'
</script>

<template>

  <header>
    <n-flex justify="center">
      <n-h1>URL Trimmer</n-h1>
    </n-flex>
  </header>

  <main>
    <n-flex justify="center">
      <RouterView />
    </n-flex>
  </main>

  <footer>
    <n-flex justify="center">
    </n-flex>
  </footer>

</template>

<style lang="scss">
body>div {
  margin-top: 10vh;
  display: grid;
  grid-template-columns: 1fr;
}
</style>
