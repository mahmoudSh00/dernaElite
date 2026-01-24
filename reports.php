<?php
require_once __DIR__ . '/config.php';
requireLogin();
$db = getDB();

$from = $_GET['from'] ?? null;
$to = $_GET['to'] ?? null;
$where = '';
$params = [];
if ($from) { $where .= ' AND created_at >= :from'; $params[':from'] = $from; }
if ($to) { $where .= ' AND created_at <= :to'; $params[':to'] = $to; }
$stmt = $db->prepare('SELECT * FROM transactions WHERE 1=1 ' . $where . ' ORDER BY id DESC');
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>التقارير - نظام المبيعات</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="app">
<?php include 'dashboard_nav.php'; ?>
<main class="content">
	<header>
		<h2>التقارير</h2>
	</header>
	<section>
		<div class="card">
			<form method="get">
				<label>من<input type="date" name="from"></label>
				<label>إلى<input type="date" name="to"></label>
				<button class="btn" type="submit">عرض</button>
				<button class="btn" type="button" onclick="window.print()">طباعة</button>
			</form>
		</div>
		<div class="card">
			<h3>النتائج</h3>
			<table class="list"><tr><th>id</th><th>نوع</th><th>المجموع</th><th>العملة</th><th>تاريخ</th></tr>
				<?php foreach ($rows as $r): ?>
				<tr><td><?=$r['id']?></td><td><?=$r['type']?></td><td><?=$r['total']?></td><td><?=$r['currency']?></td><td><?=$r['created_at']?></td></tr>
				<?php endforeach; ?>
			</table>
		</div>
	</section>
</main>
</body>
</html>