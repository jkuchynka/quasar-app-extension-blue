<template>
  <div>
  <q-table
    :title="title"
    :data="rows"
    :columns="getColumns"
    :pagination.sync="thisPagination"
    @update:pagination="paginationUpdated"
    separator="cell"
    :loading="loading"
    class="table-sticky-header"
    @request="_onRequest"
    binary-state-sort
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
  title: {
    type: String
  }
}

export default {
  props,
  data: () => ({
    loading: false,
    rows: [],
    thisPagination: defaultPagination
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
    // Allows parent prop to set pagination props
    this.thisPagination = {
      ...defaultPagination,
      ...this.pagination
    }
    // Initial data request
    this._onRequest({
      pagination: this.thisPagination
    })
  },
  methods: {
    paginationUpdated () {
      console.log('paginationUpdated')
    },
    _onRequest (props) {
      let { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      let dir = descending ? 'desc' : 'asc'
      let params = {
        page: page,
        per_page: rowsPerPage,
        sort: sortBy,
        dir: dir,
        q: {
          all: this.search
        }
      }
      return new Promise((resolve, reject) => {
        this.onRequest(params, resolve, reject)
      }).then(({ data, count }) => {
        this.rows = data
        this.thisPagination = props.pagination
        this.thisPagination.rowsNumber = parseInt(count)
        this.thisPagination.page = page
        this.thisPagination.rowsPerPage = rowsPerPage
        this.thisPagination.sortBy = sortBy
        this.thisPagination.descending = descending
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
        this.thisPagination = {
          ...this.thisPagination,
          ...pagination
        }
        this._onRequest({
          pagination: this.thisPagination
        })
      }
    }
  }
}
</script>
<style scoped>

</style>
