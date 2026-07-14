<?php
// Temporary helper — REMOVE after use.
// Only use when cPanel Git Version Control is unavailable.

$password = 'oakaudix_admin_2024';

// Change to the backend root (one level up from public/)
$backend_dir = dirname(__DIR__);

// Try common cPanel PHP paths (in order of preference)
$php_candidates = [
    '/opt/cpanel/ea-php82/root/usr/bin/php',
    '/opt/cpanel/ea-php81/root/usr/bin/php',
    '/opt/cpanel/ea-php80/root/usr/bin/php',
    '/usr/local/bin/php',
    'php-cli',
    'php',
];
$php_bin = 'php'; // fallback
foreach ($php_candidates as $c) {
    $test = @exec("command -v " . escapeshellarg($c) . " 2>/dev/null", $_, $code);
    if ($code === 0 && $test) { $php_bin = $c; break; }
}

$prefix = $php_bin;
$allowed = [
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan route:clear',
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan route:list',
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan cache:clear',
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan config:clear',
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan view:clear',
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan optimize:clear',
    'cd ' . escapeshellarg($backend_dir) . ' && composer dump-autoload',
    'echo "PHP binary: ' . $php_bin . '"',
    'whoami',
    'pwd',
    'curl -o ' . escapeshellarg($backend_dir . '/routes/api.php') . ' https://raw.githubusercontent.com/toluwanibakare/oak-audit/main/backend/routes/api.php 2>&1 && echo "OK: api.php updated"',
    'curl -o ' . escapeshellarg($backend_dir . '/app/Http/Controllers/Api/AuthController.php') . ' https://raw.githubusercontent.com/toluwanibakare/oak-audit/main/backend/app/Http/Controllers/Api/AuthController.php 2>&1 && echo "OK: AuthController.php updated"',
    'curl -o ' . escapeshellarg($backend_dir . '/app/Mail/SendOtpMail.php') . ' https://raw.githubusercontent.com/toluwanibakare/oak-audit/main/backend/app/Mail/SendOtpMail.php 2>&1 && echo "OK: SendOtpMail.php updated"',
    'curl -o ' . escapeshellarg($backend_dir . '/resources/views/emails/otp.blade.php') . ' https://raw.githubusercontent.com/toluwanibakare/oak-audit/main/backend/resources/views/emails/otp.blade.php 2>&1 && echo "OK: otp.blade.php updated"',
    'ls -la ' . escapeshellarg($backend_dir) . '/artisan 2>/dev/null || echo "artisan not found at ' . addslashes($backend_dir) . '/artisan"',
    'id',
    'cd ' . escapeshellarg($backend_dir) . ' && ' . $prefix . ' artisan migrate',
];

function run_command(string $cmd): string
{
    ob_start();
    system($cmd, $exit_code);
    $output = ob_get_clean();
    return "<pre><strong>$ $cmd</strong> (exit: $exit_code)\n\n" . htmlspecialchars($output ?? '') . "</pre>";
}

$output = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_password = $_POST['password'] ?? '';
    $custom_cmd = trim($_POST['custom_cmd'] ?? '');
    $preset = $_POST['preset'] ?? '';

    if ($input_password !== $password) {
        $output = '<div style="color:red;font-weight:bold;">Wrong password.</div>';
    } else {
        if ($preset && isset($allowed[$preset])) {
            $cmd = $allowed[$preset];
            $output .= run_command($cmd);
        } elseif ($custom_cmd) {
            if (in_array($custom_cmd, $allowed, true)) {
                $output .= run_command($custom_cmd);
            } else {
                $output .= '<div style="color:red;">Command not in allowed list.</div>';
            }
        }
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Command Runner</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 24px; max-width: 800px; margin: auto; }
  input, select, button { font-size: 14px; padding: 8px 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: #eee; width: 100%; box-sizing: border-box; margin-bottom: 12px; }
  button { background: #0a6; color: #fff; font-weight: bold; cursor: pointer; }
  button:hover { background: #0b7; }
  pre { background: #1a1a2e; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.5; }
</style>
</head>
<body>
<h1>Command Runner</h1>
<form method="POST">
  <div style="position:relative">
  <input type="password" name="password" id="pwd" placeholder="Password" required style="padding-right:40px" />
  <span onclick="togglePwd()" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:16px;user-select:none;font-family:sans-serif" id="pwdIcon">SHOW</span>
</div>
<script>
function togglePwd(){var e=document.getElementById('pwd'),i=document.getElementById('pwdIcon');if(e.type==='password'){e.type='text';i.textContent='HIDE'}else{e.type='password';i.textContent='SHOW'}}
</script>
  <select name="preset">
    <option value="">-- Select a command --</option>
    <?php foreach ($allowed as $i => $cmd): ?>
    <option value="<?= $i ?>"><?= htmlspecialchars($cmd) ?></option>
    <?php endforeach; ?>
  </select>
  <p style="text-align:center;color:#666;margin:8px 0;">— OR —</p>
  <input type="text" name="custom_cmd" placeholder="Type an allowed command manually" />
  <button type="submit">Run</button>
</form>
<div><?= $output ?></div>
</body>
</html>
