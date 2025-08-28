// Complete whatsappService.js with all functions and enhanced error handling
import twilio from 'twilio';

// Check if WhatsApp configuration is available
const isWhatsAppConfigured = () => {
  const configured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  );
  
  if (!configured) {
    console.log('WhatsApp Configuration Status:');
    console.log('  - TWILIO_ACCOUNT_SID:', !!process.env.TWILIO_ACCOUNT_SID);
    console.log('  - TWILIO_AUTH_TOKEN:', !!process.env.TWILIO_AUTH_TOKEN);
    console.log('  - TWILIO_WHATSAPP_NUMBER:', !!process.env.TWILIO_WHATSAPP_NUMBER);
  }
  
  return configured;
};

// Initialize Twilio client with enhanced error handling
let twilioClient = null;
try {
  if (isWhatsAppConfigured()) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio WhatsApp client initialized successfully');
    console.log('WhatsApp number configured:', process.env.TWILIO_WHATSAPP_NUMBER);
  } else {
    console.log('Twilio WhatsApp configuration incomplete - messages will be skipped');
  }
} catch (initError) {
  console.error('Failed to initialize Twilio client:', initError.message);
  twilioClient = null;
}

// Enhanced phone number formatting with validation
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    console.log('No phone number provided');
    return null;
  }
  
  let formatted = phoneNumber.toString().trim();
  console.log('Original phone number:', formatted);
  
  // Remove any existing whatsapp: prefix
  formatted = formatted.replace('whatsapp:', '');
  
  // Remove spaces, dashes, parentheses
  formatted = formatted.replace(/[\s\-\(\)]/g, '');
  
  // Add country code if missing
  if (!formatted.startsWith('+')) {
    if (formatted.startsWith('92')) {
      formatted = '+' + formatted;
    } else if (formatted.startsWith('3')) {
      // Pakistani mobile number starting with 3
      formatted = '+92' + formatted;
    } else {
      // Assume Pakistani number
      formatted = '+92' + formatted;
    }
  }
  
  console.log('Formatted phone number:', formatted);
  
  // Basic validation for Pakistani numbers
  const pakistaniPattern = /^\+923[0-9]{9}$/;
  if (!pakistaniPattern.test(formatted)) {
    console.log('Phone number may not be valid Pakistani mobile:', formatted);
  }
  
  return formatted;
};

// Format date for WhatsApp message
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString.replace(/_/g, '/'));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error.message);
    return dateString;
  }
};

// Send appointment confirmation via WhatsApp to patient
export const sendWhatsAppConfirmation = async (phoneNumber, userName, doctorName, doctorSpecialty, appointmentDate, appointmentTime, fee, appointmentId) => {
  console.log('sendWhatsAppConfirmation called with:', {
    phoneNumber: phoneNumber ? '***' + phoneNumber.slice(-4) : 'null',
    userName,
    doctorName,
    doctorSpecialty,
    appointmentDate,
    appointmentTime,
    fee,
    appointmentId
  });

  try {
    // Configuration check
    if (!isWhatsAppConfigured()) {
      const error = 'WhatsApp service not configured - check environment variables';
      console.log(error);
      return { success: false, message: error };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Parameter validation
    if (!phoneNumber || !userName || !doctorName) {
      throw new Error('Missing required parameters: phoneNumber, userName, or doctorName');
    }

    // Format and validate phone number
    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }

    // Create message
    const message = `
*🏥 Appointment Confirmed - Siddique Hospital*

Dear ${userName},

Your appointment has been successfully booked!

*📋 Appointment Details:*
• Doctor: Dr. ${doctorName}
• Specialty: ${doctorSpecialty || 'General Medicine'}
• Date: ${formatDate(appointmentDate)}
• Time: ${appointmentTime}
• Fee: Rs. ${fee}
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
    `.trim();

    console.log(`Sending WhatsApp message to: ${formattedNumber}`);
    console.log(`Message preview: ${message.substring(0, 100)}...`);

    // Send message via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('WhatsApp confirmation sent successfully');
    console.log('Message details:', {
      sid: result.sid,
      status: result.status,
      to: formattedNumber,
      from: process.env.TWILIO_WHATSAPP_NUMBER
    });

    return { 
      success: true, 
      messageId: result.sid,
      status: result.status,
      to: formattedNumber
    };

  } catch (error) {
    console.error('WhatsApp sending failed:', error.message);
    
    // Log detailed error for debugging
    if (error.code) {
      console.error('Twilio error details:', {
        code: error.code,
        status: error.status,
        message: error.message,
        moreInfo: error.moreInfo
      });
    }

    return { 
      success: false, 
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    };
  }
};

