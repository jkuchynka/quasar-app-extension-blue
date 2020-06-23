<template>
  <div>
  <q-table
    :title="title"
    :data="rows"
    :columns="__columns"
    :pagination.sync="localPagination"
    :row-key="rowKey"
    @update:pagination="paginationUpdated"
    :loading="loading"
    :filter="filter"
    @request="_onRequest"
    :selection="selection"
    :selected.sync="selected"
    :expanded.sync="expanded"
    ref="qtable"
    v-bind="localSettings.props.table"
  >
    <template v-slot:top>
      <div v-if="localSettings.show.header" class="col-12">

        <div class="row items-start">

          <div class="col-6 title">
            <div class="q-table__title">{{ title }}</div>
          </div>

          <div class="col-6">

            <div class="row items-end">

              <div class="col-8">
                <q-input v-model="filter" :placeholder="localSettings.search.placeholder" class="search-input" dense clearable :debounce="localSettings.search.debounce" v-if="localSettings.show.search">
                  <template v-slot:append>
                    <q-icon :name="localSettings.search.icon" />
                  </template>
                </q-input>
              </div>

              <div class="col-4 q-px-sm">
                <q-btn
                  flat
                  no-caps
                  padding="xs lg xs md"
                  @click="showAdvancedSearch = !showAdvancedSearch"
                >
                  <span>Advanced</span>
                  <q-icon
                    :name="'fas fa-chevron-' + (showAdvancedSearch ? 'up' : 'down')"
                    size="14px"
                    class="q-ml-sm"
                  />
                </q-btn>
              </div>

            </div>

          </div>
        </div>

        <div class="row">
          <blue-filters
            :filters="filters"
            :filtersets="filtersets"
            @set-filters="__setFilters"
            :show-filters="showAdvancedSearch"
          />
        </div>

      </div>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width align="center">
          <q-checkbox dense v-model="props.selected" />
        </q-td>

        <q-td v-for="(column) in __columns" :key="column.name" :props="props">
          <div v-if="column.component" :is="column.component" :props="props" />
          <div v-else-if="column.name === 'actions'">
            <q-btn
              v-for="(action, a_i) in __getActions('row')"
              :key="`row-action-${a_i}`"
              :icon="action.icon"
              :title="action.label"
              flat
              size="sm"
              dense
              color="primary"
              @click="__onAction(action, props)"
            />
          </div>
          <div v-else>
            <slot :name="`body-cell-${column.name}`" :props="props">{{ _displayCellValue(props, column) }}</slot>
          </div>
        </q-td>

      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" style="position: relative">
          <q-btn class="expanded-close-btn" color="red" icon="fas fa-times" @click="expand(props.key)" size="sm" />
          <slot name="expanded" :props="{...props, ...{expandView: expandView[props.key]}}">Expanded</slot>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom="props">

      <div class="col q-ma-sm batch-actions" v-if="localSettings.show.batchActions">
        <q-btn-dropdown color="primary" :label="labelBatchActionsBtn">
          <q-list>
            <q-item
              v-for="(action, a_i) in __getActions('batch')"
              :key="`batch-action-${a_i}`"
              :clickable="selected.length > 0"
              v-close-popup
              @click="__onAction(action)"
              :disabled="selected.length < 1"
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

      <div class="col q-ma-sm pagination">
        <q-pagination
          v-model="props.pagination.page"
          :max="props.pagesNumber"
          :max-pages="7"
          :direction-links="true"
          :ellipses="false"
          @input="_onRequest(props)"
        />
      </div>

      <div class="col-auto export" v-if="localSettings.show.export">
        <q-btn-dropdown color="primary" label="All">
          <q-list separator dense>
            <q-item
              v-for="(action, a_i) in __getActions('all')"
              :key="`export-action-${a_i}`"
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

      <div class="col-auto q-ma-sm pagination-rows-per-page" v-if="localSettings.show.paginationPerPage">
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
import { extend } from 'quasar'
import formats from '../utils/formats'

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
  props: {
    column: {
      classes: ''
    },
    table: {
      separator: 'cell',
      class: 'table-sticky-header',
      binaryStateSort: true
    }
  },
  search: {
    debounce: 300,
    placeholder: 'Search',
    icon: 'fas fa-search'
  },
  show: {
    actions: true,
    batchActions: true,
    export: true,
    header: true,
    paginationPerPage: true,
    search: true
  }
}

const defaultActions = {
  // Batch actions
  deleteSelected: {
    enabled: true,
    type: 'batch',
    label: 'Delete',
    icon: 'fas fa-trash',
    confirm: true,
    messageConfirm: 'Delete these ${count} ${entityNames}?',
    messageSuccess: '${count} ${entityNames} deleted'
  },
  // Export actions
  exportCSV: {
    enabled: true,
    type: 'all',
    label: 'Export CSV',
    icon: 'fas fa-file-csv'
  },
  exportXLS: {
    enabled: true,
    type: 'all',
    label: 'Export XLS',
    icon: 'fas fa-file-excel'
  },
  exportPDF: {
    enabled: true,
    type: 'all',
    label: 'Export PDF',
    icon: 'fas fa-file-pdf'
  },
  import: {
    enabled: true,
    type: 'all',
    label: 'Import',
    icon: 'fas fa-file'
  },
  // Row actions
  view: {
    enabled: true,
    type: 'row',
    label: 'View',
    icon: 'fas fa-eye'
  },
  edit: {
    enabled: true,
    type: 'row',
    label: 'Edit',
    icon: 'fas fa-edit'
  },
  delete: {
    enabled: true,
    type: 'row',
    label: 'Delete',
    icon: 'fas fa-trash',
    confirm: true,
    messageConfirm: 'Delete this ${entityName}?',
    messageSuccess: '${entityName} deleted'
  }
}

