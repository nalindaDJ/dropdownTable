/*
 * jQuery Dropdown Table Plugin - v2.2
 * A versatile jQuery plugin that transforms input fields into interactive dropdown tables with support for static or AJAX data, 
 * single or multiselect modes, customizable columns, and keyboard navigation. Features include theming, accessibility, sorting, 
 * and event-driven callbacks for seamless integration.
 * @author: Damith Jayasinghe
 * @license: MIT
 * @version: 2.2.0
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
            ajaxHeaders: {}, // Additional headers for AJAX requests
            minLength: 3, // Minimum input length to trigger AJAX fetching
            keepOpenWhileTyping: true, // Keep dropdown open while typing even if below minLength
            hiddenFields: [], // Hidden keys (e.g., primary keys) to include in each row
            defaultColumn: 0, // Index or name of the column to use as the default for the input value
            limit: 10, // Maximum number of records to fetch/display
            debounceTime: 300, // Debounce time for input events
            ariaEnabled: true, // Enable ARIA attributes for accessibility
            onSelect: null, // Callback function when a row is selected
            onSelectionChange: null, // Callback when the selection changes (multiselect mode)
            onOpen: null, // Callback when the dropdown opens
            onClose: null, // Callback when the dropdown closes
            onError: null, // Callback when an error occurs
            onDataLoad: null, // Callback when data is loaded
            width: 'auto', // Width of the dropdown: 'auto' or a specific value (e.g., '300px')
            loadingMessage: '<div class="loading-spinner">Loading...</div>', // Default loading message/spinner
            emptyStateMessage: 'No data found', // Default empty state message
            noResultsText: 'No results found', // Text when no results
            rowTemplate: null, // Optional custom row template (function or string)
            multiselect: false, // Enable or disable multiselect mode
            selectedRows: [], // Store selected rows (used in multiselect mode)
            useSelectElement: false, // Use a select element instead of a text input for storing selected values
            hidePreselected: false, // Optionally hide preselected rows from the dropdown
            searchableColumns: [], // Specific columns to search in (empty means all columns)
            enableKeyboardNavigation: true, // Enable/disable keyboard navigation
            closeOnSelect: true, // Close dropdown after single selection
            placeholder: 'Search...', // Placeholder text for input
            selectAllText: 'Select All', // Text for select all checkbox
            maxTagsDisplay: 3, // Maximum tags to display before showing count
            caseSensitive: false, // Case-sensitive search
            exactMatch: false, // Exact match vs contains search
            autoFocus: false, // Autofocus on init
            disabled: false, // Disable the dropdown
            showRowNumbers: false, // Show row numbers in first column
            allowClear: true, // Allow clearing selection
            theme: 'light' // Theme: 'light' or 'dark'
        }, options);

        return this.each(function () {
            const $originalElement = $(this);
            let $input;
            let $select;
            let $dropdownTable;
            let $tagsContainer;
            let timeout;
            let $loadingIndicator;
            let currentHighlightIndex = -1;
            let isOpen = false;
            let filteredData = [];
            let currentRequest = null;

            // Initialize the dropdown HTML
            function initDropdown() {
                // Create wrapper container
                const $wrapper = $('<div class="dropdown-container"></div>');
                $wrapper.attr('data-theme', settings.theme);
                $originalElement.wrap($wrapper);

                if (settings.useSelectElement) {
                    // Replace the original element with a select element
                    $select = $('<select></select>')
                        .attr('multiple', settings.multiselect)
                        .addClass('dropdown-table-select')
                        .css('display', 'none');
                    $originalElement.after($select);

                    $input = $('<input type="text" class="dropdown-filter">')
                        .attr('placeholder', settings.placeholder)
                        .insertAfter($select);
                } else {
                    $input = $originalElement;
                    if (!$input.attr('placeholder')) {
                        $input.attr('placeholder', settings.placeholder);
                    }
                }

                // Apply disabled state
                if (settings.disabled) {
                    $input.prop('disabled', true);
                }

                // Create a container for tags (multiselect mode)
                if (settings.multiselect) {
                    $tagsContainer = $('<div class="dropdown-tags"></div>').insertAfter($input);
                    $tagsContainer.hide(); // Initially hidden
                }

                // Create dropdown table structure
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

                // Create loading indicator
                $loadingIndicator = $(settings.loadingMessage)
                    .addClass('hidden loading-indicator')
                    .appendTo($input.parent());

                // Set width
                setDropdownWidth();

                // Build table header
                buildTableHeader();

                // Setup ARIA attributes
                setupAccessibility();

                // Auto focus if enabled
                if (settings.autoFocus && !settings.disabled) {
                    $input.focus();
                }

                // Bind events
                bindEvents();
            }

            function setDropdownWidth() {
                let width = settings.width;
                if (width === 'auto') {
                    width = $input.outerWidth() + 'px';
                }
                $dropdownTable.css('width', width);
                $loadingIndicator.css('width', width);
            }

            function buildTableHeader() {
                const $tableHead = $dropdownTable.find('thead tr');
                $tableHead.empty();

                if (settings.multiselect) {
                    const $selectAllCell = $('<th class="select-all-cell"></th>');
                    const $selectAllCheckbox = $('<input type="checkbox" class="select-all">')
                        .attr('title', settings.selectAllText)
                        .attr('aria-label', settings.selectAllText);
                    $selectAllCell.append($selectAllCheckbox);
                    $tableHead.append($selectAllCell);
                }

                if (settings.showRowNumbers) {
                    const $numberCell = $('<th class="row-number-cell">#</th>');
                    $tableHead.append($numberCell);
                }

                settings.columns.forEach(column => {
                    const $headerCell = $('<th></th>')
                        .text(column.title)
                        .addClass('header-cell');

                    if (column.width) {
                        $headerCell.css('width', column.width);
                    }

                    if (column.sortable) {
                        $headerCell.addClass('sortable').attr('data-column', column.data);
                    }

                    $tableHead.append($headerCell);
                });
            }

            function setupAccessibility() {
                if (!settings.ariaEnabled) return;

                const dropdownId = 'dropdown-' + Math.random().toString(36).substr(2, 9);
                $dropdownTable.attr('id', dropdownId);

                $input
                    .attr('aria-expanded', 'false')
                    .attr('aria-haspopup', 'listbox')
                    .attr('aria-owns', dropdownId)
                    .attr('autocomplete', 'off')
                    .attr('role', 'combobox');
            }

            function bindEvents() {
                // Input events
                $input.on('input', handleInput);
                $input.on('focus', handleFocus);
                $input.on('keydown', handleKeydown);
                $input.on('blur', handleBlur);

                // Dropdown events
                $dropdownTable.on('click', '.dropdown-row', handleRowClick);
                $dropdownTable.on('change', '.select-row', handleCheckboxChange);
                $dropdownTable.on('change', '.select-all', handleSelectAllChange);
                $dropdownTable.on('click', '.sortable', handleSort);

                // Tag removal
                if ($tagsContainer) {
                    $tagsContainer.on('click', '.remove-tag', handleTagRemove);
                }

                // Outside click to close
                $(document).on('click', function (e) {
                    if (!$(e.target).closest($input.parent()).length) {
                        closeDropdown();
                    }
                });

                // Window resize
                $(window).on('resize', function() {
                    if (settings.width === 'auto') {
                        setDropdownWidth();
                    }
                });
            }

            function handleInput(e) {
                if (settings.disabled) return;
                const query = $(e.target).val();

                // Don't search if input shows selection count in multiselect mode
                if (settings.multiselect && /^\d+\s+items?\s+selected$/.test(query)) {
                    return;
                }

                // If user is typing and we have existing results, keep dropdown open
                if (query.length > 0 && isOpen && filteredData.length > 0) {
                    // Filter existing results locally while waiting for new AJAX response
                    const localFiltered = filteredData.filter(row => {
                        return settings.columns.some(column => {
                            const value = row[column.data] || '';
                            return value.toString().toLowerCase().includes(query.toLowerCase());
                        });
                    });

                    if (localFiltered.length > 0) {
                        renderRows(localFiltered);
                    }
                }

                debouncedFetch(query);
            }

            function handleFocus() {
                if (settings.disabled) return;

                const currentValue = $input.val();

                if (settings.multiselect && settings.selectedRows.length > 0) {
                    // In multiselect mode, show dropdown with current data if available
                    if (filteredData.length > 0) {
                        openDropdown();
                    } else if (currentValue && currentValue.length >= settings.minLength) {
                        fetchData(currentValue);
                    } else {
                        fetchData('');
                    }
                } else {
                    // In single select mode, fetch data based on current input
                    if (currentValue && !/^\d+\s+items?\s+selected$/.test(currentValue)) {
                        fetchData(currentValue);
                    } else {
                        fetchData('');
                    }
                }
            }

            function handleBlur(e) {
                // Delay close to allow for dropdown interactions
                setTimeout(() => {
                    if (!$dropdownTable.is(':hover') && !$(document.activeElement).closest($dropdownTable).length) {
                        closeDropdown();
                    }
                }, 150);
            }

            function handleKeydown(e) {
                if (!settings.enableKeyboardNavigation) return;

                const { key } = e;

                switch (key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (isOpen) {
                            navigateRows(1);
                        } else {
                            openDropdown();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (isOpen) {
                            navigateRows(-1);
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (isOpen) {
                            selectHighlightedRow();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        closeDropdown();
                        $input.blur();
                        break;
                    case 'Tab':
                        if (isOpen) {
                            closeDropdown();
                        }
                        break;
                }
            }

            function handleRowClick(e) {
                e.preventDefault();
                e.stopPropagation();

                const $row = $(e.currentTarget);
                const index = parseInt($row.attr('data-index'));
                const rowData = filteredData[index];

                if (!rowData) return;

                if (settings.multiselect) {
                    // Toggle selection
                    const $checkbox = $row.find('.select-row');
                    const currentlySelected = $checkbox.prop('checked');
                    const newState = !currentlySelected;

                    $checkbox.prop('checked', newState);
                    updateSelection(rowData, newState);
                } else {
                    selectSingleRow(rowData, $row);
                }
            }

            function handleCheckboxChange(e) {
                e.stopPropagation();

                const $checkbox = $(e.target);
                const $row = $checkbox.closest('tr');
                const index = parseInt($row.attr('data-index'));
                const rowData = filteredData[index];

                if (rowData) {
                    const isChecked = $checkbox.prop('checked');
                    updateSelection(rowData, isChecked);
                }
            }

            function handleSelectAllChange(e) {
                e.stopPropagation();

                const isChecked = $(e.target).prop('checked');
                const visibleRows = filteredData.filter(row => !settings.hidePreselected || !isRowSelected(row));

                if (!isChecked) {
                    // Unselect all visible rows
                    visibleRows.forEach(row => {
                        updateSelection(row, false);
                    });
                } else {
                    // Select all visible rows
                    visibleRows.forEach(row => {
                        updateSelection(row, true);
                    });
                }

                renderRows(filteredData);
            }

            function handleSort(e) {
                const $cell = $(e.currentTarget);
                const column = $cell.attr('data-column');
                sortByColumn(column);
            }

            function handleTagRemove(e) {
                e.stopPropagation();
                const index = parseInt($(e.target).attr('data-index'));
                removeTag(index);
            }

            function debouncedFetch(query) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fetchData(query);
                }, settings.debounceTime);
            }

            function fetchData(query) {
                // Cancel previous request
                if (currentRequest) {
                    currentRequest.abort();
                    currentRequest = null;
                }

                if (settings.useAjax && settings.ajaxURL) {
                    // For AJAX, check minimum length
                    if (query.length < settings.minLength) {
                        if (query.length === 0) {
                            // Empty query - close dropdown
                            closeDropdown();
                        } else if (settings.keepOpenWhileTyping && isOpen && filteredData.length > 0) {
                            // Keep dropdown open with existing filtered data (no new AJAX request)
                            const localFiltered = filteredData.filter(row => {
                                return settings.columns.some(column => {
                                    const value = row[column.data] || '';
                                    return value.toString().toLowerCase().includes(query.toLowerCase());
                                });
                            });
                            renderRows(localFiltered);
                            // Keep dropdown open since it's already open
                        } else {
                            // Close dropdown if not keeping open while typing
                            closeDropdown();
                        }
                        return;
                    }

                    // Query meets minimum length - perform AJAX search
                    // Don't open dropdown here - wait for response
                    performAjaxSearch(query);
                } else {
                    // Local search - can open immediately
                    performLocalSearch(query);
                }
            }

            function performAjaxSearch(query) {
                showLoading();

                const ajaxParams = typeof settings.ajaxParams === 'function'
                    ? settings.ajaxParams(query)
                    : { ...settings.ajaxParams };

                ajaxParams.query = query;
                ajaxParams.limit = settings.limit;

                currentRequest = $.ajax({
                    url: settings.ajaxURL,
                    method: settings.ajaxMethod,
                    data: ajaxParams,
                    headers: settings.ajaxHeaders,
                    success: function (response) {

                        hideLoading();

                        // Handle different response formats
                        let data = response;
                        if (response && typeof response === 'object') {
                            if (response.success !== undefined) {
                                if (response.success) {
                                    data = response.data || [];
                                } else {
                                    handleError(new Error(response.error || 'Request failed'));
                                    return;
                                }
                            } else if (response.data) {
                                data = response.data;
                            } else if (Array.isArray(response)) {
                                data = response;
                            }
                        }

                        // Update filtered data
                        filteredData = Array.isArray(data) ? data.slice(0, settings.limit) : [];
                        currentHighlightIndex = -1;

                        // Render rows
                        renderRows(filteredData);
                        updateEmptyState();

                        // Force show dropdown
                        $dropdownTable.removeClass('hidden');
                        isOpen = true;

                        if (settings.ariaEnabled) {
                            $input.attr('aria-expanded', 'true');
                        }

                        if (settings.onDataLoad) {
                            settings.onDataLoad(data);
                        }

                        if (typeof settings.onOpen === 'function') {
                            settings.onOpen();
                        }
                    },
                    error: function (xhr, status, error) {
                        hideLoading();
                        if (status !== 'abort') {
                            const errorMsg = `Failed to fetch data: ${error}`;
                            handleError(new Error(errorMsg));

                            // Show error state in dropdown
                            filteredData = [];
                            renderRows([]);

                            // Force show dropdown with error
                            $dropdownTable.removeClass('hidden');
                            isOpen = true;

                            if (settings.ariaEnabled) {
                                $input.attr('aria-expanded', 'true');
                            }
                        }
                    },
                    complete: function() {
                        currentRequest = null;
                    }
                });
            }

            function performLocalSearch(query) {
                let filtered = [...settings.data];

                if (query && query.trim()) {
                    const searchTerm = settings.caseSensitive ? query : query.toLowerCase();
                    const searchColumns = settings.searchableColumns.length > 0
                        ? settings.searchableColumns
                        : settings.columns.map(col => col.data);

                    filtered = settings.data.filter(row => {
                        return searchColumns.some(columnData => {
                            const value = row[columnData] || '';
                            const searchValue = settings.caseSensitive ? value.toString() : value.toString().toLowerCase();

                            return settings.exactMatch
                                ? searchValue === searchTerm
                                : searchValue.includes(searchTerm);
                        });
                    });
                }

                updateFilteredData(filtered);
                openDropdown();
            }

            function updateFilteredData(data) {
                filteredData = data.slice(0, settings.limit);
                currentHighlightIndex = -1;
                renderRows(filteredData);
                updateEmptyState();
            }

            function renderRows(data) {
                const $tableBody = $dropdownTable.find('tbody');
                $tableBody.empty();

                if (!data || data.length === 0) {
                    const colspan = getColumnCount();
                    $tableBody.html(`<tr class="empty-state"><td colspan="${colspan}">${settings.noResultsText}</td></tr>`);
                    return;
                }

                data.forEach((row, index) => {
                    // Skip preselected rows if hidePreselected is enabled
                    if (settings.hidePreselected && isRowSelected(row)) {
                        return;
                    }

                    let $tr;

                    // Use custom row template if provided
                    if (settings.rowTemplate && typeof settings.rowTemplate === 'function') {
                        const rowHTML = settings.rowTemplate(row, index);
                        if (rowHTML) {
                            $tr = $(rowHTML);
                            $tr.attr('data-index', index).addClass('dropdown-row');
                        } else {
                            console.error("rowTemplate function must return a valid HTML string.");
                            return;
                        }
                    } else {
                        $tr = createDefaultRow(row, index);
                    }

                    // Add data attributes for hidden fields
                    if (settings.hiddenFields.length > 0) {
                        settings.hiddenFields.forEach(field => {
                            $tr.attr(`data-hidden-${field}`, row[field] || '');
                        });
                    }

                    // Add selection class if row is selected
                    if (isRowSelected(row)) {
                        $tr.addClass('selected-row');
                    }

                    $tableBody.append($tr);
                });

                // Update select all checkbox state
                updateSelectAllCheckbox();
            }

            function createDefaultRow(row, index) {
                const $tr = $('<tr></tr>')
                    .attr('data-index', index)
                    .attr('role', 'option')
                    .addClass('dropdown-row');

                // Add select checkbox for multiselect
                if (settings.multiselect) {
                    const $selectCell = $('<td class="select-cell"></td>');
                    const $checkbox = $('<input type="checkbox" class="select-row">')
                        .prop('checked', isRowSelected(row))
                        .attr('aria-label', 'Select row');
                    $selectCell.append($checkbox);
                    $tr.append($selectCell);
                }

                // Add row number if enabled
                if (settings.showRowNumbers) {
                    const $numberCell = $('<td class="row-number-cell"></td>').text(index + 1);
                    $tr.append($numberCell);
                }

                // Add data columns
                settings.columns.forEach(column => {
                    const $cell = $('<td></td>').addClass('data-cell');
                    const cellValue = row[column.data] || '';

                    // Apply custom cell renderer if provided
                    if (column.render && typeof column.render === 'function') {
                        $cell.html(column.render(cellValue, row, index));
                    } else {
                        $cell.text(cellValue);
                    }

                    $tr.append($cell);
                });

                return $tr;
            }

            function getColumnCount() {
                let count = settings.columns.length;
                if (settings.multiselect) count++;
                if (settings.showRowNumbers) count++;
                return count;
            }

            function isRowSelected(row) {
                if (!settings.multiselect) return false;

                const hiddenField = settings.hiddenFields[0];
                if (hiddenField) {
                    return settings.selectedRows.some(selectedRow =>
                        selectedRow[hiddenField] === row[hiddenField]
                    );
                }

                return settings.selectedRows.includes(row);
            }

            function updateSelection(row, isSelected) {
                if (!settings.multiselect) return;

                const hiddenField = settings.hiddenFields[0];

                if (isSelected) {
                    // Add to selection if not already selected
                    if (!isRowSelected(row)) {
                        settings.selectedRows.push(row);

                        // Add to select element if using
                        if (settings.useSelectElement && $select && hiddenField) {
                            const defaultColumn = getDefaultColumn();
                            const option = new Option(row[defaultColumn.data], row[hiddenField]);
                            $select.append(option);
                        }
                    }
                } else {
                    // Remove from selection
                    if (hiddenField) {
                        settings.selectedRows = settings.selectedRows.filter(r =>
                            r[hiddenField] !== row[hiddenField]
                        );

                        // Remove from select element
                        if (settings.useSelectElement && $select) {
                            $select.find(`option[value="${row[hiddenField]}"]`).remove();
                        }
                    } else {
                        const index = settings.selectedRows.indexOf(row);
                        if (index > -1) {
                            settings.selectedRows.splice(index, 1);
                        }
                    }
                }

                renderTags();
                updateInputValue();
                updateSelectAllCheckbox();

                if (typeof settings.onSelectionChange === 'function') {
                    settings.onSelectionChange(settings.selectedRows);
                }
            }

            function renderTags() {
                if (!settings.multiselect || !$tagsContainer) return;

                $tagsContainer.empty();

                const maxDisplay = settings.maxTagsDisplay;
                const selectedCount = settings.selectedRows.length;
                const tagsToShow = Math.min(maxDisplay, selectedCount);

                for (let i = 0; i < tagsToShow; i++) {
                    const row = settings.selectedRows[i];
                    const defaultColumn = getDefaultColumn();
                    const displayText = row[defaultColumn.data] || '';

                    const $tag = $(`
            <div class="dropdown-tag">
              <span class="tag-text">${escapeHtml(displayText)}</span>
              <span class="remove-tag" data-index="${i}" title="Remove">&times;</span>
            </div>
          `);

                    $tagsContainer.append($tag);
                }

                // Show count if more items selected
                if (selectedCount > maxDisplay) {
                    const $moreTag = $(`
            <div class="dropdown-tag dropdown-tag-more">
              +${selectedCount - maxDisplay} more
            </div>
          `);
                    $tagsContainer.append($moreTag);
                }

                // Show/hide tags container
                if (selectedCount > 0) {
                    $tagsContainer.show();
                } else {
                    $tagsContainer.hide();
                }
            }

            function updateInputValue() {
                if (settings.multiselect) {
                    const count = settings.selectedRows.length;
                    if (count > 0) {
                        $input.val(`${count} item${count !== 1 ? 's' : ''} selected`);
                        $input.addClass('multiselect-active');
                    } else {
                        $input.val('');
                        $input.removeClass('multiselect-active');
                    }
                }
            }

            function updateSelectAllCheckbox() {
                const $selectAll = $dropdownTable.find('.select-all');
                if (!$selectAll.length || !filteredData.length) return;

                const visibleRows = filteredData.filter(row => !settings.hidePreselected || !isRowSelected(row));
                const selectedCount = visibleRows.filter(row => isRowSelected(row)).length;

                if (selectedCount === 0) {
                    $selectAll.prop('checked', false);
                    $selectAll.prop('indeterminate', false);
                } else if (selectedCount === visibleRows.length) {
                    $selectAll.prop('checked', true);
                    $selectAll.prop('indeterminate', false);
                } else {
                    $selectAll.prop('checked', false);
                    $selectAll.prop('indeterminate', true);
                }
            }

            function removeTag(index) {
                if (index >= 0 && index < settings.selectedRows.length) {
                    const removedRow = settings.selectedRows[index];
                    updateSelection(removedRow, false);

                    // Re-render the dropdown to update checkboxes
                    renderRows(filteredData);
                }
            }

            function selectSingleRow(rowData, $row) {
                const defaultColumn = getDefaultColumn();
                const displayValue = rowData[defaultColumn.data] || '';

                // Set input value
                $input.val(displayValue);

                // Add hidden field data
                const enrichedData = { ...rowData };
                if (settings.hiddenFields.length > 0) {
                    settings.hiddenFields.forEach(field => {
                        enrichedData[field] = $row.attr(`data-hidden-${field}`) || rowData[field];
                    });
                }

                // Update select element if using
                if (settings.useSelectElement && $select && settings.hiddenFields[0]) {
                    $select.empty();
                    const option = new Option(displayValue, enrichedData[settings.hiddenFields[0]]);
                    $select.append(option);
                }

                // Trigger callback
                if (typeof settings.onSelect === 'function') {
                    settings.onSelect(enrichedData);
                }

                // Close dropdown if configured
                if (settings.closeOnSelect) {
                    closeDropdown();
                }
            }

            function navigateRows(direction) {
                const $rows = $dropdownTable.find('tbody tr:not(.empty-state)');
                if ($rows.length === 0) return;

                // Remove current highlight
                $rows.removeClass('highlighted');

                // Calculate new index
                if (direction === 1) { // Down
                    currentHighlightIndex = Math.min(currentHighlightIndex + 1, $rows.length - 1);
                } else { // Up
                    currentHighlightIndex = Math.max(currentHighlightIndex - 1, 0);
                }

                // Apply new highlight
                const $newRow = $rows.eq(currentHighlightIndex);
                $newRow.addClass('highlighted');
                scrollToRow($newRow);
            }

            function selectHighlightedRow() {
                if (currentHighlightIndex >= 0) {
                    const $rows = $dropdownTable.find('tbody tr:not(.empty-state)');
                    if (currentHighlightIndex < $rows.length) {
                        $rows.eq(currentHighlightIndex).trigger('click');
                    }
                }
            }

            function scrollToRow($row) {
                if (!$row.length) return;

                const dropdown = $dropdownTable[0];
                const rowTop = $row[0].offsetTop;
                const rowHeight = $row.outerHeight();
                const dropdownHeight = $dropdownTable.outerHeight();
                const scrollTop = dropdown.scrollTop;
                const headerHeight = $dropdownTable.find('thead').outerHeight();

                if (rowTop < scrollTop + headerHeight) {
                    dropdown.scrollTop = rowTop - headerHeight;
                } else if (rowTop + rowHeight > scrollTop + dropdownHeight) {
                    dropdown.scrollTop = rowTop + rowHeight - dropdownHeight;
                }
            }

            function sortByColumn(columnData) {
                const column = settings.columns.find(col => col.data === columnData);
                if (!column) return;

                const isAsc = column.sortDirection !== 'asc';
                column.sortDirection = isAsc ? 'asc' : 'desc';

                filteredData.sort((a, b) => {
                    const aVal = a[columnData] || '';
                    const bVal = b[columnData] || '';

                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return isAsc ? aVal - bVal : bVal - aVal;
                    }

                    const aStr = aVal.toString().toLowerCase();
                    const bStr = bVal.toString().toLowerCase();

                    if (isAsc) {
                        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
                    } else {
                        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
                    }
                });

                updateSortHeaders(columnData, column.sortDirection);
                renderRows(filteredData);
            }

            function updateSortHeaders(sortedColumn, direction) {
                $dropdownTable.find('thead th[data-column]').each(function() {
                    const $header = $(this);
                    const column = $header.attr('data-column');

                    $header.removeClass('sorted-asc sorted-desc');

                    if (column === sortedColumn) {
                        $header.addClass(`sorted-${direction}`);
                        $header.attr('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
                    } else {
                        $header.attr('aria-sort', 'none');
                    }
                });
            }

            function openDropdown(force = false) {
                if (isOpen || settings.disabled) return;

                // Don't open if input is not focused unless forced
                if (!force && !$input.is(':focus')) {
                    return;
                }

                isOpen = true;
                $dropdownTable.removeClass('hidden');

                if (settings.ariaEnabled) {
                    $input.attr('aria-expanded', 'true');
                }

                if (typeof settings.onOpen === 'function') {
                    settings.onOpen();
                }
            }

            function closeDropdown() {
                if (!isOpen) return;

                isOpen = false;
                $dropdownTable.addClass('hidden');
                $loadingIndicator.addClass('hidden');
                currentHighlightIndex = -1;

                // Remove highlighting
                $dropdownTable.find('tr').removeClass('highlighted');

                if (settings.ariaEnabled) {
                    $input.attr('aria-expanded', 'false');
                }

                if (typeof settings.onClose === 'function') {
                    settings.onClose();
                }
            }

            function showLoading() {
                $loadingIndicator.removeClass('hidden');
                $dropdownTable.addClass('hidden');
            }

            function hideLoading() {
                $loadingIndicator.addClass('hidden');
            }

            function updateEmptyState() {
                // Empty state is handled in renderRows
            }

            function handleError(error) {
                console.error('DropdownTable error:', error);

                if (settings.onError) {
                    settings.onError(error);
                }

                hideLoading();
            }

            function getDefaultColumn() {
                return typeof settings.defaultColumn === 'string'
                    ? settings.columns.find(col => col.data === settings.defaultColumn) || settings.columns[0]
                    : settings.columns[settings.defaultColumn] || settings.columns[0];
            }

            function escapeHtml(unsafe) {
                // Handle null, undefined, or non-string values
                if (unsafe == null) {
                    return '';
                }

                // Convert to string if not already a string
                const str = String(unsafe);

                return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            // Initialize dropdown
            initDropdown();

            // Public API
            const api = {
                open: openDropdown,
                close: closeDropdown,
                updateData: function (newData) {
                    settings.data = Array.isArray(newData) ? newData : [];
                    if (!settings.useAjax) {
                        performLocalSearch($input.val());
                    }
                    return this;
                },
                updateSettings: function (newSettings) {
                    $.extend(settings, newSettings);

                    // Rebuild if necessary
                    if (newSettings.columns || newSettings.multiselect !== undefined) {
                        buildTableHeader();
                    }

                    if (newSettings.width) {
                        setDropdownWidth();
                    }

                    return this;
                },
                getSelectedRows: function () {
                    return [...settings.selectedRows];
                },
                clearSelection: function () {
                    settings.selectedRows = [];
                    if ($select) $select.empty();
                    if ($tagsContainer) $tagsContainer.hide();
                    $input.removeClass('multiselect-active');
                    if (!settings.multiselect) $input.val('');
                    renderRows(filteredData);
                    updateInputValue();

                    if (settings.onSelectionChange) {
                        settings.onSelectionChange([]);
                    }
                    return this;
                },
                selectAll: function () {
                    if (settings.multiselect && filteredData.length > 0) {
                        filteredData.forEach(row => updateSelection(row, true));
                        renderRows(filteredData);
                    }
                    return this;
                },
                setValue: function (value) {
                    $input.val(value);
                    if (!settings.multiselect || !/^\d+\s+items?\s+selected$/.test(value)) {
                        fetchData(value);
                    }
                    return this;
                },
                getValue: function () {
                    return $input.val();
                },
                disable: function () {
                    settings.disabled = true;
                    $input.prop('disabled', true);
                    closeDropdown();
                    return this;
                },
                enable: function () {
                    settings.disabled = false;
                    $input.prop('disabled', false);
                    return this;
                },
                refresh: function () {
                    const currentValue = $input.val();
                    if (!settings.multiselect || !/^\d+\s+items?\s+selected$/.test(currentValue)) {
                        fetchData(currentValue);
                    } else {
                        fetchData('');
                    }
                    return this;
                },
                isOpen: function () {
                    return isOpen;
                },
                getFilteredData: function () {
                    return [...filteredData];
                },
                addToSelection: function (row) {
                    if (settings.multiselect && !isRowSelected(row)) {
                        updateSelection(row, true);
                        renderRows(filteredData);
                    }
                    return this;
                },
                removeFromSelection: function (row) {
                    if (settings.multiselect && isRowSelected(row)) {
                        updateSelection(row, false);
                        renderRows(filteredData);
                    }
                    return this;
                },
                setTheme: function (theme) {
                    settings.theme = theme;
                    $input.closest('.dropdown-container').attr('data-theme', theme);
                    return this;
                },
                destroy: function () {
                    clearTimeout(timeout);

                    // Cancel any pending request
                    if (currentRequest) {
                        currentRequest.abort();
                    }

                    // Remove event listeners
                    $input.off('input focus keydown blur');
                    $dropdownTable.off('click change');
                    if ($tagsContainer) $tagsContainer.off('click');
                    $(document).off('click');
                    $(window).off('resize');

                    // Remove DOM elements
                    $dropdownTable.remove();
                    $loadingIndicator.remove();
                    if ($tagsContainer) $tagsContainer.remove();
                    if ($select) $select.remove();

                    // Unwrap container
                    $input.unwrap('.dropdown-container');

                    // Remove data reference
                    $originalElement.removeData('dropdownTable');

                    return this;
                }
            };

            // Store API reference
            $originalElement.data('dropdownTable', api);

            // Return API for method chaining
            return api;
        });
    };

    // Static methods
    $.fn.dropdownTable.defaults = {
        columns: [],
        data: [],
        useAjax: false,
        ajaxURL: null,
        ajaxMethod: 'GET',
        ajaxParams: {},
        minLength: 3,
        hiddenFields: [],
        defaultColumn: 0,
        limit: 10,
        debounceTime: 300,
        ariaEnabled: true,
        multiselect: false,
        width: 'auto',
        theme: 'light'
    };

    // Version info
    $.fn.dropdownTable.version = '2.0.0-final';

}(jQuery));
