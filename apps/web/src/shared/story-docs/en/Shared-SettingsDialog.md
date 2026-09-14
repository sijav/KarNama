Change the interface language from a dropdown whose options each carry their flag, choose the appearance, or add fictional records for testing. Changes apply instantly. Samples preserve existing jobs and contacts and do not duplicate records on repeated loads. Preferences persist after closing the dialog and reloading the app.

## Props

### open
Whether the settings dialog is visible.

### locale
The selected interface language, shown in the language dropdown with its flag.

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
The language, appearance, and sample data controls. The Settings button owns visibility, so open is excluded from Controls. Choosing the other language, the dark appearance and sample data calls the callbacks shown in Actions; args control the selected values.

### Loaded
The confirmation after sample data is loaded.

### PersianLight
The dialog in Persian and light: the language dropdown shows Persian with its flag, and its list both languages, each with its own flag.

### PersianDark
The same, in Persian and dark.

### EnglishLight
The same, in English and light.

### EnglishDark
The same, in English and dark.
