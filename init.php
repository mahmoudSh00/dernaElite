<?php
require_once __DIR__ . '/config.php';
try {
	// diagnostics
	echo "DEBUG: DATA_DIR= - init.php:5" . DATA_DIR . "<br>";
	echo "DEBUG: data dir exists? - init.php:6" . (is_dir(DATA_DIR) ? 'yes' : 'no') . "<br>";
	if (is_dir(DATA_DIR)) {
		echo "DEBUG: data dir writable? - init.php:8" . (is_writable(DATA_DIR) ? 'yes' : 'no') . "<br>";
	}

	// ensure data dir
	if (!is_dir(DATA_DIR)) {
		if (!mkdir(DATA_DIR, 0755, true) && !is_dir(DATA_DIR)) {
			throw new Exception('Failed to create data directory: ' . DATA_DIR);
		}
	}
	// after ensure
	echo "DEBUG: after ensure, data dir exists? - init.php:18" . (is_dir(DATA_DIR) ? 'yes' : 'no') . "<br>";
	echo "DEBUG: after ensure, writable? - init.php:19" . (is_writable(DATA_DIR) ? 'yes' : 'no') . "<br>";

	$db = getDB();
	echo "DEBUG: connected to DB via PDO.<br> - init.php:22";
	echo "DEBUG: DB_PATH= - init.php:23" . DB_PATH . "<br>";
	echo "DEBUG: DB file exists? - init.php:24" . (file_exists(DB_PATH) ? 'yes' : 'no') . "<br>";

	// Create users table
	$db->exec("CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'employee',
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
)");
	echo "DEBUG: users table ensured.<br> - init.php:34";

	// Create items table
	$db->exec("CREATE TABLE IF NOT EXISTS items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	sku TEXT UNIQUE,
	name TEXT NOT NULL,
	description TEXT,
	category TEXT,
	price REAL DEFAULT 0,
	currency TEXT DEFAULT 'USD',
	stock INTEGER DEFAULT 0,
	image TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
)");
	echo "DEBUG: items table ensured.<br> - init.php:49";

	// Create transactions table
	$db->exec("CREATE TABLE IF NOT EXISTS transactions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT NOT NULL,
	user_id INTEGER,
	total REAL,
	currency TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
)");
	echo "DEBUG: transactions table ensured.<br> - init.php:60";

	// Create transaction_items table
	$db->exec("CREATE TABLE IF NOT EXISTS transaction_items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	transaction_id INTEGER,
	item_id INTEGER,
	quantity INTEGER,
	price REAL
)");
	echo "DEBUG: transaction_items table ensured.<br> - init.php:70";

	// Create logs table
	$db->exec("CREATE TABLE IF NOT EXISTS logs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER,
	action TEXT,
	details TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
)");
	echo "DEBUG: logs table ensured.<br> - init.php:80";

	// Insert default admin user if not exists
	$stmt = $db->prepare('SELECT COUNT(*) as cnt FROM users WHERE username = :u');
	$stmt->execute([':u' => 'moatasem']);
	$row = $stmt->fetch(PDO::FETCH_ASSOC);
	if ($row['cnt'] == 0) {
		// Password: 2002200233 (hashed)
		$hash = password_hash('2002200233', PASSWORD_DEFAULT);
		$ins = $db->prepare('INSERT INTO users (username, password, role) VALUES (:u, :p, :r)');
		$ins->execute([':u' => 'moatasem', ':p' => $hash, ':r' => 'admin']);
		echo "DEBUG: default admin user created.<br> - init.php:91";
	} else {
		echo "DEBUG: default admin already exists.<br> - init.php:93";
	}

	echo "Initialization complete. DB path: - init.php:96" . DB_PATH;
} catch (PDOException $pe) {
	echo "PDOException: - init.php:98" . $pe->getMessage();
	if (isset($db) && $db instanceof PDO) {
		// dump SQLite error info
		$err = $db->errorInfo();
		echo "<br>PDO errorInfo: - init.php:102" . json_encode($err);
	}
} catch (Exception $e) {
	echo "Initialization failed: - init.php:105" . $e->getMessage();
}
