import twilio from 'twilio';

// Check if WhatsApp configuration is available
const isWhatsAppConfigured = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  );
};

// Initialize Twilio client
let twilioClient = null;
if (isWhatsAppConfigured()) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Format date for WhatsApp message
const formatDate = (dateString) => {
  const date = new Date(dateString.replace(/_/g, '/'));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Send appointment confirmation via WhatsApp
export const sendWhatsAppConfirmation = async (phoneNumber, userName, doctorName, doctorSpeciality, appointmentDate, appointmentTime, fee, appointmentId) => {
  try {
    if (!isWhatsAppConfigured()) {
      console.log('WhatsApp not configured - Message skipped');
      return { success: false, message: 'WhatsApp not configured' };
    }

    const message = `
*🏥 Appointment Confirmed - Prescripto*

Dear ${userName},

Your appointment has been successfully booked!

*📋 Appointment Details:*
• Doctor: Dr. ${doctorName}
• Speciality: ${doctorSpeciality}
• Date: ${formatDate(appointmentDate)}
• Time: ${appointmentTime}
• Fee: $${fee}
• Appointment ID: ${appointmentId}

*📝 Important Notes:*
• Please arrive 10 minutes early
• Bring valid ID and medical documents
• Reply CANCEL to cancel appointment
• Reply STATUS to check appointment status

Thank you for choosing Prescripto!
    `;

    const result = await twilioClient.messages.create({
      body: message.trim(),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`
    });

    console.log('✅ WhatsApp confirmation sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder via WhatsApp
export const sendWhatsAppReminder = async (phoneNumber, userName, doctorName, appointmentDate, appointmentTime) => {
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    const message = `
*⏰ Appointment Reminder - Prescripto*

Hi ${userName},

This is a reminder for your appointment tomorrow:

• Doctor: Dr. ${doctorName}
• Date: ${formatDate(appointmentDate)}
• Time: ${appointmentTime}

Reply STATUS to check details or CANCEL to cancel.
    `;

    const result = await twilioClient.messages.create({
      body: message.trim(),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Error sending reminder:', error.message);
    return { success: false, error: error.message };
  }
};

// Test WhatsApp connection on startup
export const testWhatsAppConnection = async () => {
  if (!isWhatsAppConfigured()) {
    console.log('⚠️  WhatsApp configuration incomplete - WhatsApp disabled');
    return false;
  }

  try {
    console.log('✅ WhatsApp service configured successfully');
    return true;
  } catch (error) {
    console.error('❌ WhatsApp service configuration failed:', error.message);
    return false;
  }
};

export default {
  sendWhatsAppConfirmation,
  sendWhatsAppReminder,
  testWhatsAppConnection,
  isWhatsAppConfigured
};