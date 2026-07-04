<?php
// Temporary helper — REMOVE after use.
// Only use when cPanel Git Version Control is unavailable.

$password = 'oakaudix_admin_2024';

$allowed = [
    'php artisan route:clear',
    'php artisan route:list',
    'php artisan cache:clear',
    'php artisan config:clear',
    'php artisan view:clear',
    'php artisan optimize:clear',
    'composer dump-autoload',
    'php -v',
    'whoami',
    'pwd',
    'ls -la',
    'id',
];

// Redirect all output to a buffer so we can display it.
function run_command(string $cmd): string
{
    ob_start();
    system($cmd, $exit_code);
    $output = ob_get_clean();
    return "<pre><strong>$ $cmd</strong> (exit: $exit_code)\n\n" . htmlspecialchars($output ?? '') . "</pre>";
}

// Handle form submission
$output = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_password = $_POST['password'] ?? '';
    $custom_cmd = trim($_POST['custom_cmd'] ?? '');
    $preset = $_POST['preset'] ?? '';

    if ($input_password !== $password) {
        $output = '<div style="color:red;font-weight:bold;">Wrong password.</div>';
    } else {
        // Change to the backend directory (adjust if needed)
        $backend_dir = __DIR__;
        chdir($backend_dir);

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
  <input type="password" name="password" placeholder="Password" required />
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
