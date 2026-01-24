<?php
// Simple helper to ensure data directory exists and run initialization
require_once __DIR__ . '/config.php';
try {
	if (!is_dir(DATA_DIR)) {
		if (!mkdir(DATA_DIR, 0755, true) && !is_dir(DATA_DIR)) {
			throw new Exception('فشل في إنشاء المجلد: ' . DATA_DIR);
		}
	}
	if (!is_writable(DATA_DIR)) {
		@chmod(DATA_DIR, 0755);
	}
	echo 'Data directory ready: - create_data_and_db.php:13' . DATA_DIR . "<br>";

	// run init to create DB and tables
	include __DIR__ . '/init.php';
} catch (Exception $e) {
	echo 'خطأ: - create_data_and_db.php:18' . $e->getMessage();
}
