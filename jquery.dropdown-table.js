/*
 * jQuery Dropdown Table Plugin
 * Version: 1.0.0
 *
 * The Dropdown Table Plugin is a lightweight and customizable jQuery plugin designed to create interactive dropdowns with tabular data. 
 * It allows users to search, filter, and select items from a data table embedded in a dropdown. 
 * The plugin supports static data and dynamic data fetching via AJAX, customizable columns, keyboard navigation, and callback functions for selected rows.
 *
 * @author: Damith Nalinda Jayasinghe
 * @license: MIT
 * @repository: https://github.com/nalindaDJ/dropdownTable
 */

(function ($) {
  $.fn.dropdownTable = function (options) {
    // Default settings
    const settings = $.extend({
      columns: [], // Array of column objects { title: "Column Name", data: "key" }
      data: [], // Static predefined values for the dropdown
      ajax: null, // URL for fetching data via AJAX
      useAjax: false, // Whether to use AJAX for fetching data
      ajaxParams: {}, // Dynamic parameters for the AJAX request (object or function)
      hiddenField: null, // Hidden key (e.g., primary key) to include in each row
      limit: 10, // Maximum number of records to fetch/display
      onSelect: null, // Callback function when a row is selected
      width: 'auto', // Width of the dropdown: 'auto' or a specific value (e.g., '300px')
    }, options);

    return this.each(function () {
      const $input = $(this);
      let $dropdownTable;

      // Initialize the dropdown HTML
      function initDropdown() {
        $dropdownTable = $(`
          <div class="dropdown-table hidden">
            <table>
              <thead>
                <tr></tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `).appendTo($input.parent());

        // Set width
        if (settings.width === 'auto') {
          $dropdownTable.css('width', `${$input.outerWidth()}px`);
        } else {
          $dropdownTable.css('width', settings.width);
        }

        // Build table header
        const $tableHead = $dropdownTable.find('thead tr');
        settings.columns.forEach(column => {
          $tableHead.append(`<th>${column.title}</th>`);
        });
      }

      // Adjust scroll position to keep highlighted row visible
      function adjustScroll($row) {
        const $container = $dropdownTable;
        const containerTop = $container.scrollTop();
        const containerBottom = containerTop + $container.outerHeight();
        const rowTop = $row.position().top + $container.scrollTop();
        const rowBottom = rowTop + $row.outerHeight();

        if (rowBottom > containerBottom) {
          $container.scrollTop(containerTop + (rowBottom - containerBottom));
        } else if (rowTop < containerTop) {
          $container.scrollTop(rowTop);
        }
      }

      // Render rows in the dropdown
      function renderRows(data) {
        const $tableBody = $dropdownTable.find('tbody');
        $tableBody.empty();
        const limitedData = data.slice(0, settings.limit);

        limitedData.forEach((row, index) => {
          const $tr = $('<tr></tr>').attr('data-index', index);

          if (settings.hiddenField) {
            $tr.attr('data-hidden-value', row[settings.hiddenField]);
          }

          settings.columns.forEach(column => {
            $tr.append(`<td>${row[column.data] || ''}</td>`);
          });
          $tableBody.append($tr);

          $tr.on('mouseenter', function () {
            $tableBody.find('tr').removeClass('highlighted');
            $(this).addClass('highlighted');
          });
          $tr.on('mouseleave', function () {
            $(this).removeClass('highlighted');
          });
          $tr.on('click', function () {
            const selectedRow = { ...row };

            if (settings.hiddenField) {
              selectedRow[settings.hiddenField] = $(this).attr('data-hidden-value');
            }

            if (typeof settings.onSelect === 'function') {
              settings.onSelect(selectedRow);
            }
            $dropdownTable.addClass('hidden');
            $input.val(row[settings.columns[0].data]);
          });
        });
      }

      // Fetch data dynamically via AJAX
      function fetchData(query) {
        if (settings.useAjax && settings.ajax) {
          const ajaxParams = typeof settings.ajaxParams === 'function' 
            ? settings.ajaxParams(query) // Dynamically generate parameters
            : { ...settings.ajaxParams }; // Static parameters

          ajaxParams.query = query; // Add the search query
          ajaxParams.limit = settings.limit; // Add the limit parameter

          // Perform the AJAX request
          $.ajax({
            url: settings.ajax,
            method: 'GET',
            data: ajaxParams,
            success: function (response) {
              renderRows(response);
              $dropdownTable.removeClass('hidden');
            },
            error: function () {
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
          $dropdownTable.removeClass('hidden');
        }
      }

      // Keyboard navigation
      function handleKeyNavigation(e) {
        const $highlighted = $dropdownTable.find('tr.highlighted');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const $next = $highlighted.length ? $highlighted.next() : $dropdownTable.find('tbody tr:first-child');
          if ($next.length) {
            $highlighted.removeClass('highlighted');
            $next.addClass('highlighted');
            adjustScroll($next);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const $prev = $highlighted.length ? $highlighted.prev() : $dropdownTable.find('tbody tr:last-child');
          if ($prev.length) {
            $highlighted.removeClass('highlighted');
            $prev.addClass('highlighted');
            adjustScroll($prev);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if ($highlighted.length) {
            $highlighted.trigger('click');
          }
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
        if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
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
          $dropdownTable.addClass('hidden');
        }
      });
    });
  };
}(jQuery));
