<template>
  <div>
  <q-table
    :title="title"
    :data="rows"
    :columns="getColumns"
    :pagination.sync="localPagination"
    @update:pagination="paginationUpdated"
    separator="cell"
    :loading="loading"
    :filter="filter"
    class="table-sticky-header"
    @request="_onRequest"
    binary-state-sort
  >
    <template v-slot:top="props">
      <q-input v-model="filter" :placeholder="localSettings.search.placeholder" class="search-input" dense clearable :debounce="localSettings.search.debounce">
        <template v-slot:append>
          <q-icon :name="localSettings.search.icon" />
        </template>
      </q-input>
    </template>
  </q-table>
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
  search: {
    debounce: 300,
    placeholder: 'Search',
    icon: 'fas fa-search'
  }
}

const props = {
  columns: {
    type: Array,
    required: true
  },
  onRequest: {
    type: Function,
    required: true
  },
  pagination: {
    type: Object,
    default: {}
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
    filter: null,
    loading: false,
    rows: [],
    search: '',
    localPagination: defaultPagination,
    localSettings: defaultSettings
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
      console.log('columns', columns)
      return columns
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
    this._onRequest({
      pagination: this.localPagination
    })
  },
  methods: {
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
        this.loading = false
      })
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

</style>
