
# Dropdown Table Plugin

The **Dropdown Table Plugin** is a lightweight and customizable jQuery plugin designed to create interactive dropdowns with tabular data. It supports both static (predefined) and dynamic (AJAX) data sources, along with features like multiselect, keyboard navigation, customizable columns, and tag-based selection for preselected items.

---
## Features

- **Flexible Data Sources**: Supports static data or dynamic data fetching via AJAX.
- **Single and Multiselect Modes**: Choose between single selection or multiselect with tag-based display.
- **Customizable Columns**: Define column titles, data keys, widths, and custom rendering functions.
- **Sorting**: Enable sorting on specific columns with ascending/descending toggle.
- **Keyboard Navigation**: Navigate and select rows using arrow keys, Enter, and Escape.
- **Accessibility**: ARIA attributes for screen reader support and improved usability.
- **Theming**: Light and dark themes for customizable appearance.
- **Event Callbacks**: Hooks for selection, data load, open/close events, and error handling.
- **Custom Row Templates**: Define custom HTML for table rows.
- **Debounced Search**: Configurable debounce time for efficient AJAX searches.
- **Hidden Fields**: Store additional data (e.g., IDs) with selected rows.
- **Dynamic Updates**: Update data, settings, or theme programmatically.

---
## Installation

1. **Include jQuery**: Ensure jQuery is included in your project.
   ```html
   <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
   ```

2. **Include the Plugin**: Add the `jquery.dropdown.table.js` file to your project.
   ```html
   <script src="path/to/jquery.dropdown.table.js"></script>
   ```

3. **Include CSS (Optional)**: Add custom styles or use the provided CSS for theming.
   ```html
   <link rel="stylesheet" href="path/to/dropdown-table.css">
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

### AJAX with Multiselect Example
```javascript
$('#ajax-multiselect').dropdownTable({
  columns: [
    { title: 'Name', data: 'name' },
    { title: 'Email', data: 'email' },
    { title: 'Department', data: 'dept' }
  ],
  useAjax: true,
  ajaxURL: '/api/users/search',
  ajaxMethod: 'GET',
  ajaxParams: function(query) {
    return {
      search: query,
      department: 'active',
      fields: 'id,name,email,dept'
    };
  },
  multiselect: true,
  hiddenFields: ['id'],
  maxTagsDisplay: 3,
  minLength: 2,
  debounceTime: 500,
  onSelectionChange: function(selectedRows) {
    console.log('Selected count:', selectedRows.length);
  }
});
```

### Advanced Configuration Example
```javascript
$('#advanced-dropdown').dropdownTable({
  columns: [
    { title: '#', data: 'rowNum', width: '50px' },
    { title: 'Product', data: 'name', sortable: true },
    { title: 'Price', data: 'price', sortable: true, render: function(value) {
      return '$' + parseFloat(value).toFixed(2);
    }},
    { title: 'Category', data: 'category' }
  ],
  data: productData,
  multiselect: true,
  showRowNumbers: true,
  searchableColumns: ['name', 'category'],
  limit: 20,
  width: '600px',
  theme: 'light',
  rowTemplate: function(row, index) {
    return `
      <tr data-index="${index}" class="dropdown-row ${row.featured ? 'featured-row' : ''}">
        <td class="select-cell">
          <input type="checkbox" class="select-row" ${isRowSelected(row) ? 'checked' : ''}>
        </td>
        <td>${index + 1}</td>
        <td><strong>${row.name}</strong></td>
        <td class="price-cell">$${parseFloat(row.price).toFixed(2)}</td>
        <td><span class="category-badge">${row.category}</span></td>
      </tr>
    `;
  }
});
```

## API Methods

```javascript
const dropdown = $('#my-dropdown').dropdownTable(config);

// Update data
dropdown.updateData(newData);

// Clear selection
dropdown.clearSelection();

// Refresh dropdown
dropdown.refresh();

// Get selected rows
const selected = dropdown.getSelectedRows();

// Open/close dropdown
dropdown.open();
dropdown.close();

// Enable/disable dropdown
dropdown.enable();
dropdown.disable();

// Update settings
dropdown.updateSettings({ limit: 50 });

