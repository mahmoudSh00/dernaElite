<?php
// Enable error reporting for development/debugging
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
date_default_timezone_set('UTC');

// Lightweight config and DB helper
session_start();

define('DATA_DIR', __DIR__ . '/data');
define('DB_PATH', DATA_DIR . '/app.db');

function getDB() {
	static $db = null;
	if ($db === null) {
		if (!is_dir(DATA_DIR)) {
			mkdir(DATA_DIR, 0755, true);
		}
		$db = new PDO('sqlite:' . DB_PATH);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	return $db;
}

function isLoggedIn() {
	return !empty($_SESSION['user']);
}

function requireLogin() {
	if (!isLoggedIn()) {
		header('Location: index.php');
		exit;
	}
}
