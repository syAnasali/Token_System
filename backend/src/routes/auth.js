const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const workerPassword = process.env.WORKER_PASSWORD;

  if (password === workerPassword) {
    const token = jwt.sign({ role: 'worker' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

module.exports = router;
