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
  console.log('✅ Twilio WhatsApp client initialized');
} else {
  console.log('⚠️ Twilio WhatsApp configuration incomplete');
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

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Ensure phone number has correct format
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    const message = `
*🏥 Appointment Confirmed - Siddique Hospital*

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

*📍 Location:*
Civil Lines, Lahore-Sargodha Road
Sheikhupura, Pakistan

*📞 Contact:*
Phone: +923348400517
WhatsApp: +923348400517

Thank you for choosing Siddique Hospital! 🙏
    `;

    console.log(`Sending WhatsApp message to: ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message.trim(),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
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

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Ensure phone number has correct format
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    const message = `
*⏰ Appointment Reminder - Siddique Hospital*

Hi ${userName},

This is a reminder for your appointment:

*📋 Details:*
• Doctor: Dr. ${doctorName}
• Date: ${formatDate(appointmentDate)}
• Time: ${appointmentTime}

*📍 Location:*
Civil Lines, Lahore-Sargodha Road
Sheikhupura, Pakistan

Please arrive 10 minutes early with valid ID.

Reply STATUS for details or CANCEL to cancel.

📞 Contact: +923348400517
    `;

    const result = await twilioClient.messages.create({
      body: message.trim(),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('✅ WhatsApp reminder sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending reminder:', error.message);
    return { success: false, error: error.message };
  }
};

// Send custom WhatsApp message
export const sendCustomWhatsAppMessage = async (phoneNumber, message) => {
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Ensure phone number has correct format
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('✅ Custom WhatsApp message sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending custom WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send bulk WhatsApp notifications (for announcements)
export const sendBulkWhatsAppMessage = async (phoneNumbers, message) => {
  const results = [];
  
  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendCustomWhatsAppMessage(phoneNumber, message);
      results.push({ phoneNumber, ...result });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ 
        phoneNumber, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return results;
};

// Send appointment confirmation to doctor via WhatsApp
export const sendDoctorWhatsAppConfirmation = async (
  phoneNumber,
  doctorName,
  patientName,
  patientPhone,
  appointmentDate,
  appointmentTime,
  fee,
  appointmentId
) => {
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    const message = `
*📅 New Appointment Booked - Siddique Hospital*

Dear Dr. ${doctorName},

A new appointment has been booked.

*Patient:* ${patientName}
*Phone:* ${patientPhone}
*Date:* ${formatDate(appointmentDate)}
*Time:* ${appointmentTime}
*Fee:* Rs. ${fee}
*Appointment ID:* ${appointmentId}

Please check your dashboard for more details.

Thank you!
    `;
    const result = await twilioClient.messages.create({
      body: message.trim(),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp to doctor:', error.message);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder to doctor via WhatsApp
export const sendDoctorWhatsAppReminder = async (
  phoneNumber,
  doctorName,
  patientName,
  appointmentDate,
  appointmentTime
) => {
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    const message = `
*⏰ Appointment Reminder - Siddique Hospital*

Dear Dr. ${doctorName},

You have an upcoming appointment:

*Patient:* ${patientName}
*Date:* ${formatDate(appointmentDate)}
*Time:* ${appointmentTime}

Please be prepared and check your dashboard for details.

Thank you!
    `;
    const result = await twilioClient.messages.create({
      body: message.trim(),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp reminder to doctor:', error.message);
    return { success: false, error: error.message };
  }
};

// Test WhatsApp connection on startup
export const testWhatsAppConnection = async () => {
  if (!isWhatsAppConfigured()) {
    console.log('⚠️ WhatsApp configuration incomplete - WhatsApp disabled');
    return false;
  }

  try {
    if (twilioClient) {
      // Just check if client is configured properly
      console.log('✅ WhatsApp service configured successfully');
      return true;
    } else {
      throw new Error('Twilio client not initialized');
    }
  } catch (error) {
    console.error('❌ WhatsApp service configuration failed:', error.message);
    return false;
  }
};

// Get WhatsApp service status
export const getWhatsAppStatus = () => {
  return {
    configured: isWhatsAppConfigured(),
    clientInitialized: !!twilioClient,
    fromNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'Not configured'
  };
};

export default {
  sendWhatsAppConfirmation,
  sendWhatsAppReminder,
  sendCustomWhatsAppMessage,
  sendBulkWhatsAppMessage,
  sendDoctorWhatsAppConfirmation,
  sendDoctorWhatsAppReminder,
  testWhatsAppConnection,
  getWhatsAppStatus,
  isWhatsAppConfigured
};