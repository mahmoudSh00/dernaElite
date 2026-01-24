<?php
// small include for nav consistency
?>
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