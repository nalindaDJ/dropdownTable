<?php
// Simulate database records
$invoices = [
    ['id' => 1, 'invoiceNo' => 'INVCVR2400099271', 'invoiceDate' => '10/28/2024', 'amount' => '33579.04', 'customerName' => 'DIPPED PRODUCTS PLC'],
    ['id' => 2, 'invoiceNo' => 'INVCVR2400099225', 'invoiceDate' => '10/28/2024', 'amount' => '2892.73', 'customerName' => 'DIPPED PRODUCTS PLC'],
    ['id' => 3, 'invoiceNo' => 'INVCVR2400099176', 'invoiceDate' => '10/28/2024', 'amount' => '37062.62', 'customerName' => 'DIPPED PRODUCTS PLC'],
    ['id' => 4, 'invoiceNo' => 'INVCVR2400099000', 'invoiceDate' => '10/27/2024', 'amount' => '12345.67', 'customerName' => 'ABC PRODUCTS LTD'],
    ['id' => 5, 'invoiceNo' => 'INVCVR2400098555', 'invoiceDate' => '10/26/2024', 'amount' => '54321.00', 'customerName' => 'XYZ CORPORATION'],
];

// Get the query parameter from the request
$query = isset($_GET['query']) ? strtolower($_GET['query']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

// Filter the invoices based on the query
$filteredInvoices = array_filter($invoices, function ($invoice) use ($query) {
    return stripos($invoice['invoiceNo'], $query) !== false ||
           stripos($invoice['customerName'], $query) !== false;
});

$filteredInvoices = array_slice($filteredInvoices, 0, $limit);

// Return the filtered results as JSON
header('Content-Type: application/json');
echo json_encode(array_values($filteredInvoices));
?>



