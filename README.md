# Dropdown Table Plugin

The **Dropdown Table Plugin** is a lightweight jQuery plugin that creates a dropdown with a tabular interface, making it easy to display and select from detailed data. It supports both static (predefined) data and dynamic (AJAX) data sources, along with keyboard navigation, customizable columns, and selection callbacks.

---
## Features

- Displays dropdown data in a table format for better visibility.
- Supports predefined data or dynamic data via AJAX.
- Keyboard navigation for enhanced usability.
- Callback function on row selection.
- Customizable columns and hidden fields.
- Conflict-free with prefixed CSS classes.

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
      hiddenField: 'id', // Hidden field (e.g., primary key)
      data: [
        { id: 1, invoiceNo: 'INV2400099271', invoiceDate: '10/28/2024', amount: '33579.04' },
        { id: 2, invoiceNo: 'INV2400099225', invoiceDate: '10/28/2024', amount: '2892.73' },
        { id: 3, invoiceNo: 'INV2400099176', invoiceDate: '10/28/2024', amount: '37062.62' },
        { id: 4, invoiceNo: 'INV2400099000', invoiceDate: '10/27/2024', amount: '12345.67' },
        { id: 5, invoiceNo: 'INV2400098555', invoiceDate: '10/26/2024', amount: '54321.00' },
      ],
      useAjax: false,
      width:'700px',
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
      width:'800px',
      hiddenField: 'id', // Hidden field (e.g., primary key)
      ajax: 'invoice.php', // Replace with your API endpoint
      useAjax: true,
      onSelect: function (selectedData) {
        console.log('Selected Data (AJAX):', selectedData);
      },
    });
});
```
---
## Options

| Option           | Type       | Default | Description                                                                |
|------------------|------------|---------|----------------------------------------------------------------------------|
| `columns`        | Array      | `[]`    | Array of column definitions `{ title: "Column Name", data: "key" }`.       |
| `data`           | Array      | `[]`    | Predefined static data for the dropdown table.                             |
| `useAjax`        | Boolean    | `false` | Set to `true` to enable dynamic data fetching via AJAX.                    |
| `ajax`           | String     | `null`  | URL for fetching data dynamically.                                         |
| `ajaxParams`     | Function   | `{}`    | Function or object to provide additional parameters for the AJAX request.  |
| `hiddenField`    | String     | `null`  | Field name to be stored as a hidden attribute in rows.                     |
| `limit`          | Integer    | `10`    | Maximum number of rows to display.                                         |
| `onSelect`       | Function   | `null`  | Callback function triggered on row selection.                              |
| `width`          | String     | `auto`  | Width of the dropdown (`auto` or specific value like `300px`).             |

---
## Known Issues

1. **Dropdown Overlap**: If multiple dropdowns are used in close proximity, they might overlap visually. Ensure proper CSS or spacing between input fields.
2. **Large Data Sets**: Rendering very large predefined datasets may impact performance. Consider using AJAX for such scenarios.
3. **Custom Styling**: The default styles may require additional customization to fit specific UI designs.

---

## Suggestions for Improvement

- Add support for pagination when handling large data sets.
- Introduce multi-select functionality for use cases requiring multiple selections.
- Enhance keyboard navigation with support for skipping multiple rows.
- Provide a default theme or better integration with popular CSS frameworks like Bootstrap.

---
## License

This plugin is open-source and available under the MIT License.

---
## Contributions

Contributions, bug reports, and suggestions are welcome! Please submit them via the [GitHub repository](https://github.com/nalindaDJ/dropdownTable).

Happy coding! 🚀



