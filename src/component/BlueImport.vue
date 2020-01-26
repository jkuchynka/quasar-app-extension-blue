<template>
  <div class="blue-import">
    <div class="title">{{ title }}</div>
    <div class="row">
      <div class="col first-col">
        <blue-form
          v-model="formData"
          :fields="__fields"
          :actions="actions"
          :settings="settings"
        />
      </div>

      <div class="col second-col">
        <div class="content">
          <slot name="content">
            <div v-if="!importResult">Upload a CSV or XLS file to import new records. The first row should be the header row, containing field names. You can download an import template below to get started.</div>
            <div v-else>
              <div v-if="importSuccess">
                <div>Import finished!</div>
                <div><strong>Results</strong></div>
                <div><strong>Created: </strong>{{ importResult.totals.created }}</div>
              </div>
              <div v-else>
                <div>Import failed</div>
                <div><strong>Message: </strong>{{ importResult.message }}</div>
              </div>
            </div>
          </slot>
        </div>
        <div class="actions">
          Download Import Template
          <a class="download-btn" :href="__importTemplateUrl('xls')" target="_blank" rel="noopener">XLS</a>
          <a class="download-btn" :href="__importTemplateUrl('csv')" target="_blank" rel="noopener">CSV</a>
        </div>
      </div>

    </div>
  </div>
</template>
<script>

const actions = {
  submit: {
    enabled: false
  },
  cancel: {
    enabled: false
  }
}

const settings = {
  wrapper: {
    class: ''
  }
}

export default {
  name: 'BlueImport',
  props: {
    title: {
      type: String
    },
    importTemplateUrl: {
      type: String|Function,
      required: true
    },
    importUrl: {
      type: String,
      required: true
    },
    onUploaded: {
      type: Function
    },
    onFailed: {
      type: Function
    }
  },
  data: () => ({
    actions,
    formData: {},
    settings,
    importTemplateType: 'xls',
    importResult: null,
    importSuccess: false
  }),
  computed: {
    __fields () {
      return [
        {
          name: 'upload',
          type: 'uploader',
          label: 'Upload File',
          autoUpload: true,
          extensions: ['csv', 'xls', 'xlsx'],
          url: this.importUrl,
          fieldName: 'file',
          events: {
            uploaded: this.__onUploaded,
            failed: this.__onFailed
          }
        }
      ]
    }
  },
  methods: {
    __onUploaded (info) {
      this.importSuccess = true
      this.importResult = JSON.parse(info.xhr.response)
      if (this.onUploaded) {
        this.onUploaded(info)
      }
    },
    __onFailed (info) {
      this.importSuccess = false
      this.importResult = JSON.parse(info.xhr.response)
      if (this.onFailed) {
        this.onFailed(info)
      }
    },
    __importTemplateUrl (type) {
      if (typeof this.importTemplateUrl === 'string') {
        return this.importTemplateUrl
      }
      return this.importTemplateUrl(type)
    }
  }
}
</script>
<style lang="scss" scoped>
  .blue-import {
    padding: 12px;
  }
  .blue-form {
    padding: 12px 0;
  }
  .title {
    font-size: 20px;
    letter-spacing: 0.005em;
    font-weight: 400;
  }
  .download-btn {
    margin: 0 6px;
    border: 1px solid $primary;
    padding: 4px 16px;
    text-decoration: none;
  }
  .content {
    margin: 12px 0
  }
</style>
