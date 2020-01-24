<template>
  <div>
    <blue-form
      v-model="formData"
      title="Add a Character"
      :fields="fields"
      :actions="actions"
      :settings="settings"
      :errors="errors"
      :on-action="onAction"
      :on-submit="onSubmit"
    />
  </div>
</template>
<script>

function mustContainNumbers (val) {
  return val.match(/[0-9]+/) || 'Password must contain at least one number.'
}

const fields = [
  {
    name: 'name',
    autofocus: true,
    required: true
  },
  {
    name: 'email',
    required: true,
    rules: 'required|email'
  },
  {
    name: 'password',
    type: 'password',
    rules: ['required|min:6', mustContainNumbers]
  },
  {
    name: 'password_confirmation',
    label: 'Confirm Password',
    type: 'password',
    rules: 'required|same:password'
  },
  {
    name: 'role',
    type: 'select',
    required: true,
    options: []
  },
  {
    name: 'is_awesome',
    type: 'toggle'
  },
  {
    name: 'direction',
    type: 'btn-toggle',
    toggleColor: 'purple',
    default: 'left',
    options: [
      { label: 'Go Left', value: 'left' },
      { label: 'Go Right', value: 'right' }
    ]
  },
  {
    name: 'options',
    type: 'option-group',
    color: 'yellow',
    options: [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
      { label: 'Option 3', value: 3 }
    ]
  },
  {
    name: 'slider',
    type: 'slider',
    default: 2,
    min: 0,
    max: 50
  },
  {
    name: 'range',
    type: 'range',
    default: {
      min: 0,
      max: 20
    },
    min: 0,
    max: 50
  },
  {
    name: 'time',
    type: 'time'
  },
  {
    name: 'date',
    type: 'date',
    minimal: true
  }
]

const settings = {
  form: {
    // class: 'bg-light-blue-2 q-pa-md'
  },
  banner: {
    // class: 'bg-yellow'
  }
}

const actions = {
  submit: {
    label: 'DO IT'
  },
  submitError: {
    enabled: true,
    label: 'Submit w/server errors',
    position: 'left',
    color: 'green'
  }
}

export default {
  data: () => ({
    formData: {},
    errors: [],
    fields,
    settings,
    actions
  }),
  mounted () {
    // Emulate useing an API call to get select options
    setTimeout(function () {
      this.fields.find(field => field.name === 'role').options = [
        'User', 'Editor', 'Admin'
      ]
    }.bind(this), 500)
  },
  methods: {
    onAction (action) {
      console.log('action', action)
      switch (action) {
        case 'submitError':
          this.errors = [
            'There was an error trying to save this data on the server'
          ]
          break
      }
    },
    onSubmit () {
      console.log('form submit', this.formData)
    }
  }
}
</script>
<style lang="styl">

</style>
