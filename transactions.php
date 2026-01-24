<?php
require_once __DIR__ . '/config.php';
requireLogin();
$user = $_SESSION['user'];
$db = getDB();

$err = '';
$success = '';

// create transaction
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['type'])) {
	$type = $_POST['type']; // sell or purchase
	$items = json_decode($_POST['items'], true);
	$currency = $_POST['currency'] ?? 'USD';

	if (!is_array($items) || count($items) === 0) {
		$err = 'لا يوجد أصناف مُحددة، الرجاء إضافة صنف واحد على الأقل.';
	} else {
		try {
			$db->beginTransaction();
			// validate and calculate total using server-side item data
			$total = 0;
			$validated = [];
			$fetchItem = $db->prepare('SELECT id,price,stock FROM items WHERE id = :id');
			foreach ($items as $it) {
				if (!isset($it['id']) || !isset($it['qty'])) throw new Exception('تنسيق الأصناف غير صحيح');
				$id = (int)$it['id'];
				$qty = (int)$it['qty'];
				if ($qty <= 0) throw new Exception('كمية غير صالحة');
				$fetchItem->execute([':id'=>$id]);
				$row = $fetchItem->fetch(PDO::FETCH_ASSOC);
				if (!$row) throw new Exception('الصنف رقم ' . $id . ' غير موجود');
				$price = isset($it['price']) ? (float)$it['price'] : (float)$row['price'];
				// for sell ensure stock available
				if ($type === 'sell' && $row['stock'] < $qty) throw new Exception('المخزون غير كافٍ للصنف ' . $id);
				$validated[] = ['id'=>$id,'qty'=>$qty,'price'=>$price];
				$total += $price * $qty;
			}

			// insert transaction
			$ins = $db->prepare('INSERT INTO transactions (type,user_id,total,currency) VALUES (:t,:u,:total,:c)');
			$ins->execute([':t'=>$type,':u'=>$user['id'],':total'=>$total,':c'=>$currency]);
			$trans_id = $db->lastInsertId();
			$si = $db->prepare('INSERT INTO transaction_items (transaction_id,item_id,quantity,price) VALUES (:tr,:it,:q,:p)');
			$up = $db->prepare('UPDATE items SET stock=stock + :delta WHERE id = :id');
			foreach ($validated as $it) {
				$si->execute([':tr'=>$trans_id,':it'=>$it['id'],':q'=>$it['qty'],':p'=>$it['price']]);
				$delta = ($type === 'purchase') ? $it['qty'] : -$it['qty'];
				$up->execute([':delta'=>$delta,':id'=>$it['id']]);
			}

			$db->commit();
			$success = 'تم تنفيذ العملية بنجاح (ID: ' . $trans_id . ')';
		} catch (Exception $e) {
			$db->rollBack();
			$err = 'خطأ: ' . $e->getMessage();
		}
	}
}

$recent = $db->query('SELECT t.*, u.username FROM transactions t LEFT JOIN users u ON u.id=t.user_id ORDER BY t.id DESC LIMIT 20')->fetchAll(PDO::FETCH_ASSOC);
$items = $db->query('SELECT id,name,price,stock FROM items')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>العمليات - نظام المبيعات</title>
<link rel="stylesheet" href="assets/style.css">
<script src="assets/app.js" defer></script>
</head>
<body class="app">
<?php include 'dashboard_nav.php'; ?>
<main class="content">
	<header>
		<h2>العمليات</h2>
	</header>
	<section>
		<div class="card">
			<h3>تنفيذ عملية</h3>
			<?php if ($err): ?><div class="alert" style="color:#b91c1c;margin-bottom:10px"><?=htmlspecialchars($err)?></div><?php endif; ?>
			<?php if ($success): ?><div class="alert" style="color:#064e3b;margin-bottom:10px"><?=htmlspecialchars($success)?></div><?php endif; ?>
			<form id="txForm" method="post">
				<label>نوع العملية
					<select name="type"><option value="sell">بيع</option><option value="purchase">شراء</option></select>
				</label>
				<label>العملة<input name="currency" value="USD"></label>
				<div id="itemsContainer">
					<!-- dynamic via JS -->
				</div>
				<button type="button" id="addItemBtn" class="btn">إضافة صنف</button>
				<input type="hidden" name="items" id="itemsJson">
				<button class="btn" type="submit">تنفيذ</button>
			</form>
		</div>
		<div class="card">
			<h3>آخر العمليات</h3>
			<table class="list"><tr><th>id</th><th>نوع</th><th>المستخدم</th><th>المجموع</th><th>تاريخ</th></tr>
				<?php foreach ($recent as $r): ?>
				<tr><td><?=htmlspecialchars($r['id'])?></td><td><?=htmlspecialchars($r['type'])?></td><td><?=htmlspecialchars($r['username'])?></td><td><?=htmlspecialchars($r['total'])?> <?=htmlspecialchars($r['currency'])?></td><td><?=htmlspecialchars($r['created_at'])?></td></tr>
				<?php endforeach; ?>
			</table>
		</div>
	</section>
</main>
<script>
const availableItems = <?=json_encode($items)?>;
</script>
</body>
</html>