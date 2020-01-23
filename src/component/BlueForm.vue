<template>
  <div class="blue-form q-table__card">

    <div class="form-title">{{ title }}</div>

    <q-banner inline-actions class="text-white bg-red">
      Unable to submit form. Please correct the errors below and try again.
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
            class="q-ma-sm"
            label="Submit"
            type="submit"
            color="primary"
            v-show="!settings.hideSubmit"
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

import FormFields from './../utils/formFields'
import { QInput } from 'quasar'

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
    errors: {
      type: Object
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
  data: () => ({
    formErrors: {}
  }),
  created () {
    this._setup()
  },
  components: {
    QInput
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
            } else {
              this.$set(formData, field.name, '')
            }
          }
        }
      })
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
