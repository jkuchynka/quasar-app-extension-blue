<template>
  <div class="blue-filters col-12">

    <div class="q-my-sm q-gutter-sm row items-end filter-sets">

      <q-btn
        @click="selectAll"
        color="secondary"
        size="md"
        :class="{ active: !activeFilterSet }"
        :outline="!activeFilterSet"
      >All</q-btn>

      <q-btn
        v-for="(filterSet, i) in buttonFilterSets"
        :key="`filter-set-${i}`"
        @click="selectFilterSet(filterSet)"
        :class="{ active: filterSet === activeFilterSet }"
        color="secondary"
        size="md"
        :outline="filterSet === activeFilterSet"
      >{{ filterSet.name }}</q-btn>

      <q-select
        v-if="moreFilterSets.length"
        style="min-width: 180px"
        dense
        label="Select FilterSet"
        filled
        dark
        stack-label
        clearable
        option-label="name"
        v-model="selectedFilterSet"
        :options="moreFilterSets"
        @input="selectFilterSet"
      />

      <q-btn
        color="blue-grey-9"
        size="md"
        @click="showFilters = !showFilters"
      >
        <span>Filters</span>
        <q-icon
          :name="'fas fa-chevron-' + (showFilters ? 'up' : 'down')"
          size="14px"
          class="q-ml-sm"
        />
      </q-btn>
    </div>

    <div class="q-my-sm q-pa-sm filters-wrapper" v-if="showFilters">

      <div class="q-my-md row add-filter">

        <q-form @submit="submitAddFilter">

          <div class="q-gutter-md row items-end items-center">
            <q-select
              label="Field"
              stack-label
              :options="filters"
              v-model="addFilter"
              dense
              filled
              dark
              color="white"
              cover-option
            ></q-select>

            <q-select
              v-if="addFilter"
              label="Operation"
              stack-label
              :options="expressionOptions"
              v-model="addFilterOperator"
              dense
              filled
              dark
              color="white"
            ></q-select>

            <q-input
              v-if="addFilter && !addFilter.options"
              label="Value"
              stack-label
              v-model="addFilterValue"
              dense
              filled
              dark
              color="white"
            ></q-input>

            <q-select
              v-if="addFilter && addFilter.options"
              label="Value"
              stack-label
              v-model="addFilterValue"
              dense
              emit-value
              map-options
              filled
              dark
              color="white"
              :options="addFilter.options"
            />

            <q-btn v-if="addFilter" type="submit" size="sm" color="primary">Add Filter</q-btn>

          </div>

        </q-form>

      </div>

      <div class="q-my-md q-gutter-md row items-center filters">
        <q-btn
          v-for="(filter, i) in activeFilters"
          :key="`active-filter-${i}`"
          color="secondary"
          push
          no-caps
          padding="xs lg xs md"
          size="sm"
          :label="activeFilterLabel(filter)"
          @click="removeFilter(filter)"
        >
          <q-badge
            color="red"
            floating
            transparent
          >
            <q-icon name="clear" size="12px"></q-icon>
          </q-badge>
        </q-btn>

      </div>
      <div class="q-my-md q-gutter-md row items-center filter-set-actions">

        <q-btn color="primary" size="sm" @click="showUpdateFilterSetForm" v-if="selectedFilterSet" no-caps>UPDATE "{{ this.selectedFilterSet.name }}"</q-btn>

        <q-btn color="primary" size="sm" @click="showCreateFilterSetForm" v-if="activeFilters.length && filterSetsEnabled">Create FilterSet</q-btn>

        <q-btn color="red" size="sm" @click="askDeleteFilterSet" v-if="selectedFilterSet" no-caps>DELETE "{{ this.selectedFilterSet.name }}"</q-btn>
      </div>

      <div v-if="showFilterSetForm" class="filter-set-form-wrapper">

        <blue-form
          v-model="filterSetForm.data"
          :title="filterSetForm.create ? 'Create FilterSet' : 'Update FilterSet'"
          :fields="filterSetForm.fields"
          :errors="filterSetForm.errors"
          :settings="filterSetForm.settings"
          :on-action="filterSetFormActions"
          :on-submit="submitFilterSetForm"
        />

      </div>

    </div>

    <blue-confirm
      :show.sync="confirm.showDelete"
      title="Delete FilterSet?"
      :message="confirm.message"
      :on-submit="confirmDeleteFilterSet"
    />

  </div>
</template>
<script>
/**
 * Filters manage applying filter rules to filter content (table, list, etc...)
 * FilterSets are groups of saved filters, these can created programmatically
 * to always show as buttons. Also, this component can be configured
 * to allow users to save and manage their own filterSets.
 *
 * @todo: Allow for grouping of filters with and / or
 */

const options = [
  {
    value: '*',
    label: 'Contains'
  },
  {
    value: '=',
    label: 'Equals'
  },
  {
    value: '>',
    label: 'Greater than'
  },
  {
    value: '<',
    label: 'Lesser than'
  },
  {
    value: '!',
    label: 'Empty'
  }
]

const props = {
  filters: {
    type: Array
  },
  filterSets: {
    type: Array
  },
  filterSetsGroup: {
    type: String
  }
}

