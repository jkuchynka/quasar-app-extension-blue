<template>
  <div class="demo-import q-table__card">
    <blue-import
      title="Demo Import"
      import-template-url="importTemplateUrl"
      import-url="http://localhost:8000/api/lenders/import/new"
      :on-uploaded="onUploaded"
    >
      <!--<template v-slot:content>
        <div v-if="!importResult">
          Upload a CSV or XLS file to import new records. The first row should be the header row, containing field names. You can download an import template below to get started.
        </div>
        <div v-else>
          Success! Results:
        </div>
      </template>-->
    </blue-import>
  </div>
</template>
<script>

export default {
  data: () => ({
    importResult: null
  }),
  methods: {
    importTemplateUrl (type) {
      const urlBase = 'http://localhost:8000/api/lenders/import/template'
      if (type === 'xls') {
        return `${urlBase}?type=xls`
      } else if (type === 'csv') {
        return `${urlBase}?type=csv`
      }
    },
    onUploaded (info) {
      console.log('on submit', info)
      this.importResult = info
    },
    onFailed (info) {
      console.log('on failed', info)
    }
  }
}
</script>
<style lang="scss">

</style>
