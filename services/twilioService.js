const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error('SMS could not be sent');
  }
};

module.exports = {
  sendSMS
}; 