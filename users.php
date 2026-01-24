<?php
require_once __DIR__ . '/config.php';
requireLogin();
$user = $_SESSION['user'];
$db = getDB();

// simple add user
if ($user['role'] === 'admin' && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['new_username'])) {
	$u = $_POST['new_username'];
	$p = $_POST['new_password'];
	$r = $_POST['new_role'];
	$hash = password_hash($p, PASSWORD_DEFAULT);
	$ins = $db->prepare('INSERT INTO users (username,password,role) VALUES (:u,:p,:r)');
	$ins->execute([':u'=>$u,':p'=>$hash,':r'=>$r]);
}
$all = $db->query('SELECT id,username,role,created_at FROM users ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>المستخدمون - نظام المبيعات</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="app">
<?php include 'dashboard_nav.php'; ?>
<main class="content">
	<header>
		<h2>المستخدمون</h2>
	</header>
	<section>
		<?php if ($user['role'] === 'admin'): ?>
		<div class="card">
			<h3>إنشاء مستخدم جديد</h3>
			<form method="post">
				<label>اسم المستخدم<input name="new_username" required></label>
				<label>كلمة المرور<input name="new_password" required></label>
				<label>الصلاحية
					<select name="new_role"><option>employee</option><option>cashier</option><option>admin</option></select>
				</label>
				<button class="btn" type="submit">إنشاء</button>
			</form>
		</div>
		<?php endif; ?>
		<div class="card">
			<h3>قائمة المستخدمين</h3>
			<table class="list">
				<tr><th>id</th><th>اسم</th><th>صلاحية</th><th>تاريخ</th></tr>
				<?php foreach ($all as $a): ?>
				<tr><td><?=htmlspecialchars($a['id'])?></td><td><?=htmlspecialchars($a['username'])?></td><td><?=htmlspecialchars($a['role'])?></td><td><?=htmlspecialchars($a['created_at'])?></td></tr>
				<?php endforeach; ?>
			</table>
		</div>
	</section>
</main>
</body>
</html>