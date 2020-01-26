Blue - Quasar App Extension
===

Blue components expand on the already awesome Quasar components. Each component's configuration is done with reactive js objects. Lots of sensible defaults allow creating powerful components with the least possible amount of code.

[BlueConfirm](#blueconfirm)
[BlueForm](#blueform)
[BlueDataTable](#bluedatatable)
[BlueImport](#blueimport)

# Install
```bash
quasar ext add blue
```
Quasar CLI will retrieve it from NPM and install the extension.

# Uninstall
```bash
quasar ext remove blue
```

# Info

Better docs are on the way. For now, you can view an extensive demo of each component in src/demo. There's a lot on the roadmap, and these components are considered alpha.

## Roadmap

* Allow setting global defaults and templates for each component
* Cover more customization that people will want to use
* Extract each component into it's own extension, and have blue pull all of them in.
* Filterset component for storing/using groups of filters, for filtering anything (tables, grids, lists)

## BlueConfirm

Confirmation popup component for actions such as deleting a record.

```html
<blue-confirm
  :show.sync="showConfirm"
  title="Confirm"
  message="This action cannot be undone"
  label-cancel="Go Back"
  label-submit="Do It"
  :on-submit="onConfirmSubmit"
  :on-cancel="onConfirmCancel"
/>
```

## BlueDataTable

Data table component. Perfect for admin, but customizable enough for most table needs. Has callbacks for fetching data from an API.

### Features

* Search
* Custom intuitive pagination
* Batch actions (delete)
* Row actions (view, edit, delete)
* Template slots for custom cells, and expanded views
* All actions (export, import)

### Roadmap

* Filters
* Filtersets (Basically saved groups of filters that can be enabled with a button. E.g. user roles)
* Column show/hide
* More customizable options and props

### Sample usage

```html
<blue-data-table
  title="Characters"
  :columns="columns"
  :actions="actions"
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
```

## BlueForm

Form component that builds dynamic forms with a fields definition schema. Easy to use and customize

### Features

* Validation with auto-generated error messages. Format example: 'required|min:6|same:password'. Uses https://github.com/skaterdav85/validatorjs#available-rules
* Actions - Can hide the defaults and add custom actions. Example actions are submit, cancel, reset, delete.

### Sample usage

```html
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
```

## BlueImport

Import component that allows uploading a XLS or CSV file to import records on your server.

### Features

* Uploads to import url, with success or failure messaging
* Has buttons for the user to download XLS or CSV templates. A template is an empty file with field names as headers, that can be populated for re-import

### Roadmap

* Option to do the heavy lifting on the front-end, which would parse the data and call the appropriate api for each record. This would elimate the need for extra server code, and enable the front end to show progress of an import.

### Sample Usage

```html
<blue-import
  title="Demo Import"
  :import-template-url="importTemplateUrl"
  import-url="http://localhost:8000/api/lenders/import/new"
  :on-uploaded="onUploaded"
>
  <template v-slot:content>
    <div v-if="!importResult">
      Upload a CSV or XLS file to import new records. The first row should be the header row, containing field names. You can download an import template below to get started.
    </div>
    <div v-else>
      Show results of successful or failed import here.
    </div>
  </template>
</blue-import>
```
