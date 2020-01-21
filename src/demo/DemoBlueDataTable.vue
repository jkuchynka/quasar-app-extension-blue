<template>
  <div>
    <blue-data-table
      title="Characters"
      :columns="columns"
      :on-action="onAction"
      :on-request="onRequest"
      :pagination.sync="pagination"
      :settings="settings"
      ref="table"
    >
      <template v-slot:body-cell-custom="props">
        <q-btn color="green" @click="sayHi(props)">Say Hi</q-btn>
      </template>

      <template v-slot:expanded="props">
        <div v-if="props.props.expandView === 'view'">
          <h3>{{ props.props.row.name }}</h3>
          <p><strong>Location</strong> {{ props.props.row.location }}</p>
        </div>
        <div v-else-if="props.props.expandView === 'edit'">
          <h3>Editing {{ props.props.row.name }}</h3>
          <p>Edit form here</p>
        </div>
      </template>

    </blue-data-table>
  </div>
</template>
<script>

const columns = [
  {
    name: 'id',
    align: 'right'
  },
  {
    name: 'name'
  },
  {
    name: 'location'
  },
  {
    name: 'role'
  },
  {
    name: 'custom',
    label: 'Custom Cell Template',
    align: 'center'
  }
]

const pagination = {
  rowsPerPage: 5
}

const settings = {
  entityName: 'Character',
  search: {
    placeholder: 'Enter search terms',
    debounce: 500,
    icon: 'fas fa-search'
  },
  show: {
    // actions: false,
    // batchActions: false,
    // export: false,
    // header: false,
    // paginationPerPage: false,
    // search: false
  }
}

export default {
  name: 'DemoBlueDataTable',
  data: () => ({
    columns,
    pagination,
    settings
  }),
  methods: {
    onAction (action, props, resolve, reject) {
      console.log('action', action, props)
      if (action === 'delete') {
        sampleData = sampleData.filter(thisRow => {
          return thisRow.id !== props.row.id
        })
        /**
        // If using server api, does the delete and refetches data
        this.$api.delete(`users/${row.id}`).then(response => {
          resolve()
          this.$refs.table.doRequest()
        })
         */
      } else if (action === 'delete-selected') {
        sampleData = sampleData.filter(thisRow => {
          return !props.selected.map(dataRow => dataRow.id).includes(thisRow.id)
        })
        console.log('deleted multiple')
      } else if (action === 'export-csv') {
        // asdf
      } else if (action === 'view') {
        this.$refs.table.expand(props.key, 'view')
        return
      } else if (action === 'edit') {
        this.$refs.table.expand(props.key, 'edit')
        return
      }
      resolve()
      this.$refs.table.doRequest()
    },
    // Emulates a server request, which is where
    // all the filtering and sorting should happen
    onRequest (params, resolve, reject) {
      let filtered = [
        ...sampleData
      ]
      if (params.filter) {
        const test = params.filter.toLowerCase()
        filtered = filtered.filter(row => {
          return row.name.toLowerCase().includes(test) || row.location.toLowerCase().includes(test)
        })
      }
      const num = params.descending ? 1 : -1
      filtered.sort((a, b) => {
        if (a[params.sortBy] < b[params.sortBy]) {
          return num
        }
        if (a[params.sortBy] > b[params.sortBy]) {
          return -num
        }
        return 0
      })
      const rows = filtered.slice((params.page - 1) * params.rowsPerPage, params.page * params.rowsPerPage)
      console.log('returning rows', rows)
      resolve({
        data: rows,
        count: filtered.length
      })
      /**
      // or with an api request
      this.$api.get('users', params).then(response => {
        resolve({
          data: response.data,
          count: response.headers.count
        })
      })
      */
    },
    sayHi (props) {
      alert(`Hi, ${props.value.row.name}`)
    }
  }
}

let sampleData = [
  {
    id: 1,
    name: 'Donald Duck',
    location: 'Disney World',
    role: 'user'
  },
  {
    id: 2,
    name: 'Homer Simpson',
    location: 'Springdale',
    role: 'admin'
  },
  {
    id: 3,
    name: 'Batman',
    location: 'Gotham City',
    role: 'user'
  },
  {
    id: 4,
    name: 'Chip and Dale',
    location: 'A tree',
    role: 'editor'
  },
  {
    id: 5,
    name: 'Dora',
    location: 'Explorin\'',
    role: 'admin'
  },
  {
    id: 6,
    name: 'Bart Simpson',
    location: 'Springdale',
    role: 'user'
  },
  {
    id: 7,
    name: 'Marge Simpson',
    location: 'Springdale',
    role: 'user'
  }
]
</script>
<style lang="styl">

</style>
