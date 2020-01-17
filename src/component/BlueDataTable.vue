<template>
  <div>
  <q-table
    :title="title"
    :data="rows"
    :columns="getColumns"
    :pagination.sync="localPagination"
    :row-key="rowKey"
    @update:pagination="paginationUpdated"
    separator="cell"
    :loading="loading"
    :filter="filter"
    class="table-sticky-header"
    @request="_onRequest"
    :selection="selection"
    :selected.sync="selected"
    binary-state-sort
  >
    <template v-slot:top>
      <div class="col-8 title">
        <div class="q-table__title">{{ title }}</div>

        <div class="filtersets">
          <q-btn class="q-ma-sm active" @click=""
        </div>
      </div>

      <div class="col-4">
        <q-input v-model="filter" :placeholder="localSettings.search.placeholder" class="search-input" dense clearable :debounce="localSettings.search.debounce">
          <template v-slot:append>
            <q-icon :name="localSettings.search.icon" />
          </template>
        </q-input>

        <q-btn
          class="filtersets-btn"
          :icon="'fas fa-chevron-' + (showAdvancedSearch ? 'up' : 'down')"
          flat
          size="sm"
          @click="showAdvancedSearch = !showAdvancedSearch"
          title="Show Filters"
        />
      </div>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-toggle dense v-model="props.selected" />
        </q-td>

        <q-td v-for="(column, idx) in getColumns" :key="column.name" :props="props">
          <div v-if="column.component" :is="column.component" :props="props" />
          <div v-else-if="column.name === 'actions'">
            <q-btn
              v-for="(action, idx) in actions.row"
              :key="'row-action-' + idx"
              :icon="action.icon"
              :title="action.label"
              flat
              size="sm"
              dense
              color="primary"
              @click="__onAction(action, props)"
              :to="_actionUrl(action.action, props.row)"
            />
          </div>
          <div v-else>
            <slot :name="`body-cell-${column.name}`" :value="props">{{ _displayCellValue(props.row[column.name]) }}</slot>
          </div>
        </q-td>

      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" style="position: relative">
          <q-btn class="expanded-close-btn" color="red" icon="fas fa-times" @click="props.expand = false" size="sm" />
          <slot name="expanded" :value="props">Expanded</slot>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:body-cell-actions="props">
      <td>
        <q-btn
          v-for="(action, idx) in actions.row"
          :key="'row-action-' + idx"
          :icon="action.icon"
          :title="action.label"
          flat
          size="sm"
          dense
          color="primary"
          @click="__onAction(action, props)"
          :to="_actionUrl(action.action, props.row)"
        />
      </td>
    </template>

    <template v-slot:bottom="props">

      <div class="col q-ma-sm batch-actions">
        <q-btn-dropdown color="primary" :label="labelBatchActionsBtn">
          <q-list>
            <q-item
              v-for="batchAction in actions.batch"
              :key="batchAction.action"
              :clickable="selected.length > 0"
              v-close-popup
              @click="__onAction(batchAction, selected)"
              :disabled="selected.length < 1"
            >
              <q-item-section avatar>
                <q-avatar v-if="batchAction.icon" :icon="batchAction.icon" />
                <q-avatar v-else>{{ batchAction.label[0] }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ batchAction.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div class="col q-ma-sm pagination">
        <q-pagination
          v-model="props.pagination.page"
          :max="props.pagesNumber"
          :max-pages="7"
          :direction-links="true"
          :ellipses="false"
          direction-links
          @input="_onRequest(props)"
        />
      </div>

      <div class="col-auto export">
        <q-btn-dropdown color="primary" label="Export">
          <q-list>
            <q-item
              v-for="(action, idx) in actions.export"
              :key="`export-action-${idx}`"
              clickable
              v-close-popup
              @click="__onAction(action)"
            >
              <q-item-section avatar>
                <q-avatar v-if="action.icon" :icon="action.icon" />
                <q-avatar v-else>{{ action.label[0] }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div class="col-auto q-ma-sm pagination-rows-per-page">
        <q-select
          square
          outlined
          v-model="localPagination.rowsPerPage"
          :options="localSettings.pagination.rowsPerPageOptions"
          dense
        />
      </div>

    </template>
  </q-table>

  <blue-confirm
    :show.sync="confirm.show"
    :title="confirm.title"
    :message="confirm.message"
    :on-submit="onConfirm"
  />
</div>
</template>
<script>

const defaultPagination = {
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
}

const defaultSettings = {
  pagination: {
    rowsPerPageOptions: [5, 10, 20, 50]
  },
  search: {
    debounce: 300,
    placeholder: 'Search',
    icon: 'fas fa-search'
  }
}

const actions = {
  batch: [
    {
      action: 'delete-multiple',
      label: 'Delete',
      icon: 'fas fa-trash',
      confirm: true,
      messageConfirm: 'Delete these ${count} ${entityNames}?',
      messageSuccess: '${count} ${entityNames} deleted'
    }
  ],
  export: [
    {
      action: 'export-csv',
      label: 'CSV',
      icon: 'fas fa-file-csv'
    },
    {
      action: 'export-xls',
      label: 'XLS',
      icon: 'fas fa-file-excel'
    },
    {
      action: 'export-pdf',
      label: 'PDF',
      icon: 'fas fa-file-pdf'
    }
  ],
  row: [
    {
      action: 'delete',
      label: 'Delete',
      labelDone: 'deleted',
      icon: 'fas fa-trash',
      confirm: true,
      messageConfirm: 'Delete this ${entityName}?',
      messageSuccess: '${entityName} deleted'
    },
    {
      action: 'view',
      label: 'View',
      icon: 'fas fa-user'
    },
    {
      action: 'edit',
      label: 'Edit',
      icon: 'fas fa-edit',
      to: '_editTo(row)'
    }
  ]
}

const props = {
  columns: {
    type: Array,
    required: true
  },
  onAction: {
    type: Function
  },
  onRequest: {
    type: Function,
    required: true
  },
  pagination: {
    type: Object,
    default: {}
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  selection: {
    type: String,
    default: 'multiple'
  },
  settings: {
    type: Object
  },
  title: {
    type: String
  }
}

export default {
  props,
  data: () => ({
    actions,
    confirm: {
      action: null,
      title: 'Confirm',
      message: '',
      show: false
    },
    loading: false,
    rows: [],
    filter: null,
    selected: [],
    localPagination: defaultPagination,
    localSettings: defaultSettings,
    showAdvancedSearch: false
  }),
  computed: {
    getColumns () {
      const columns = this.columns.map(column => {
        column.field = column.hasOwnProperty('field') ? column.field : column.name
        column.label = column.hasOwnProperty('label') ? column.label : column.name
        column.align = column.hasOwnProperty('align') ? column.align : 'left'
        column.sortable = column.hasOwnProperty('sortable') ? column.sortable : true
        return column
      })
      columns.push({
        name: 'actions'
      })
      console.log('columns', columns)
      return columns
    },
    labelBatchActionsBtn () {
      return this.selected.length + ' Selected'
    }
  },
  mounted () {
    // Allows parent prop to set pagination, setting props
    this.localPagination = {
      ...this.localPagination,
      ...this.pagination
    }
    this.localSettings = {
      ...this.localSettings,
      ...this.settings
    }
    // Initial data request
    this.doRequest()
  },
  methods: {
    doRequest () {
      this._onRequest({
        pagination: this.localPagination
      })
    },
    __template (string) {
      string = string.replace(/\$\{count\}/g, this.selected.length)
      string = string.replace(/\$\{entityName\}/g, this.settings.entityName)
      string = string.replace(/\$\{entityNames\}/g, this.settings.entityName + 's')
      return string
    },
    __onAction (action, props) {
      if (!action.confirm) {
        this.onAction(action.action, props)
        return
      }
      this.confirm.action = action
      if (Array.isArray(rowOrRows)) {
        this.confirm.rows = rowOrRows
        this.confirm.row = null
      } else {
        this.confirm.row = rowOrRows
        this.confirm.rows = null
      }
      this.confirm.message = this.__template(action.messageConfirm)
      this.confirm.show = true
    },
    onConfirm () {
      new Promise((resolve, reject) => {
        const data = Array.isArray(this.confirm.rows) ? this.confirm.rows : this.confirm.row
        this.onAction(this.confirm.action.action, data, resolve, reject)
      }).then(() => {
        if (this.confirm.action.messageSuccess) {
          this.$q.notify(this.__template(this.confirm.action.messageSuccess))
        }
        this.confirm.show = false
        this.selected = []
      })
    },
    _actionUrl (action, row) {
      if (this.settings.hasOwnProperty('urls') && this.settings.urls.hasOwnProperty(action)) {
        return this.settings.urls[action].replace(':id', row.id)
      }
      return ''
    },
    _displayCellValue (value) {
      if (Array.isArray(value) && !value.length) {
        return ''
      }
      return value
    },
    paginationUpdated () {
      console.log('paginationUpdated')
    },
    _onRequest (props) {
      console.log('BlueDataTable _onRequest props', props)
      let { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      let dir = descending ? 'desc' : 'asc'
      let params = {
        ...props.pagination,
        ...{
          filter: this.filter
        }
      }
      return new Promise((resolve, reject) => {
        this.onRequest(params, resolve, reject)
      }).then(({ data, count }) => {
        this.rows = data
        this.localPagination = props.pagination
        this.localPagination.rowsNumber = parseInt(count)
        this.localPagination.page = page
        this.localPagination.rowsPerPage = rowsPerPage
        this.localPagination.sortBy = sortBy
        this.localPagination.descending = descending
        setTimeout(function () {
            this.loading = false
          }.bind(this),
        500)
      })
    },
    updatePagination (props) {
      this._onRequest(props)
    }
  },
  watch: {
    // If parent prop changes pagination, update local
    // prop and re-request data
    pagination: {
      deep: true,
      handler (pagination) {
        this.localPagination = {
          ...this.localPagination,
          ...pagination
        }
        this._onRequest({
          pagination: this.localPagination
        })
      }
    }
  }
}
</script>
<style scoped>
.search-input {
  float: left;
}
.filtersets-btn {
  float: right;
  position: relative;
  top: 8px;
}
.expanded-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
