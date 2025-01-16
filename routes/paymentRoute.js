const express = require('express');
const { createCharge } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-charge', createCharge);

module.exports = router;

