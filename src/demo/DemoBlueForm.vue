<template>
  <div>
    <blue-form
      v-model="formData"
      title="Add a Character"
      :fields="fields"
      :settings="settings"
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
  }
]

const settings = {

}

export default {
  data: () => ({
    formData: {},
    fields,
    settings
  }),
  methods: {
    onSubmit () {
      console.log('form submit', this.formData)
    }
  }
}
</script>
<style lang="styl">

</style>
