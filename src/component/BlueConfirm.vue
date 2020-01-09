<template>
  <q-dialog v-model="_show">
    <q-card class="blue-confirm">
      <q-card-section class="row">
        <div class="title">{{ title }}</div>
      </q-card-section>
      <q-card-section class="row">
        <div class="message">{{ message }}</div>
      </q-card-section>
      <q-card-actions align="between">
        <q-btn
          class="btn-cancel"
          flat
          :label="labelCancel"
          color="primary"
          @click="_onCancel"
        />
        <q-btn
          class="btn-submit"
          :label="labelSubmit"
          color="red"
          @click="_onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QDialog } from 'quasar'

const props = {
  labelCancel: {
    type: String,
    default: 'Cancel'
  },
  labelSubmit: {
    type: String,
    default: 'Confirm'
  },
  message: {
    type: String
  },
  onCancel: {
    type: Function
  },
  onSubmit: {
    type: Function,
    required: true
  },
  show: {
    type: Boolean
  },
  title: {
    type: String,
    default: 'Are you sure?'
  }
}

export default {
  props,
  components: {
    QBtn,
    QCard,
    QDialog
  },
  data: () => ({

  }),
  computed: {
    _show: {
      get () {
        return this.show
      },
      set (value) {
        this.$emit('update:show', value)
      }
    }
  },
  methods: {
    _onCancel () {
      if (this.onCancel) {
        this.onCancel()
      } else {
        this._show = false
      }
    },
    _onSubmit () {
      this.onSubmit()
    }
  }
}
</script>

<style scoped>
.blue-confirm {
  min-width: 450px;
}
.blue-confirm .title {
  font-size: 1.5rem;
}
</style>
