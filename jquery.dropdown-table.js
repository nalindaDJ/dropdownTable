/*
 * jQuery Dropdown Table Plugin
 * Version: 2.0.0
 *
 * The Dropdown Table Plugin is a lightweight and customizable jQuery plugin designed to create interactive dropdowns with tabular data. 
 * It allows users to search, filter, and select items from a data table embedded in a dropdown. 
 * The plugin supports static data and dynamic data fetching via AJAX, customizable columns, keyboard navigation, and callback functions for selected rows.
 *
 * Features included v2 debounced search, responsive design, lazy rendering, ARIA accessibility, and extended API methods.
 *   
 * @author: Damith Jayasinghe
 * @license: MIT
 * @repository: https://github.com/nalindaDJ/dropdownTable
 */

(function ($) {
  $.fn.dropdownTable = function (options) {
    // Default settings
    const settings = $.extend({
      columns: [], // Array of column objects { title: "Column Name", data: "key" }
      data: [], // Static predefined values for the dropdown
      useAjax: false, // Whether to use AJAX for fetching data
      ajaxURL: null, // URL for fetching data via AJAX
      ajaxMethod: 'GET', // HTTP method for AJAX (GET or POST)
      ajaxParams: {}, // Dynamic parameters for the AJAX request (object or function)
      minLength: 3, // Minimum input length to trigger AJAX fetching
      hiddenFields: [], // Hidden keys (e.g., primary keys) to include in each row
      defaultColumn: 0, // Index or name of the column to use as the default for the input value
      limit: 10, // Maximum number of records to fetch/display
      debounceTime: 300, // Debounce time for input events
      ariaEnabled: true, // Enable ARIA attributes for accessibility
      onSelect: null, // Callback function when a row is selected
      onSelectionChange: null, // Callback when the selection changes (multiselect mode)
      onOpen: null, // Callback when the dropdown opens
      onClose: null, // Callback when the dropdown closes
      width: 'auto', // Width of the dropdown: 'auto' or a specific value (e.g., '300px')
      loadingMessage: '<div class="loading-spinner">Loading...</div>', // Default loading message/spinner
      emptyStateMessage: '<tr class="empty-state"><td colspan="100%">No data found.</td></tr>', // Default empty state message
      rowTemplate: null, // Optional custom row template (function or string)
      multiselect: false, // Enable or disable multiselect mode
      selectedRows: [], // Store selected rows (used in multiselect mode)
      useSelectElement: false, // Use a select element instead of a text input for storing selected values
      hidePreselected: false, // Optionally hide preselected rows from the dropdown
    }, options);

    return this.each(function () {
      const $originalElement = $(this);
      let $input;
      let $select;
      let $dropdownTable;
      let $tagsContainer;
      let timeout;
      let $loadingIndicator;

      // Initialize the dropdown HTML
      function initDropdown() {
        if (settings.useSelectElement) {
          // Replace the original element with a select element
          $select = $('<select></select>').attr('multiple', true).addClass('dropdown-table-select');
          $originalElement.replaceWith($select);
          $input = $('<input type="text" class="dropdown-filter" placeholder="Search...">').insertBefore($select);
        } else {
          $input = $originalElement;
        }

        // Create a container for tags
        $tagsContainer = $('<div class="dropdown-tags"></div>').insertBefore($input);

        $dropdownTable = $(
          `<div class="dropdown-table hidden" role="listbox">
            <table>
              <thead>
                <tr></tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>`
        ).appendTo($input.parent());

        $loadingIndicator = $(settings.loadingMessage).addClass('hidden');

        $loadingIndicator.appendTo($input.parent());

        // Set width
        if (settings.width === 'auto') {
          $dropdownTable.css('width', `${$input.outerWidth()}px`);
          $loadingIndicator.css('width', `${$input.outerWidth()}px`);
        } else {
          $dropdownTable.css('width', settings.width);
          $loadingIndicator.css('width', settings.width);
        }

        // Build table header
        const $tableHead = $dropdownTable.find('thead tr');
        if (settings.multiselect) {
          $tableHead.append('<th><input type="checkbox" class="select-all"></th>');
        }
        settings.columns.forEach(column => {
          $tableHead.append(`<th>${column.title}</th>`);
        });
      }

      function adjustScroll($row, $step) {
        let rowHeight = $row.outerHeight(); // Current row height
        let rowTop = $row.position().top; // Position relative to the container
        let dropdownHeight = $dropdownTable.outerHeight(); // Visible height of the dropdown container
        let scrollTop = $dropdownTable.scrollTop(); // Current scroll position
        let fixHeader = $dropdownTable.find('thead').outerHeight(); // Height of the header row

        // Scroll up
        if ($step == -1) {
            $dropdownTable.scrollTop(scrollTop - rowHeight); // Adjust by row height upwards
            // Ensure no over-scroll beyond the top of the dropdown
            if (rowTop < dropdownHeight) {
                $dropdownTable.scrollTop(0);
            }
        } 
        // Scroll down
        else if ($step == 1) {
          if ($dropdownTable.scrollTop() == 0 && ($row.position().top == fixHeader)) {
            $dropdownTable.scrollTop(0);
          } else {
            $dropdownTable.scrollTop(scrollTop + rowHeight); // Adjust by row height downwards
            // Ensure no over-scroll beyond the bottom of the dropdown
            let maxScroll = $dropdownTable.prop("scrollHeight") - dropdownHeight;
            if ($dropdownTable.scrollTop() > maxScroll) {
                $dropdownTable.scrollTop(maxScroll);
            }
          } 
        }
      }

      function renderTags() {
        $tagsContainer.empty();
        settings.selectedRows.forEach(row => {
          const tag = $(`<div class="dropdown-tag">${row[settings.columns[settings.defaultColumn].data]} <span class="remove-tag">&times;</span></div>`);
          $tagsContainer.append(tag);

          tag.find('.remove-tag').on('click', function () {
            removeTag(row);
          });
        });
      }

      function removeTag(row) {
        updateSelection(row, false);
        renderTags();
        renderRows(settings.data);
      }

      // Render rows in the dropdown
      function renderRows(data, append = false) {
        const $tableBody = $dropdownTable.find('tbody');
        if (!append) $tableBody.empty();

        if (data.length === 0) {
          $tableBody.append(settings.emptyStateMessage);
          return;
        }

        const limitedData = data.slice(0, settings.limit);

        limitedData.forEach((row, index) => {
          // Skip preselected rows if hidePreselected is enabled
          if (settings.hidePreselected && isRowPreselected(row)) {
            return;
          }

          let $tr;
          if (settings.rowTemplate && typeof settings.rowTemplate === 'function') {
            const rowHTML = settings.rowTemplate(row, index);
            if (rowHTML) {
              $tr = $(rowHTML);
            } else {
              console.error("rowTemplate function must return a valid HTML string.");
              return;
            }
          } else {
            $tr = $('<tr></tr>').attr('data-index', index).attr('role', 'option');

            if (settings.multiselect) {
              $tr.append('<td><input type="checkbox" class="select-row"></td>');
            }

            if (settings.hiddenFields.length > 0) {
              settings.hiddenFields.forEach(field => {
                $tr.attr(`data-hidden-${field}`, row[field] || '');
              });
            }

            settings.columns.forEach(column => {
              $tr.append(`<td>${row[column.data] || ''}</td>`);
            });
          }

          $tableBody.append($tr);

          $tr.on('mouseenter', function () {
            $tableBody.find('tr').removeClass('highlighted');
            $(this).addClass('highlighted');
          });
          $tr.on('mouseleave', function () {
            $(this).removeClass('highlighted');
          });

          $tr.on('click', function (e) {
            if (!settings.multiselect) {
              const selectedRow = { ...row };

              if (settings.hiddenFields.length > 0) {
                settings.hiddenFields.forEach(field => {
                  selectedRow[field] = $(this).attr(`data-hidden-${field}`);
                });
              }

              if (typeof settings.onSelect === 'function') {
                settings.onSelect(selectedRow);
              }
              closeDropdown();

              const defaultColumn = typeof settings.defaultColumn === 'string'
                ? settings.columns.find(col => col.data === settings.defaultColumn)
                : settings.columns[settings.defaultColumn];

              if (settings.useSelectElement) {
                const option = new Option(row[defaultColumn.data], row[settings.hiddenFields[0]] || '');
                $select.append(option);
              } else {
                $input.val(row[defaultColumn.data]);
              }
            } else {
              const checkbox = $(this).find('.select-row');
              checkbox.prop('checked', !checkbox.prop('checked'));
              updateSelection(row, checkbox.prop('checked'));
              e.stopPropagation();
            }
          });
        });
      }

      function isRowPreselected(row) {
        if (!settings.useSelectElement || !$select) {
          return false;
        }
        const value = row[settings.hiddenFields[0]];
        return $select.find(`option[value="${value}"]`).length > 0;
      }

      function updateSelection(row, isSelected) {
        if (isSelected) {
          if (!settings.selectedRows.includes(row)) {
            settings.selectedRows.push(row);
            if (settings.useSelectElement) {
              const defaultColumn = settings.columns[settings.defaultColumn].data;
              const option = new Option(row[defaultColumn], row[settings.hiddenFields[0]] || '');
              $select.append(option);
            }
          }
        } else {
          settings.selectedRows = settings.selectedRows.filter(r => r !== row);
          if (settings.useSelectElement) {
            $select.find(`option[value="${row[settings.hiddenFields[0]]}"]`).remove();
          }
        }

        if (typeof settings.onSelectionChange === 'function') {
          settings.onSelectionChange(settings.selectedRows);
        }

        renderTags();

        if (!settings.useSelectElement) {
          const summary = `${settings.selectedRows.length} items selected`;
          $input.val(summary);
        }
      }

      // Show loading indicator
      function showLoading() {
        $loadingIndicator.removeClass('hidden');
      }

      // Hide loading indicator
      function hideLoading() {
        $loadingIndicator.addClass('hidden');
      }

      // Debounced fetch data function
      function fetchData(query) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (query.length < settings.minLength) {
            $dropdownTable.addClass('hidden');
            hideLoading();
            return;
          }

          if (settings.useAjax && settings.ajaxURL) {
            showLoading();
            const ajaxParams = typeof settings.ajaxParams === 'function'
              ? settings.ajaxParams(query) // Dynamically generate parameters
              : { ...settings.ajaxParams }; // Static parameters

            ajaxParams.query = query; // Add the search query
            ajaxParams.limit = settings.limit; // Add the limit parameter

            // Perform the AJAX request
            $.ajax({
              url: settings.ajaxURL,
              method: settings.ajaxMethod,
              data: ajaxParams,
              success: function (response) {
                hideLoading();
                renderRows(response);
                openDropdown();
              },
              error: function () {
                hideLoading();
                console.error('Failed to fetch data via AJAX.');
              },
            });
          } else {
            const filteredData = settings.data.filter(row => {
              return settings.columns.some(column => {
                return (row[column.data] || '').toString().toLowerCase().includes(query.toLowerCase());
              });
            });
            renderRows(filteredData);
            openDropdown();
          }
        }, settings.debounceTime);
      }

      // Open the dropdown
      function openDropdown() {
        $dropdownTable.removeClass('hidden');
        if (typeof settings.onOpen === 'function') {
          settings.onOpen();
        }
      }

      // Close the dropdown
      function closeDropdown() {
        $dropdownTable.addClass('hidden');
        $loadingIndicator.addClass('hidden');
        if (typeof settings.onClose === 'function') {
          settings.onClose();
        }
      }

      // Keyboard navigation
      function handleKeyNavigation(e) {
        const $rows = $dropdownTable.find('tbody tr');
        const $highlighted = $rows.filter('.highlighted');

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          let $next = $highlighted.length ? $highlighted.next() : $rows.first();
          if ($next.length) {
            $highlighted.removeClass('highlighted');
            $next.addClass('highlighted');
            adjustScroll($next,1);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          let $prev = $highlighted.length ? $highlighted.prev() : $rows.last();
          if ($prev.length) {
            $highlighted.removeClass('highlighted');
            $prev.addClass('highlighted');
            adjustScroll($prev,-1);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if ($highlighted.length) {
            $highlighted.trigger('click');
          }
        } else if (e.key === 'Escape') {
          closeDropdown();
        }
      }

      // Initialize dropdown
      initDropdown();

      // Input events
      $input.on('input', function () {
        const query = $(this).val();
        fetchData(query);
      });

      $input.on('keydown', function (e) {
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
          handleKeyNavigation(e);
        }
      });

      // Show dropdown on focus
      $input.on('focus', function () {
        fetchData($(this).val());
      });

      // Hide dropdown on outside click
      $(document).on('click', function (e) {
        if (!$(e.target).closest($input.parent()).length) {
          closeDropdown();
        }
      });

      // Public API
      $.extend($input, {
        open: openDropdown,
        close: closeDropdown,
        updateData: function (newData) {
          settings.data = newData;
        },
        getSelectedRows: function () {
          return settings.selectedRows;
        },
        destroy: function () {
          $dropdownTable.remove();
          $loadingIndicator.remove();
          $input.off('input focus keydown');
        },
      });
    });
  };
}(jQuery));
