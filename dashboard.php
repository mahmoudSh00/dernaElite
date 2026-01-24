<?php
require_once __DIR__ . '/config.php';
requireLogin();
$user = $_SESSION['user'];
$db = getDB();

// basic stats
$stats = [];
$stats['users'] = $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
$stats['items'] = $db->query('SELECT COUNT(*) FROM items')->fetchColumn();
$stats['transactions'] = $db->query('SELECT COUNT(*) FROM transactions')->fetchColumn();
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>لوحة التحكم - نظام المبيعات</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="app">
<nav class="sidebar">
	<div class="brand">مبيعات &amp; مخازن</div>
	<div class="user">مستخدم: <?=htmlspecialchars($user['username'])?> (<?=htmlspecialchars($user['role'])?>)</div>
	<ul>
		<li><a href="dashboard.php">لوحة التحكم</a></li>
		<li><a href="users.php">المستخدمون</a></li>
		<li><a href="items.php">الأصناف</a></li>
		<li><a href="transactions.php">العمليات</a></li>
		<li><a href="reports.php">التقارير</a></li>
		<li><a href="logout.php">تسجيل الخروج</a></li>
	</ul>
</nav>
<main class="content">
	<header>
		<h2>لوحة القيادة</h2>
	</header>
	<section class="grid">
		<div class="card">
			<h3>المستخدمون</h3>
			<div class="big"><?=$stats['users']?></div>
		</div>
		<div class="card">
			<h3>الأصناف</h3>
			<div class="big"><?=$stats['items']?></div>
		</div>
		<div class="card">
			<h3>العمليات</h3>
			<div class="big"><?=$stats['transactions']?></div>
		</div>
	</section>
</main>
</body>
</html>