// Destroy plugin
dropdown.destroy();
```
---
## Configuration Options

| Option                | Type          | Default                     | Description                                                                 |
|-----------------------|---------------|-----------------------------|-----------------------------------------------------------------------------|
| `columns`             | Array         | `[]`                        | Array of column objects `{ title, data, width, sortable, render }`.          |
| `data`                | Array         | `[]`                        | Static data for the dropdown.                                               |
| `useAjax`             | Boolean       | `false`                     | Enable AJAX data fetching.                                                  |
| `ajaxURL`             | String        | `null`                      | URL for AJAX requests.                                                      |
| `ajaxMethod`          | String        | `'GET'`                     | HTTP method for AJAX (`GET` or `POST`).                                     |
| `ajaxParams`          | Object/Function | `{}`                     | Parameters for AJAX requests.                                               |
| `minLength`           | Number        | `3`                         | Minimum input length to trigger AJAX.                                        |
| `multiselect`         | Boolean       | `false`                     | Enable multiselect mode.                                                    |
| `hiddenFields`        | Array         | `[]`                        | Hidden data fields to include in rows.                                      |
| `defaultColumn`       | Number/String | `0`                         | Index or data key of the default column for input value.                    |
| `limit`               | Number        | `10`                        | Maximum number of rows to display.                                          |
| `debounceTime`        | Number        | `300`                       | Debounce time for input events (ms).                                        |
| `ariaEnabled`         | Boolean       | `true`                      | Enable ARIA attributes for accessibility.                                   |
| `theme`               | String        | `'light'`                   | Theme (`'light'` or `'dark'`).                                              |
| `rowTemplate`         | Function      | `null`                      | Custom function to render table rows.                                       |
| `onSelect`            | Function      | `null`                      | Callback on single row selection.                                           |
| `onSelectionChange`   | Function      | `null`                      | Callback on multiselect changes.                                            |
| `onOpen`              | Function      | `null`                      | Callback when dropdown opens.                                               |
| `onClose`             | Function      | `null`                      | Callback when dropdown closes.                                              |
| `onError`             | Function      | `null`                      | Callback on errors.                                                         |
| `onDataLoad`          | Function      | `null`                      | Callback when data is loaded.                                               |


---
## New Features in Version 2.0

1. **Theming Support**
   - Added support for `light` and `dark` themes via the `theme` option and `data-theme` attribute on the dropdown container.

2. **Advanced Keyboard Navigation**
   - Enhanced keyboard navigation with `ArrowDown`, `ArrowUp`, `Enter`, `Escape`, and `Tab` key support.
   - Added `enableKeyboardNavigation` option to toggle this feature.
   - Improved scrolling behavior to keep highlighted rows in view.

3. **Sorting Functionality**
   - Introduced sortable columns with the `sortable` property in column definitions.
   - Supports ascending and descending sorting for both numeric and string data.

4. **Multiselect Enhancements**
   - Added a "Select All" checkbox in the table header for multiselect mode.
   - Introduced `maxTagsDisplay` to limit the number of displayed tags and show a count for additional selections.
   - Added `closeOnSelect` option to control whether the dropdown closes after a single selection.

5. **Customizable Messages**
   - Replaced `emptyStateMessage` with `noResultsText` for no results and retained `emptyStateMessage` for initial empty states.
   - Configurable `loadingMessage` for custom loading indicators.

6. **Row Numbering**
   - Added `showRowNumbers` option to display row numbers in the first column.

7. **Clear Selection**
   - Introduced `allowClear` option to enable clearing of selections.
   - Added `clearSelection` API method to programmatically clear selected rows.

8. **Search Customization**
   - Added `searchableColumns` to specify which columns are searchable.
   - Introduced `caseSensitive` and `exactMatch` options for fine-tuned search behavior.

9. **Dynamic Width Handling**
   - Improved `width` option handling with automatic resizing on window resize events when set to `auto`.

10. **Extended API Methods**
    - Added new API methods: `selectAll`, `setValue`, `getValue`, `disable`, `enable`, `refresh`, `isOpen`, `getFilteredData`, `addToSelection`, `removeFromSelection`, and `setTheme`.
    - Enhanced `updateSettings` method to allow dynamic updates to columns and other settings.

11. **Improved AJAX Handling**
    - Added `ajaxHeaders` option to include custom headers in AJAX requests.
    - Improved AJAX response handling to support various response formats (e.g., `{ success, data }` or raw arrays).
    - Added `keepOpenWhileTyping` to maintain dropdown visibility during typing, even below `minLength`.

12. **Accessibility Enhancements**
    - Added `ariaEnabled` option to toggle ARIA attributes.
    - Improved ARIA attributes for better screen reader support (`aria-expanded`, `aria-haspopup`, `aria-owns`, etc.).

13. **Error Handling**
    - Added `onError` callback to handle AJAX or other errors.
    - Displays error state in the dropdown when AJAX requests fail.

14. **Auto Focus**
    - Added `autoFocus` option to automatically focus the input on initialization.

15. **Disabled State**
    - Added `disabled` option to disable the dropdown and its interactions.

16. **Placeholder Customization**
    - Added `placeholder` option to customize the input's placeholder text.

17. **Select All Text**
    - Added `selectAllText` option to customize the "Select All" checkbox label.

18. **Improved Tag Rendering**
    - Enhanced tag rendering with HTML escaping for security.
    - Added support for a "more" tag to indicate additional selections beyond `maxTagsDisplay`.

19. **Lazy Rendering Optimization**
    - Optimized row rendering to handle large datasets more efficiently by limiting displayed rows.

20. **Event-Driven Callbacks**
    - Added `onDataLoad` callback to notify when data is successfully loaded.

21. **Robust Destroy Method**
    - Improved `destroy` method to clean up event listeners, DOM elements, and pending AJAX requests.

22. **Responsive Design**
    - Added window resize event handling to adjust dropdown width dynamically.

23. **Custom Row Template Validation**
    - Enhanced validation for `rowTemplate` to ensure it returns valid HTML.

24. **Selection Persistence**
    - Improved handling of `selectedRows` to maintain selection state across data updates.

25. **Hidden Field Attributes**
    - Added data attributes for hidden fields on table rows for easier access.

---
## License

This plugin is open-source and available under the MIT License.

---
## Contributions

Contributions, bug reports, and suggestions are welcome! Please submit them via the [GitHub repository](https://github.com/nalindaDJ/dropdownTable).

Happy coding! 🚀