const filterSetForm = {
  create: false,
  data: {
    name: ''
  },
  fields: [
    {
      name: 'name',
      required: true
    }
  ],
  settings: {},
  errors: []
}

export default {
  props,
  data: () => ({
    activeFilters: [],
    activeFilterSet: null,
    addFilter: null,
    addFilterOperator: null,
    addFilterValue: null,

    confirm: {
      showDelete: false,
      showUpdate: false,
      message: ''
    },

    filterSetForm,

    saveFilterSetError: null,
    saveFilterSetName: '',
    selectedFilterSet: null,

    showFilterSetForm: false,

    showFilters: false
  }),
  computed: {
    buttonFilterSets () {
      return this.filterSets.filter(set => set.button)
    },

    moreFilterSets () {
      console.log('compute moreFilterSets', this.filterSets)
      return this.filterSets.filter(set => !set.button)
    },

    /**
     * Whether filter sets fetch / saving is enabled
     *
     * @return Boolean
     */
    filterSetsEnabled () {
      return !!this.filterSetsGroup
    },

    expressionOptions () {
      if (!this.addFilter) {
        return []
      }
      return this.addFilter.operators.map(operator => {
        return options.find(option => option.value === operator)
      })
    }
  },
  mounted () {
    this.resetAddFilter()
  },
  methods: {
    activeFilterLabel (filter) {
      const _filter = this.filters.find(_filter => _filter.field === filter.field)
      const _operator = options.find(option => option.value === filter.operator)
      const filterLabel = _filter ? _filter.label : filter.field
      return `${filterLabel} ${_operator.label} ${filter.value}`
    },

    submitAddFilter () {
      this.activeFilters.push({
        field: this.addFilter.field,
        operator: this.addFilterOperator.value,
        value: this.addFilterValue
      })
      this.resetAddFilter()
    },

    clearFilters () {
      this.activeFilters = []
    },

    askDeleteFilterSet () {
      this.confirm.message = `Delete ${this.selectedFilterSet.name}? This action cannot be undone`
      this.confirm.showDelete = true
    },

    confirmDeleteFilterSet () {
      this.$emit('delete-filter-set', {
        filterSet: this.selectedFilterSet,
        done: () => {
          this.$q.notify(`FilterSet ${this.selectedFilterSet.name} deleted`)
          this.confirm.showDelete = false
          this.selectedFilterSet = null
          this.selectAll()
        },
        error: (error) => {
          this.$q.notify(`Error deleting filterSet: ${error}`)
        }
      })
    },

    showCreateFilterSetForm () {
      this.filterSetForm.create = true
      this.filterSetForm.data.name = ''
      this.showFilterSetForm = true
    },

    showUpdateFilterSetForm () {
      this.filterSetForm.create = false
      this.filterSetForm.data.name = this.selectedFilterSet.name
      this.showFilterSetForm = true
    },

    submitFilterSetForm () {
      const emit = this.filterSetForm.create ? 'create-filter-set' : 'update-filter-set'
      let filterSet = {
        name: this.filterSetForm.data.name,
        group: this.filterSetsGroup,
        filters: this.activeFilters
      }
      if (!this.filterSetForm.create) {
        filterSet.id = this.selectedFilterSet.id
      }
      this.$emit(emit, {
        filterSet,
        done: (filterSet) => {
          const action = this.filterSetForm.create ? 'Created' : 'Updated'
          this.$q.notify(`${action} filterSet: ${filterSetForm.data.name}`)
          if (this.filterSetForm.create) {
            this.selectedFilterSet = filterSet
          }
          this.filterSetForm.data.name = ''
          this.showFilterSetForm = false
        },
        error: (error) => {
          const action = this.filterSetForm.create ? 'creating' : 'updating'
          this.$q.notify(`Error ${action} filterSet: ${error}`)
        }
      })
    },

    filterSetFormActions (action, props) {
      switch (action) {
        case 'cancel':
          this.filterSetForm.data.name = ''
          this.showFilterSetForm = false
          break
      }
    },

    selectAll () {
      this.clearFilters()
      this.activeFilterSet = null
      this.selectedFilterSet = null
    },

    removeFilter (filter) {
      this.activeFilters = this.activeFilters.filter(activeFilter => activeFilter !== filter)
    },

    resetAddFilter () {
      this.addFilter = null
      this.addFilter = this.filters[0]
      this.addFilterValue = null
    },

    selectFilterSet (filterSet) {
      if (!filterSet) {
        this.selectAll()
      } else {
        this.activeFilterSet = filterSet
        this.activeFilters = filterSet.filters
      }
    }
  },
  watch: {
    addFilter () {
      const options = this.expressionOptions
      this.addFilterOperator = options.length ? options[0] : null
    },
    activeFilters () {
      this.$emit('set-filters', this.activeFilters)
    }
  }
}
</script>
<style lang="sass">
  .blue-filters
    .filter-sets
      align-items: center
      >:first-child
        margin-left: auto
    .add-filter
      .q-field
        min-width: 200px
    .filter-set-name
      display: inline-block
    .q-field--focused
      .q-field__label
        color: #ddd
      .q-field__control:after
        color: #ddd
    .filter-set-form-wrapper
      max-width: 300px
      color: #333
</style>
