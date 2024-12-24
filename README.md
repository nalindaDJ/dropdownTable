
# Dropdown Table Plugin

The **Dropdown Table Plugin** is a lightweight and customizable jQuery plugin designed to create interactive dropdowns with tabular data. It supports both static (predefined) and dynamic (AJAX) data sources, along with features like multiselect, keyboard navigation, customizable columns, and tag-based selection for preselected items.

---
## Features

- Displays dropdown data in a table format for better visibility.
- Supports predefined data or dynamic data via AJAX.
- Keyboard navigation for enhanced usability.
- Multiselect functionality with dynamic tag-based selection display.
- Callback functions for row selection and selection changes.
- Hide preselected rows from the dropdown with an optional setting.
- Customizable row templates for advanced formatting.
- Conflict-free with prefixed CSS classes.
- Lazy rendering for better performance with large datasets.
- Enhanced ARIA accessibility for users.

---
## Installation

Include the plugin script and jQuery in your HTML file:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="path/to/dropdownTablePlugin.js"></script>
<link rel="stylesheet" href="path/to/dropdownTableStyles.css">
```
---
## Usage

### Basic Usage with Predefined Data
```javascript
$(document).ready(function () {
  $('#static-dropdown').dropdownTable({
    columns: [
      { title: 'Invoice No', data: 'invoiceNo' },
      { title: 'Invoice Date', data: 'invoiceDate' },
      { title: 'Amount', data: 'amount' },
    ],
    hiddenFields: ['id'], // Hidden field (e.g., primary key)
    data: [
      { id: 1, invoiceNo: 'INV2400099271', invoiceDate: '10/28/2024', amount: '33579.04' },
      { id: 2, invoiceNo: 'INV2400099225', invoiceDate: '10/28/2024', amount: '2892.73' },
      { id: 3, invoiceNo: 'INV2400099176', invoiceDate: '10/28/2024', amount: '37062.62' },
    ],
    useAjax: false,
    width: '700px',
    limit: 3, // Show only 3 results
    onSelect: function (selectedData) {
      console.log('Selected Data (Static):', selectedData);
    },
  });
});
```

### Dynamic Data Source (AJAX)
```javascript
$(document).ready(function () {
  $('#ajax-dropdown').dropdownTable({
    columns: [
      { title: 'Invoice No', data: 'invoiceNo' },
      { title: 'Invoice Date', data: 'invoiceDate' },
      { title: 'Amount', data: 'amount' },
      { title: 'Customer', data: 'customerName' },
    ],
    width: '800px',
    hiddenFields: ['id'], // Hidden field (e.g., primary key)
    ajaxURL: 'invoice.php', // Replace with your API endpoint
    useAjax: true,
    onSelect: function (selectedData) {
      console.log('Selected Data (AJAX):', selectedData);
    },
  });
});
```

### Multiselect with Tags
```javascript
$(document).ready(function () {
  $('#multiselect-dropdown').dropdownTable({
    columns: [
      { title: 'Invoice No', data: 'invoiceNo' },
      { title: 'Invoice Date', data: 'invoiceDate' },
      { title: 'Amount', data: 'amount' },
      { title: 'Customer', data: 'customerName' },
    ],
    data: [
      { id: 1, invoiceNo: 'INV001', invoiceDate: '2023-07-01', amount: '$500', customerName: 'John Doe' },
      { id: 2, invoiceNo: 'INV002', invoiceDate: '2023-07-02', amount: '$600', customerName: 'Jane Smith' },
    ],
    multiselect: true,
    hidePreselected: true, // Hide rows already selected
    onSelectionChange: function (selectedRows) {
      console.log('Selected Rows:', selectedRows);
    },
  });
});
```

---
## Options

| Option             | Type       | Default     | Description                                                                |
|--------------------|------------|-------------|----------------------------------------------------------------------------|
| `columns`          | Array      | `[]`        | Array of column definitions `{ title: "Column Name", data: "key" }`.       |
| `data`             | Array      | `[]`        | Predefined static data for the dropdown table.                             |
| `useAjax`          | Boolean    | `false`     | Set to `true` to enable dynamic data fetching via AJAX.                    |
| `ajaxURL`          | String     | `null`      | URL for fetching data dynamically.                                         |
| `ajaxParams`       | Function   | `{}`        | Function or object to provide additional parameters for the AJAX request.  |
| `hiddenFields`     | Array      | `[]`        | Fields to be stored as hidden attributes in rows.                          |
| `limit`            | Integer    | `10`        | Maximum number of rows to display.                                         |
| `onSelect`         | Function   | `null`      | Callback function triggered on row selection.                              |
| `onSelectionChange`| Function   | `null`      | Callback function triggered when selected rows change (multiselect).       |
| `width`            | String     | `auto`      | Width of the dropdown (`auto` or specific value like `300px`).             |
| `hidePreselected`  | Boolean    | `false`     | Optionally hide rows already preselected in the dropdown.                  |
| `multiselect`      | Boolean    | `false`     | Enable or disable multiselect functionality.                               |

---
## New Features in Version 2.0

- **Multiselect Support**: Allow users to select multiple rows and display tags for selected items.
- **Hide Preselected Rows**: Optionally hide rows that are already preselected in the dropdown.
- **Keyboard Navigation Enhancements**: Improved navigation with arrow keys and "Enter" for selection.
- **Tag-based Selection Display**: Show selected items as tags with options to remove them.
- **Lazy Rendering**: Optimized rendering for large datasets.
- **ARIA Accessibility**: Improved support for screen readers and accessible navigation.

---
## Known Issues

1. **Large Data Sets**: Rendering very large predefined datasets may impact performance. Consider using AJAX for such scenarios.
2. **Custom Styling**: The default styles may require additional customization to fit specific UI designs.

---
## Suggestions for Further Improvement

- Add support for server-side pagination when handling very large datasets.
- Provide a default theme or better integration with popular CSS frameworks like Bootstrap.

---
## License

This plugin is open-source and available under the MIT License.

---
## Contributions

Contributions, bug reports, and suggestions are welcome! Please submit them via the [GitHub repository](https://github.com/nalindaDJ/dropdownTable).

Happy coding! 🚀
