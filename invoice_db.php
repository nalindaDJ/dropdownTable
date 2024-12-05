<?php
$query = isset($_GET['query']) ? strtolower($_GET['query']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

$pdo = new PDO('mysql:host=localhost;dbname=test_database', 'root', '');
$stmt = $pdo->prepare('SELECT
v.inv_id AS `id`,
v.inv_number AS invoiceNo,
DATE(v.inv_date) AS invoiceDate,
v.inv_total AS amount,
c.company_name AS customerName
FROM
tbl_invoice AS v
INNER JOIN tbl_company AS c ON v.customer_id = c.company_id
 WHERE v.inv_number LIKE :query OR c.company_name LIKE :query LIMIT '.$limit );

$stmt->execute(['query' => "%$query%"]);
$invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the filtered results as JSON
header('Content-Type: application/json');
echo json_encode(array_values($invoices));