const props = {
  actions: {
    type: Object,
    default () {
      return {}
    }
  },
  columns: {
    type: Array,
    required: true
  },
  /**
   * Allowed filters for the blue-filterset component
   *
   * @type Array
   *   e.g. [
   *     {
   *       field: 'id',
   *       operators: ['=', '>', '<']
   *     },
   *     {
   *       field: 'username',
   *       operators: ['*', '=']
   *     }
   *   ]
   */
  filters: {
    type: Array
  },
  filtersets: {
    type: Array
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
    default () {
      return {}
    }
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
    type: Object,
    default () {
      return {}
    }
  },
  title: {
    type: String
  }
}

export default {
  name: 'BlueDataTable',
  setDefaults (settings) {
    extend(true, defaultSettings, settings)
  },
  props,
  data: () => ({
    confirm: {
      action: null,
      title: 'Confirm',
      message: '',
      props: {},
      show: false
    },
    expanded: [],
    expandView: {},
    loading: false,
    rows: [],
    filter: null,
    activeFilters: [],
    selected: [],
    localActions: extend(true, {}, defaultActions),
    localPagination: extend(true, {}, defaultPagination),
    localSettings: extend(true, {}, defaultSettings),
    showAdvancedSearch: false
  }),
  computed: {
    __columns () {
      const definitions = [
        ...this.columns,
        {
          name: 'actions',
          align: 'center'
        }
      ]
      let defaults = this.localSettings.props.column
      const columns = definitions.map(definition => {
        let column = Object.assign({}, defaults, definition)
        column.field = column.field ? column.field : column.name
        column.label = column.label ? column.label : formats.titleCase(column.name)
        column.align = column.align ? column.align : 'left'
        column.sortable = column.sortable ? column.sortable : true
        return column
      })

      return columns
    },
    labelBatchActionsBtn () {
      return this.selected.length + ' Selected'
    }
  },
  mounted () {
    // Allows parent prop to set pagination, setting props
    extend(true, this.localPagination, this.pagination)
    extend(true, this.localSettings, this.settings)
    extend(true, this.localActions, this.actions)

    // Initial data request
    this.doRequest()
  },
  methods: {
    doRequest () {
      this._onRequest({
        pagination: this.localPagination
      })
    },
    expand (id, expandView) {
      let expand = false
      // If no expandView is passed, simply toggle the expanded state
      if (!expandView) {
        expand = !this.expandView[id]
      // If expandView is different than the current view, even if it's
      // already expanded, simply switch the view
      } else if (!this.expandView[id] || (this.expandView[id] && this.expandView[id] !== expandView)) {
        expand = true
      }
      // Update qtable and force update
      if (!expand) {
        this.expanded = this.expanded.filter(key => key !== id)
        delete this.expandView[id]
      } else {
        this.expanded.push(id)
        this.expandView[id] = expandView
      }
      this.$forceUpdate()
    },
    __setFilters (filters) {
      this.activeFilters = filters
      this.doRequest()
    },
    __template (string) {
      string = string.replace(/\$\{count\}/g, this.selected.length)
      string = string.replace(/\$\{entityName\}/g, this.settings.entityName)
      string = string.replace(/\$\{entityNames\}/g, this.settings.entityName + 's')
      return string
    },
    /**
     * An action should be able recieve the action type
     * and the row or rows it is acting on.
     */
    __onAction (action, props = {}) {
      if (!props.row) {
        props.selected = this.selected
      }
      if (!action.confirm) {
        new Promise((resolve, reject) => {
          this.onAction(action.name, props, resolve, reject)
        })
        return
      }
      this.confirm.action = action
      this.confirm.props = props
      this.confirm.message = this.__template(action.messageConfirm)
      this.confirm.show = true
    },
    // Get enabled actions of a type
    __getActions (type) {
      let actions = []
      Object.keys(this.localActions).forEach(key => {
        const action = this.localActions[key]
        if (action.type === type && action.enabled) {
          action.name = key
          actions.push(action)
        }
      })
      return actions
    },
    onConfirm () {
      new Promise((resolve, reject) => {
        this.onAction(this.confirm.action.name, this.confirm.props, resolve, reject)
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
    _displayCellValue (props, column) {
      const propCol = props.cols.find(col => col.name === column.name)
      return propCol.value
    },
    paginationUpdated () {

    },
    _onRequest (props) {
      let { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      let dir = descending ? 'desc' : 'asc'
      let params = {
        ...props.pagination,
        ...{
          filter: this.filter
        },
        filters: this.activeFilters
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
.toggle-filters-btn .q-icon {
  position: relative;
  left: 4px;
}
.expanded-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
