const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, message) => {
  const e164 = to.startsWith('+') ? to : `+91${to}`;
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to:   `whatsapp:${e164}`,
    body: message,
  });
};

module.exports = { sendWhatsApp };
