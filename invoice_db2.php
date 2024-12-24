<?php
print_r($_GET);
$invdate= isset($_GET['query']) ? ($_GET['invdate']) : null;
$query = isset($_GET['query']) ? strtolower($_GET['query']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

$pdo = new PDO('mysql:host=localhost;dbname=test_database', 'root', '');
$stmt = $pdo->prepare("SELECT
v.inv_id AS `id`,
v.inv_no AS invoiceNo,
DATE(v.inv_date) AS invoiceDate,
v.inv_tot AS amount,
c.name AS customerName
FROM
tbl_invoice AS v
INNER JOIN tbl_company AS c ON v.client_id = c.com_id  WHERE v.inv_date='".$invdate."' AND (v.inv_no LIKE :query OR c.name LIKE :query) LIMIT ".$limit );

$stmt->execute(['query' => "%$query%"]);
$invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the filtered results as JSON
header('Content-Type: application/json');
echo json_encode(array_values($invoices));
