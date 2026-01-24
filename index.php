<?php
require_once __DIR__ . '/config.php';
if (isLoggedIn()) {
	header('Location: dashboard.php');
	exit;
}

$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$db = getDB();
	$stmt = $db->prepare('SELECT * FROM users WHERE username = :u');
	$stmt->execute([':u' => $_POST['username']]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);
	if ($user && password_verify($_POST['password'], $user['password'])) {
		// set minimal session
		$_SESSION['user'] = ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']];
		header('Location: dashboard.php');
		exit;
	} else {
		$err = 'اسم المستخدم أو كلمة المرور خاطئة';
	}
}
?>
<!doctype html>
<html lang="ar">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>تسجيل الدخول - نظام المبيعات</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="auth">
<div class="card login-card">
	<h1>نظام المبيعات والمخازن</h1>
	<?php if ($err): ?><div class="alert"><?=htmlspecialchars($err)?></div><?php endif; ?>
	<form method="post" action="">
		<label>اسم المستخدم
			<input name="username" required value="moatasem">
		</label>
		<label>كلمة المرور
			<input name="password" type="password" required value="2002200233">
		</label>
		<button type="submit" class="btn">دخول</button>
	</form>
	<div class="muted">Demo user: moatasem / 2002200233</div>
</div>
</body>
</html>