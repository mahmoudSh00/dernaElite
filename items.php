<?php
require_once __DIR__ . '/config.php';
requireLogin();
$user = $_SESSION['user'];
$db = getDB();

// handle upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['name'])) {
	$name = $_POST['name'];
	$sku = $_POST['sku'] ?: uniqid();
	$price = (float)$_POST['price'];
	$category = $_POST['category'];
	$stock = (int)$_POST['stock'];
	$imagePath = null;
	if (!empty($_FILES['image']['tmp_name'])) {
		$uploads = __DIR__ . '/uploads';
		if (!is_dir($uploads)) mkdir($uploads,0755,true);
		$fn = basename($_FILES['image']['name']);
		$dst = $uploads . '/' . time() . '_' . $fn;
		move_uploaded_file($_FILES['image']['tmp_name'], $dst);
		$imagePath = 'uploads/' . basename($dst);
	}
	$ins = $db->prepare('INSERT INTO items (sku,name,description,category,price,stock,image) VALUES (:sku,:name,:desc,:cat,:price,:stock,:img)');
	$ins->execute([':sku'=>$sku,':name'=>$name,':desc'=>$_POST['description'],':cat'=>$category,':price'=>$price,':stock'=>$stock,':img'=>$imagePath]);
}

$all = $db->query('SELECT * FROM items ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>الأصناف - نظام المبيعات</title>
<link rel="stylesheet" href="assets/style.css">
<script src="assets/app.js" defer></script>
</head>
<body class="app">
<?php include 'dashboard_nav.php'; ?>
<main class="content">
	<header>
		<h2>الأصناف</h2>
	</header>
	<section>
		<div class="card">
			<h3>إضافة صنف</h3>
			<form method="post" enctype="multipart/form-data">
				<label>الاسم<input name="name" required></label>
				<label>الرمز (SKU) — دعم الباركود<input name="sku" id="sku"></label>
				<label>السعر<input name="price" type="number" step="0.01" value="0"></label>
				<label>الفئة<input name="category"></label>
				<label>الكمية في المخزن<input name="stock" type="number" value="0"></label>
				<label>وصف<textarea name="description"></textarea></label>
				<label>صورة<input name="image" type="file" accept="image/*"></label>
				<button class="btn" type="submit">إضافة</button>
			</form>
		</div>
		<div class="card">
			<h3>قائمة الأصناف</h3>
			<table class="list">
				<tr><th>id</th><th>SKU</th><th>اسم</th><th>سعر</th><th>المخزون</th></tr>
				<?php foreach ($all as $a): ?>
				<tr>
				<td><?=htmlspecialchars($a['id'])?></td>
				<td><?=htmlspecialchars($a['sku'])?></td>
				<td><?=htmlspecialchars($a['name'])?></td>
				<td><?=htmlspecialchars($a['price'])?></td>
				<td><?=htmlspecialchars($a['stock'])?></td>
				</tr>
				<?php endforeach; ?>
			</table>
		</div>
	</section>
</main>
</body>
</html>