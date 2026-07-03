<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 24px;">
  <h2>New Support Ticket</h2>
  <p>A new support ticket has been submitted.</p>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px; font-weight: bold;">Name</td><td>{{ $ticket->name }}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Email</td><td>{{ $ticket->email }}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Category</td><td>{{ $ticket->category }}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Subject</td><td>{{ $ticket->subject }}</td></tr>
  </table>
  <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
    <p style="margin: 0;">{{ $ticket->message }}</p>
  </div>
</body>
</html>
