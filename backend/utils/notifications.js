const sendSMS = async (phoneNumber, message) => {
  console.log(`[SMS] Sending to ${phoneNumber}: ${message}`);
  return Promise.resolve({ success: true, messageId: "dummy-sms-id" });
};

const sendWhatsApp = async (phoneNumber, message) => {
  console.log(`[WhatsApp] Sending to ${phoneNumber}: ${message}`);
  return Promise.resolve({ success: true, messageId: "dummy-whatsapp-id" });
};

module.exports = { sendSMS, sendWhatsApp };
