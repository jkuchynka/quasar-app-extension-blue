<template>
  <div class="blue-filters col-12">

    <div class="q-my-sm q-gutter-sm row items-start filtersets">
      <q-btn
        v-for="(filterset, i) in filtersets"
        :key="`filterset-${i}`"
        @click="__selectFilterset(filterset)"
        :class="{ active: filterset === activeFilterset }"
        color="secondary"
        size="sm"
        :outline="filterset !== activeFilterset"
      >{{ filterset.name }}</q-btn>
    </div>

    <div class="q-my-sm q-pa-sm filters-wrapper" v-if="showFilters">

      <div class="q-my-md row add-filter">

        <q-form @submit="__addFilter">

          <div class="q-gutter-md row items-end">
            <q-select
              label="Field"
              stack-label
              :options="filters"
              v-model="addFilter"
              filled
            ></q-select>

            <q-select
              v-if="addFilter"
              label="Operation"
              stack-label
              :options="__optionsOperators"
              v-model="addFilterOperator"
              filled
            ></q-select>

            <q-input
              v-if="addFilter && !addFilter.options"
              label="Value"
              stack-label
              v-model="addFilterValue"
              filled
            ></q-input>

            <q-select
              v-if="addFilter && addFilter.options"
              label="Value"
              stack-label
              v-model="addFilterValue"
              emit-value
              map-objects
              filled
              :options="addFilter.options"
            />

            <q-btn v-if="addFilter" type="submit" color="primary">Add Filter</q-btn>

          </div>

        </q-form>

      </div>

      <div class="q-my-md q-gutter-md row items-start filters">
        <q-btn
          v-for="(filter, i) in activeFilters"
          :key="`active-filter-${i}`"
          color="secondary"
          push
          no-caps
          padding="xs lg xs md"
          size="sm"
          :label="__activeFilterLabel(filter)"
          @click="__removeFilter(filter)"
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

    </div>

  </div>
</template>
<script>

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

export default {
  props: ['filters', 'filtersets', 'showFilters'],
  data: () => ({
    activeFilters: [],
    activeFilterset: null,
    addFilter: null,
    addFilterOperator: null,
    addFilterValue: null
  }),
  computed: {
    __optionsOperators () {
      if (!this.addFilter) {
        return []
      }
      return this.addFilter.operators.map(operator => {
        return options.find(option => option.value === operator)
      })
    }
  },
  mounted () {
    this.__resetAddFilter()
  },
  methods: {
    __activeFilterLabel (filter) {
      const _filter = this.filters.find(_filter => _filter.field === filter.field)
      const _operator = options.find(option => option.value === filter.operator)
      const filterLabel = _filter ? _filter.label : filter.field
      return `${filterLabel} ${_operator.label} ${filter.value}`
    },

    __addFilter () {
      this.activeFilters.push({
        field: this.addFilter.field,
        operator: this.addFilterOperator.value,
        value: this.addFilterValue
      })
      this.__resetAddFilter()
    },

    __removeFilter (filter) {
      this.activeFilters = this.activeFilters.filter(activeFilter => activeFilter !== filter)
    },

    __resetAddFilter () {
      this.addFilter = null
      this.addFilter = this.filters[0]
      this.addFilterValue = null
    },

    __selectFilterset (filterset) {
      this.activeFilterset = filterset
      this.activeFilters = filterset.filters
    }
  },
  watch: {
    addFilter () {
      const options = this.__optionsOperators
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
    .add-filter
      .q-field
        min-width: 200px
    .filters-wrapper
      background: $blue-grey-2
</style>
