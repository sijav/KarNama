Change language and appearance instantly, or add fictional records for testing. Samples preserve existing jobs and contacts and do not duplicate records on repeated loads. Preferences persist after closing the dialog and reloading the app.

## Props

### open
Whether the settings dialog is visible.

### locale
The selected interface language.

### colorScheme
The selected light, dark, or device appearance.

### loaded
Show confirmation that sample data was loaded.

### onClose
Close the dialog from Done, Escape, the backdrop, or the close button.

### onLocaleChange
Apply the selected language and reading direction immediately.

### onColorSchemeChange
Apply the selected appearance immediately.

### onLoadSamples
Add the fictional jobs and contacts while preserving existing records.

## Stories

### Preferences
The language, appearance, and sample data controls. The Settings button owns visibility, so open is excluded from Controls. Interactions call the callbacks shown in Actions; args control the selected values.

### Loaded
The confirmation after sample data is loaded.
