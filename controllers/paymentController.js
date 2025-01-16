const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');

exports.createCharge = async (req, res) => {
  try {
    // Extract data from request body
    const { 
      user_id, amount, currency, source, 
      cardholder_first_name, cardholder_last_name, 
      card_number, expiration_date, cvc 
    } = req.body;

    // Validate required fields
    if (!user_id || !amount || !currency || !source || 
        !cardholder_first_name || !cardholder_last_name || 
        !card_number || !expiration_date || !cvc) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if a payment has already been made by this user
    const existingPayment = await Payment.findOne({ 
      user_id, 
      amount, 
      status: 'completed' 
    });

    if (existingPayment) {
      return res.status(200).json({ 
        success: true, 
        message: 'Payment already done', 
        payment: existingPayment 
      });
    }

    // Create Stripe charge
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      source,
      description: 'Payment for subscription',
    });

    // Save payment record to database
    const payment = await Payment.create({
      user_id: user_id,
      amount: amount,
      currency: currency,
      source: source,
      status: 'completed',
      stripe_charge_id: charge.id,
      description: charge.description,
      cardholder_first_name: cardholder_first_name,
      cardholder_last_name: cardholder_last_name,
      card_number: card_number,
      expiration_date: expiration_date,
      cvc: cvc,
    });

    // Update user's subscription status
    user.subscription = true;
    await user.save();

    // Respond with success
    res.status(200).json({ success: true, message: 'Payment successful', payment });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
  }
};

