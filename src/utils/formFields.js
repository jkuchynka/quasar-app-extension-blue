
import Validator from 'validatorjs'
import to from 'to-case'
import { extend } from 'quasar'

class FormFields {
  constructor (definitions, settings, formData) {
    this.definitions = extend(true, [], definitions)
    this.settings = extend(true, {}, settings)
    this.formData = formData
  }

  /**
   * Build fields from field definitions,
   * Prepare fields for usage in form component
   */
  getFields () {
    let fields = []
    this.definitions.forEach(definition => {
      let field = {
        props: {}
      }

      this.component(definition, field)
      this.name(definition, field)
      this.label(definition)
      this.rules(definition, field)
      this.events(definition, field)
      this.error(definition)
      this.extra(definition)
      this.props(definition, field)

      // Done.
      fields.push(field)
    })
    return fields
  }

  /**
   * Set the component for the field
   */
  component (def, field) {
    let component
    if (def.hasOwnProperty('component')) {
      component = def.component
    } else {
      // Default type is text
      const type = def.hasOwnProperty('type') ? def.type : 'text'
      def.type = type
      switch (type) {
        case 'text':
        case 'textarea':
        case 'password':
        case 'email':
        case 'search':
        case 'tel':
        case 'url':
        case 'time':
        case 'date':
          component = 'q-input'
          break
        case 'checkbox':
          component = 'q-checkbox'
          break
        case 'select':
          component = 'q-select'
          break
        case 'toggle':
          component = 'q-toggle'
          break
        case 'btn-toggle':
          component = 'q-btn-toggle'
          break
        case 'option-group':
          component = 'q-option-group'
          break
        case 'slider':
          component = 'q-slider'
          break
        case 'range':
          component = 'q-range'
          break
        case 'time':
          component = 'q-time'
          break
        case 'date':
          component = 'q-date'
          break
        case 'uploader':
          component = 'q-uploader'
          break
        default:
          throw new Error(`Invalid or missing field type: ${def.type}`)
      }
    }
    field.component = component
  }

  /**
   * Add name
   */
  name (def, field) {
    field.name = def.name
  }

  /**
   * Setup error for validation message
   */
  error (def) {
    def.error = def.hasOwnProperty('error') ? def.error : false
  }

  /**
   * Set the label from the name
   */
  label (def) {
    if (!['slider', 'range', 'uploader'].includes(def.type)) {
      def.label = def.hasOwnProperty('label') ? def.label : to.title(def.name)
    }
  }

  /**
   * Set events
   */
  events (def, field) {
    field.events = def.events ? def.events : (def.on ? def.on : {})
  }

  extra (def) {
    if (def.type === 'uploader' && def.extensions) {
      const extensions = def.extensions.map(ext => ext.toLowerCase())
      def.filter = files => {
        return files.filter(file => {
          return extensions.includes(file.name.split('.').pop().toLowerCase())
        })
      }
    }
  }

  /**
   * Setup props for quasar component,
   * Allow props to be defined in this order:
   * Global
   * Form
   * Field (Most data in field definition will pass along as a prop)
   */
  props (def, field) {
    // Setup props from global all fields settings
    // let props = Object.assign({}, globalSettings.props)
    let props = {}
    // Add props from global field type settings
    // const key = result.component.replace('q-', '')
    // if (globalSettings.hasOwnProperty(key)) {
    //   props = Object.assign(props, globalSettings[key])
    // }

    // Add props from settings for all fields
    extend(true, props, this.settings.props.fields)

    // Add props from settings for specific fields
    if (this.settings.props.hasOwnProperty(def.type)) {
      extend(true, props, this.settings.props[def.type])
    }

    // Add props from the field definition
    // Field data that shouldn't be a prop
    const notProps = ['default', 'component', 'rules', 'type', 'events']
    let fieldProps = extend(true, {}, def)
    Object.keys(fieldProps).filter(key => !notProps.includes(key)).forEach(key => {
      props[key] = fieldProps[key]
    })
    const typeFields = ['password']
    if (typeFields.includes(def.type)) {
      props.type = def.type
    }
    extend(true, field.props, props)
  }

  /**
   * Setup rules, convert to validation functions
   */
  rules (def, field) {
    let rules = []
    if (def.hasOwnProperty('rules')) {
      rules = def.rules
      // Rules can be a string or array
      if (typeof rules === 'string') {
        rules = [rules]
      }
    }
    if (def.required) {
      rules.push('required')
    }
    // Form settings can specify rules for fields
    // if (this.settings.hasOwnProperty('rules')) {
    //   Object.keys(this.settings.rules).forEach(rule => {
    //     if (this.settings.rules[rule].includes(field.name)) {
    //       rules.push(rule)
    //     }
    //   })
    // }

    // Now convert name of rule to validation function
    field.props.rules = []
    rules.forEach(rule => {
      // If rule is already a function, add it (user defined)
      if (typeof rule === 'function') {
        field.props.rules.push(rule)
      } else {
        let validator = new Validator
        field.props.rules.push(val => {
          const rules = {}
          rules[def.name] = rule
          let validator = new Validator(this.formData, rules)
          validator.setAttributeNames({
            name: def.label || def.name
          })
          return validator.passes() || validator.errors.first(def.name)
        })
      }
    })
  }
}

export default FormFields
