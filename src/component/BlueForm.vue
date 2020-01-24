<template>
  <div class="blue-form q-table__card">

    <div class="form-title">{{ title }}</div>

    <q-banner inline-actions class="text-white bg-red" v-if="errors.length > 0">
      <strong>Unable to submit form. Please correct the errors below and try again.</strong>
      <div v-for="(error, i) in errors" :key="`error-${i}`">{{ error }}</div>
    </q-banner>

    <q-form
      class="q-gutter-md"
      @submit="__onSubmit"
      @reset="__onReset"
      autofocus
      novalidate
    >

      <div
        class="field-wrapper"
        v-for="(field, i) in parsedFields"
        :key="`field-${i}`"
        v-show="!field.props.hidden"
      >
        <slot :name="`field-${field.name}`" :value="value">
          <div
            v-model="value[field.name]"
            :is="field.component"
            v-bind="field.props"
          />
        </slot>
      </div>

      <div class="row">
        <div class="col">
          <q-btn
            v-for="(action, i) in __getActions('left')"
            :key="`action-left-${i}`"
            class="q-ma-sm"
            v-bind="action"
            @click.prevent="__onAction(action)"
          />
        </div>
        <div class="col">
          <div class="row justify-end">
            <q-btn
              class="q-ma-sm"
              label="Delete"
              type="button"
              color="red"
              @click.prevent="_doDelete"
              v-if="value.id && doDelete"
            />
            <q-btn
              class="q-ma-sm"
              label="Cancel"
              type="button"
              flat
              color="red"
              @click.prevent="_doCancel"
            />
          </div>
        </div>
      </div>
    </q-form>

  </div>
</template>
<script>

import { QInput, QSelect, QToggle, QBtnToggle, QOptionGroup, QSlider, QRange, QTime, QDate, extend } from 'quasar'
import FormFields from './../utils/formFields'

const defaultActions = {
  submit: {
    enabled: true,
    type: 'submit',
    color: 'primary',
    label: 'Submit',
    position: 'left'
  },
  cancel: {
    enabled: true,
    color: 'danger',
    flat: true,
    label: 'Cancel',
    position: 'right'
  }
}

export default {
  name: 'BlueForm',
  props: {
    fields: {
      type: Array
    },
    settings: {
      type: Object,
      default () {
        return {}
      }
    },
    actions: Object,
    onAction: {
      type: Function
    },
    default () {
      return {}
    },
    errors: {
      type: Array,
      default () {
        return []
      }
    },
    title: {
      type: String
    },
    onSubmit: {
      type: Function
    },
    onCancel: {
      type: Function
    },
    onDelete: {
      type: Function
    },
    value: {
      type: Object,
      required: true
    }
  },
  mounted () {
    extend(true, this.localActions, this.actions)
  },
  data: () => ({
    formErrors: {},
    localActions: extend(true, {}, defaultActions)
  }),
  created () {
    this._setup()
  },
  components: {
    QInput,
    QSelect,
    QToggle,
    QBtnToggle,
    QOptionGroup,
    QSlider,
    QRange,
    QTime,
    QDate
  },
  computed: {
    formData: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    parsedFields () {
      const formFields = new FormFields(this.fields, this.settings, this.formData)
      const fields = formFields.getFields()
      console.log('fields', fields)
      return fields
    }
  },
  methods: {
    clearErrors () {
      this.parsedFields.forEach(field => {
        field.props.error = false
        field.props.errorMessage = ''
      })
    },
    // Setup form data with key for each field
    _setup () {
      let formData = this.value
      this.fields.forEach(field => {
        if (!formData.hasOwnProperty(field.name)) {
          if (field.hasOwnProperty('default')) {
            this.$set(formData, field.name, field.default)
          } else {
            if (field.type === 'select' && field.multiple) {
              this.$set(formData, field.name, [])
            } else if (field.type === 'toggle') {
              this.$set(formData, field.name, false)
            } else {
              this.$set(formData, field.name, '')
            }
          }
        }
      })
    },
    // Get enabled actions for a position
    __getActions (position) {
      let actions = []
      Object.keys(this.localActions).forEach(key => {
        const action = this.localActions[key]
        if (action.position === position && action.enabled) {
          action.name = key
          actions.push(action)
        }
      })
      console.log('actions', actions, this.localActions, position)
      return actions
    },
    __onAction (action) {
      this.onAction(action.name)
    },
    __onSubmit () {
      this.clearErrors()
      this.$forceUpdate()
      this.onSubmit(this.formData)
    },
    __onReset () {

    },
    __onCancel () {
      if (this.cancel) {
        this.cancel()
      } else {
        this.$router.go(-1)
      }
    },
    __onDelete () {
      this.onDelete()
    }
  },
  watch: {
    errors () {
      // Check for field level errors and attach to fields
      // If a field doesn't exist for an error, pass the error
      // to the form level errors component
      Object.keys(this.errors).forEach(name => {
        const field = this.parsedFields.find(field => field.name === name)
        if (field) {
          field.props.error = true
          field.props.errorMessage = this.errors[name][0]
        } else {
          this.formErrors = this.errors[name]
        }
      })
      this.$forceUpdate()
    }
  }
}
</script>
<style>
.blue-form {
  padding: 12px 16px;
}
.blue-form .form-title {
  font-size: 20px;
  letter-spacing: 0.005em;
  font-weight: 400;
}
</style>