// Send appointment reminder via WhatsApp to patient
export const sendWhatsAppReminder = async (phoneNumber, userName, doctorName, appointmentDate, appointmentTime) => {
  console.log('sendWhatsAppReminder called for:', userName);
  
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
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
    `.trim();

    console.log(`Sending reminder to: ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('WhatsApp reminder sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
    
  } catch (error) {
    console.error('Error sending reminder:', error.message);
    return { success: false, error: error.message };
  }
};

// Send custom WhatsApp message
export const sendCustomWhatsAppMessage = async (phoneNumber, message) => {
  console.log('sendCustomWhatsAppMessage called');
  
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }

    console.log(`Sending custom message to: ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Custom WhatsApp message sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
    
  } catch (error) {
    console.error('Error sending custom WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send bulk WhatsApp notifications (for announcements)
export const sendBulkWhatsAppMessage = async (phoneNumbers, message) => {
  console.log(`sendBulkWhatsAppMessage called for ${phoneNumbers.length} numbers`);
  
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
  
  const successful = results.filter(r => r.success).length;
  console.log(`Bulk WhatsApp completed: ${successful}/${phoneNumbers.length} sent`);
  
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
  console.log('sendDoctorWhatsAppConfirmation called for Dr.', doctorName);

  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }
    
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid doctor phone number format');
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
    `.trim();

    console.log(`Sending doctor WhatsApp to: ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Doctor WhatsApp notification sent successfully');
    console.log('Message SID:', result.sid);

    return { 
      success: true, 
      messageId: result.sid,
      to: formattedNumber 
    };

  } catch (error) {
    console.error('Doctor WhatsApp sending failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
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
  console.log('sendDoctorWhatsAppReminder called for Dr.', doctorName);
  
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }
    
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid doctor phone number format');
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
    `.trim();

    console.log(`Sending doctor reminder to: ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Doctor WhatsApp reminder sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
    
  } catch (error) {
    console.error('Error sending WhatsApp reminder to doctor:', error.message);
    return { success: false, error: error.message };
  }
};

// Send appointment cancellation notification
export const sendAppointmentCancellation = async (phoneNumber, userName, doctorName, appointmentDate, appointmentTime, cancelledBy = 'patient') => {
  console.log('sendAppointmentCancellation called');
  
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }

    const message = `
*❌ Appointment Cancelled - Siddique Hospital*

Dear ${userName},

Your appointment has been cancelled.

*📋 Cancelled Appointment:*
• Doctor: Dr. ${doctorName}
• Date: ${formatDate(appointmentDate)}
• Time: ${appointmentTime}
• Cancelled by: ${cancelledBy}

To book a new appointment:
🌐 Visit: siddiquehospital.com
📞 Call: +923348400517

Thank you for your understanding.
    `.trim();

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Cancellation notification sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
    
  } catch (error) {
    console.error('Error sending cancellation notification:', error.message);
    return { success: false, error: error.message };
  }
};

// Send appointment completion notification
export const sendAppointmentCompletion = async (phoneNumber, userName, doctorName, appointmentDate, appointmentTime) => {
  console.log('sendAppointmentCompletion called');
  
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }

    const message = `
*✅ Appointment Completed - Siddique Hospital*

Dear ${userName},

Your appointment has been completed.

*📋 Completed Appointment:*
• Doctor: Dr. ${doctorName}
• Date: ${formatDate(appointmentDate)}
• Time: ${appointmentTime}

Thank you for visiting Siddique Hospital. We hope you had a great experience!

For any follow-up questions:
📞 Contact: +923348400517
🌐 Website: siddiquehospital.com

Take care and stay healthy! 🙏
    `.trim();

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Completion notification sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
    
  } catch (error) {
    console.error('Error sending completion notification:', error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome message to new patients
export const sendWelcomeWhatsApp = async (phoneNumber, userName) => {
  console.log('sendWelcomeWhatsApp called for:', userName);
  
  try {
    if (!isWhatsAppConfigured()) {
      return { success: false, message: 'WhatsApp not configured' };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }

    const message = `
*🏥 Welcome to Siddique Hospital! 🙏*

Dear ${userName},

Welcome to our hospital family! We're delighted to have you as our patient.

*🌟 Available Services:*
• Online appointment booking
• WhatsApp appointment updates
• 24/7 emergency services
• Multiple specialist consultations

*📱 WhatsApp Commands:*
• Reply *STATUS* - Check appointments
• Reply *BOOK* - Booking information
• Reply *HELP* - Show all commands

*📍 Location:*
Civil Lines, Lahore-Sargodha Road
Sheikhupura, Pakistan

*📞 Contact:*
Phone: +923348400517
Website: siddiquehospital.com

We're here for your healthcare needs!
    `.trim();

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Welcome message sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
    
  } catch (error) {
    console.error('Error sending welcome message:', error.message);
    return { success: false, error: error.message };
  }
};

// Test WhatsApp connection with comprehensive diagnostics
export const testWhatsAppConnection = async () => {
  console.log('Testing WhatsApp connection...');
  
  // Configuration check
  const configStatus = {
    hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
    hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
    hasWhatsAppNumber: !!process.env.TWILIO_WHATSAPP_NUMBER,
    hasTestNumber: !!process.env.TEST_WHATSAPP_NUMBER
  };
  
  console.log('Configuration status:', configStatus);
  
  if (!isWhatsAppConfigured()) {
    return {
      success: false,
      message: 'WhatsApp not configured',
      details: configStatus
    };
  }

  try {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Send test message
    const testNumber = process.env.TEST_WHATSAPP_NUMBER || "+923348400517";
    console.log('Sending test message to:', testNumber);
    
    const result = await sendWhatsAppConfirmation(
      testNumber,
      "Test User",
      "Test Doctor", 
      "General Medicine",
      "1_1_2025",
      "10:00 AM",
      "100",
      "TEST_" + Date.now()
    );
    
    if (result.success) {
      console.log('WhatsApp test successful');
      return {
        success: true,
        message: 'WhatsApp test message sent successfully',
        messageId: result.messageId,
        details: configStatus
      };
    } else {
      console.log('WhatsApp test failed:', result.error);
      return {
        success: false,
        message: 'WhatsApp test failed: ' + result.error,
        details: configStatus
      };
    }
  } catch (error) {
    console.error('WhatsApp test exception:', error.message);
    return {
      success: false,
      message: 'WhatsApp test failed: ' + error.message,
      details: configStatus
    };
  }
};

// Get comprehensive WhatsApp service status
export const getWhatsAppStatus = () => {
  const status = {
    configured: isWhatsAppConfigured(),
    clientInitialized: !!twilioClient,
    fromNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'Not configured',
    testNumber: process.env.TEST_WHATSAPP_NUMBER || 'Not configured',
    environment: {
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasWhatsAppNumber: !!process.env.TWILIO_WHATSAPP_NUMBER,
    }
  };
  
  console.log('WhatsApp service status:', status);
  return status;
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber) => {
  const formatted = formatPhoneNumber(phoneNumber);
  const pakistaniPattern = /^\+923[0-9]{9}$/;
  return {
    original: phoneNumber,
    formatted: formatted,
    isValid: formatted ? pakistaniPattern.test(formatted) : false,
    country: 'Pakistan'
  };
};

// Send scheduled reminders (for cron jobs)
export const sendScheduledReminders = async (appointments) => {
  console.log(`Processing ${appointments.length} reminder appointments`);
  
  const results = [];
  
  for (const appointment of appointments) {
    try {
      // Patient reminder
      if (appointment.userData?.whatsappEnabled && appointment.userData?.whatsappNumber) {
        const patientResult = await sendWhatsAppReminder(
          appointment.userData.whatsappNumber,
          appointment.userData.name,
          appointment.docData.name,
          appointment.slotDate,
          appointment.slotTime
        );
        results.push({ type: 'patient', appointmentId: appointment._id, ...patientResult });
      }
      
      // Doctor reminder
      if (appointment.docData?.whatsappEnabled && appointment.docData?.whatsappNumber) {
        const doctorResult = await sendDoctorWhatsAppReminder(
          appointment.docData.whatsappNumber,
          appointment.docData.name,
          appointment.userData.name,
          appointment.slotDate,
          appointment.slotTime
        );
        results.push({ type: 'doctor', appointmentId: appointment._id, ...doctorResult });
      }
      
      // Add delay between appointments to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error sending reminder for appointment ${appointment._id}:`, error.message);
      results.push({ 
        type: 'error', 
        appointmentId: appointment._id, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`Reminder batch completed: ${successful}/${results.length} sent`);
  
  return {
    total: results.length,
    successful: successful,
    failed: results.length - successful,
    results: results
  };
};

// Export all functions and default object
export {
  formatPhoneNumber,
  isWhatsAppConfigured
};

export default {
  sendWhatsAppConfirmation,
  sendWhatsAppReminder,
  sendCustomWhatsAppMessage,
  sendBulkWhatsAppMessage,
  sendDoctorWhatsAppConfirmation,
  sendDoctorWhatsAppReminder,
  sendAppointmentCancellation,
  sendAppointmentCompletion,
  sendWelcomeWhatsApp,
  testWhatsAppConnection,
  getWhatsAppStatus,
  isWhatsAppConfigured,
  formatPhoneNumber,
  validatePhoneNumber,
  sendScheduledReminders
};