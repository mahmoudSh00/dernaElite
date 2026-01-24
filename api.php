<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
$action = $_REQUEST['action'] ?? '';

function json($data){ echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

try {
    $db = getDB();
    // simple settings storage
    $settingsFile = DATA_DIR . '/settings.json';
    switch ($action) {
        case 'login':
            $u = $_POST['username'] ?? '';
            $p = $_POST['password'] ?? '';
            if (!$u || !$p) json(['ok'=>false,'msg'=>'المعاملات ناقصة']);
            $stmt = $db->prepare('SELECT * FROM users WHERE username = :u');
            $stmt->execute([':u'=>$u]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user && password_verify($p, $user['password'])) {
                $_SESSION['user'] = ['id'=>$user['id'],'username'=>$user['username'],'role'=>$user['role']];
                json(['ok'=>true,'user'=>$_SESSION['user']]);
            }
            json(['ok'=>false,'msg'=>'اسم المستخدم أو كلمة المرور خاطئ']);
            break;
        case 'logout':
            session_destroy();
            json(['ok'=>true]);
            break;
        case 'users_list':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            $rows = $db->query('SELECT id,username,role,created_at FROM users ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
            json(['ok'=>true,'users'=>$rows]);
            break;
        case 'users_create':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            if ($_SESSION['user']['role'] !== 'admin') json(['ok'=>false,'msg'=>'not_allowed']);
            $u = $_POST['username'] ?? '';
            $p = $_POST['password'] ?? '';
            $r = $_POST['role'] ?? 'employee';
            if (!$u || !$p) json(['ok'=>false,'msg'=>'missing']);
            $hash = password_hash($p, PASSWORD_DEFAULT);
            $ins = $db->prepare('INSERT INTO users (username,password,role) VALUES (:u,:p,:r)');
            $ins->execute([':u'=>$u,':p'=>$hash,':r'=>$r]);
            json(['ok'=>true,'id'=>$db->lastInsertId()]);
            break;
        case 'users_delete':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            if ($_SESSION['user']['role'] !== 'admin') json(['ok'=>false,'msg'=>'not_allowed']);
            $id = (int)($_POST['id'] ?? 0);
            if (!$id) json(['ok'=>false,'msg'=>'missing']);
            $db->prepare('DELETE FROM users WHERE id = :id')->execute([':id'=>$id]);
            json(['ok'=>true]);
            break;
        case 'items_list':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            $rows = $db->query('SELECT * FROM items ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
            json(['ok'=>true,'items'=>$rows]);
            break;
        case 'items_create':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            $sku = $_POST['sku'] ?? null; $name = $_POST['name'] ?? ''; $price = floatval($_POST['price'] ?? 0); $stock = intval($_POST['stock'] ?? 0);
            if (!$name) json(['ok'=>false,'msg'=>'missing']);
            $ins = $db->prepare('INSERT INTO items (sku,name,description,category,price,currency,stock,image) VALUES (:sku,:name,:desc,:cat,:price,:cur,:stock,:img)');
            $ins->execute([':sku'=>$sku,':name'=>$name,':desc'=>($_POST['description'] ?? ''),':cat'=>($_POST['category'] ?? ''),':price'=>$price,':cur'=>($_POST['currency'] ?? 'LYD'),':stock'=>$stock,':img'=>null]);
            json(['ok'=>true,'id'=>$db->lastInsertId()]);
            break;
        case 'transactions_create':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            $type = $_POST['type'] ?? '';
            $items = json_decode($_POST['items'] ?? '[]', true);
            $currency = $_POST['currency'] ?? 'LYD';
            if (!$type || !is_array($items) || count($items)===0) json(['ok'=>false,'msg'=>'invalid']);
            $db->beginTransaction();
            try {
                $total = 0;
                $fetch = $db->prepare('SELECT id,price,stock FROM items WHERE id = :id');
                foreach ($items as $it) {
                    $fetch->execute([':id'=>intval($it['id'])]);
                    $row = $fetch->fetch(PDO::FETCH_ASSOC);
                    if (!$row) throw new Exception('Item not found: ' . intval($it['id']));
                    $qty = intval($it['qty']);
                    if ($type === 'sell' && $row['stock'] < $qty) throw new Exception('Insufficient stock for item ' . $row['id']);
                    $price = isset($it['price']) ? floatval($it['price']) : floatval($row['price']);
                    $total += $price * $qty;
                }
                $ins = $db->prepare('INSERT INTO transactions (type,user_id,total,currency) VALUES (:t,:u,:total,:c)');
                $ins->execute([':t'=>$type,':u'=>$_SESSION['user']['id'],':total'=>$total,':c'=>$currency]);
                $trans_id = $db->lastInsertId();
                $si = $db->prepare('INSERT INTO transaction_items (transaction_id,item_id,quantity,price) VALUES (:tr,:it,:q,:p)');
                $up = $db->prepare('UPDATE items SET stock=stock + :delta WHERE id = :id');
                foreach ($items as $it) {
                    $id = intval($it['id']); $qty = intval($it['qty']); $price = isset($it['price']) ? floatval($it['price']) : 0;
                    $si->execute([':tr'=>$trans_id,':it'=>$id,':q'=>$qty,':p'=>$price]);
                    $delta = ($type === 'purchase') ? $qty : -$qty;
                    $up->execute([':delta'=>$delta,':id'=>$id]);
                }
                $db->commit();
                json(['ok'=>true,'id'=>$trans_id]);
            } catch (Exception $e) {
                $db->rollBack();
                json(['ok'=>false,'msg'=>$e->getMessage()]);
            }
            break;
        case 'settings_get':
            $data = ['ok'=>true,'settings'=>[]];
            if (file_exists($settingsFile)) {
                $data['settings'] = json_decode(file_get_contents($settingsFile), true);
            } else {
                $data['settings'] = ['shop_name'=>'','facebook'=>'','phone'=>'','theme'=>'light','accent'=>'#0066cc','fontSize'=>16,'currencies'=>[['code'=>'LYD','rate'=>1]],'defaultCurrency'=>'LYD'];
            }
            json($data);
            break;
        case 'settings_save':
            if (!isLoggedIn()) json(['ok'=>false,'msg'=>'not_logged']);
            $raw = file_get_contents('php://input');
            $obj = json_decode($raw, true);
            if (!is_array($obj)) json(['ok'=>false,'msg'=>'invalid']);
            file_put_contents($settingsFile, json_encode($obj, JSON_UNESCAPED_UNICODE));
            json(['ok'=>true]);
            break;
        default:
            json(['ok'=>false,'msg'=>'unknown_action']);
    }
} catch (Exception $e) {
    json(['ok'=>false,'msg'=>$e->getMessage()]);
}
