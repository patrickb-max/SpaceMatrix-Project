exports.sendNotification = (req, res) => {
  const { type, recipient, details } = req.body;
  console.log(`🔔 [NOTIFICATION DISPATCHED] -> Type: ${type} | Recipient: ${recipient}`);
  console.log('Details:', details);
  res.status(200).json({ status: 'queued', message: 'Alert dispatched successfully.' });
};