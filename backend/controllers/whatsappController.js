import twilio from 'twilio';
import appointmentModel from "../model/appointmentModel.js";
import userModel from "../model/userModel.js";
import doctorModel from "../model/doctorModel.js";
import { sendWhatsAppConfirmation, sendWhatsAppReminder } from "../config/whatsappService.js";

// Format date for display
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString.replace(/_/g, '/'));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Handle incoming WhatsApp messages
export const handleWhatsAppWebhook = async (req, res) => {
  try {
    const { Body, From } = req.body;
    
    if (!Body || !From) {
      return res.status(400).send('Invalid request');
    }
    
    const userMessage = Body.toLowerCase().trim();
    const phoneNumber = From.replace('whatsapp:', '');
    
    let responseMessage = '';

    console.log(`WhatsApp message received from ${phoneNumber}: ${userMessage}`);

    // Find user by WhatsApp number
    const user = await userModel.findOne({ 
      $or: [
        { whatsappNumber: phoneNumber },
        { phone: phoneNumber }
      ]
    });
    
    if (!user) {
      responseMessage = `
*Welcome to Siddique Hospital! 🏥*

We couldn't find your account with this number. Please:
1. Register on our website: siddiquehospital.com
2. Enable WhatsApp notifications in your profile
3. Or contact us at +923348400517

Thank you for choosing Siddique Hospital!
      `;
    } else {
      switch(userMessage) {
        case 'status':
          try {
            const appointments = await appointmentModel.find({ 
              userId: user._id.toString()
            }).sort({ date: -1 }).limit(3);
            
            if (appointments.length > 0) {
              let statusText = `*Hello ${user.name}! 👋*\n\n*Your Recent Appointments:*\n\n`;
              
              appointments.forEach((apt, index) => {
                const status = apt.cancelled ? '❌ Cancelled' : 
                             apt.isCompleted ? '✅ Completed' : 
                             '⏰ Upcoming';
                             
                statusText += `${index + 1}. *Dr. ${apt.docData.name}*\n`;
                statusText += `   📅 ${formatDisplayDate(apt.slotDate)}\n`;
                statusText += `   🕐 ${apt.slotTime}\n`;
                statusText += `   ${status}\n\n`;
              });
              
              statusText += `Need help? Reply *HELP* for more options.`;
              responseMessage = statusText;
            } else {
              responseMessage = `
*Hello ${user.name}! 👋*

You currently have no appointments.

To book an appointment:
🌐 Visit: siddiquehospital.com
📞 Call: +923348400517
💬 WhatsApp: +923348400517

Reply *HELP* for more options.
              `;
            }
          } catch (error) {
            console.error('Error fetching appointments:', error);
            responseMessage = 'Sorry, there was an error fetching your appointments. Please try again later.';
          }
          break;
          
        case 'cancel':
          try {
            const appointment = await appointmentModel.findOne({ 
              userId: user._id.toString(), 
              cancelled: false,
              isCompleted: false 
            }).sort({ date: -1 });
            
            if (appointment) {
              // Cancel the appointment
              await appointmentModel.findByIdAndUpdate(appointment._id, {
                cancelled: true
              });
              
              // Release doctor slot
              const doctor = await doctorModel.findById(appointment.docId);
              if (doctor && doctor.slots_booked[appointment.slotDate]) {
                doctor.slots_booked[appointment.slotDate] = 
                  doctor.slots_booked[appointment.slotDate].filter(
                    time => time !== appointment.slotTime
                  );
                await doctor.save();
              }
              
              responseMessage = `
*Appointment Cancelled Successfully ❌*

Details:
👨‍⚕️ Dr. ${appointment.docData.name}
📅 ${formatDisplayDate(appointment.slotDate)}
🕐 ${appointment.slotTime}

To book a new appointment:
🌐 Visit: siddiquehospital.com
📞 Call: +923348400517

Thank you!
              `;
            } else {
              responseMessage = `
*No Active Appointment Found*

You don't have any upcoming appointments to cancel.

To book a new appointment:
🌐 Visit: siddiquehospital.com
📞 Call: +923348400517

Reply *HELP* for more options.
              `;
            }
          } catch (error) {
            console.error('Error cancelling appointment:', error);
            responseMessage = 'Sorry, there was an error cancelling your appointment. Please try again later or contact us directly.';
          }
          break;
          
        case 'book':
        case 'appointment':
          responseMessage = `
*Book New Appointment 📅*

To book an appointment with our doctors:

🌐 *Website:* siddiquehospital.com
📞 *Call:* +923348400517  
💬 *WhatsApp:* +923348400517

*Our Specialties:*
• General Medicine
• Pediatrics  
• Gynecology
• Dermatology
• Neurology
• Gastroenterology

We're here to help! 🏥
          `;
          break;
          
        case 'contact':
        case 'info':
          responseMessage = `
*Siddique Hospital Contact Info 🏥*

📍 *Address:*
Civil Lines, Lahore-Sargodha Road
Sheikhupura, Pakistan

📞 *Phone:* +923348400517
💬 *WhatsApp:* +923348400517
📧 *Email:* Siddiquehospital@gmail.com

🌐 *Website:* siddiquehospital.com

*Social Media:*
📘 Facebook: Siddique Hospital
📸 Instagram: @siddique.hospital

We're here 24/7 for emergencies! 🚑
          `;
          break;
          
        case 'help':
        case 'menu':
        default:
          responseMessage = `
*Welcome to Siddique Hospital Bot! 🏥*

*Available Commands:*
• *STATUS* - Check your appointments
• *CANCEL* - Cancel latest appointment  
• *BOOK* - Get booking information
• *CONTACT* - Hospital contact details
• *HELP* - Show this menu

*Quick Actions:*
🌐 Book Online: siddiquehospital.com
📞 Call Direct: +923348400517

How can we help you today?
          `;
      }
    }

    // Send Twilio response
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(responseMessage);
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
    
    console.log(`WhatsApp response sent to ${phoneNumber}`);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    
    // Send error response
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Sorry, there was an error processing your request. Please try again later or contact us directly at +923348400517.');
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

// Send WhatsApp notification for new appointment
export const sendWhatsAppNotification = async (req, res) => {
  try {
    const { phoneNumber, appointmentDetails } = req.body;
    
    if (!phoneNumber || !appointmentDetails) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and appointment details are required' 
      });
    }
    
    const result = await sendWhatsAppConfirmation(
      phoneNumber,
      appointmentDetails.userName,
      appointmentDetails.doctorName,
      appointmentDetails.doctorSpeciality,
      appointmentDetails.date,
      appointmentDetails.time,
      appointmentDetails.fee,
      appointmentDetails.appointmentId
    );
    
    res.json(result);
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send WhatsApp reminder
export const sendWhatsAppAppointmentReminder = async (req, res) => {
  try {
    const { phoneNumber, userName, doctorName, appointmentDate, appointmentTime } = req.body;
    
    if (!phoneNumber || !userName || !doctorName || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required for reminder' 
      });
    }
    
    const result = await sendWhatsAppReminder(
      phoneNumber,
      userName,
      doctorName,
      appointmentDate,
      appointmentTime
    );
    
    res.json(result);
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test WhatsApp connection
export const testWhatsApp = async (req, res) => {
  try {
    const testNumber = process.env.TEST_WHATSAPP_NUMBER || "+923348400517";
    
    const result = await sendWhatsAppConfirmation(
      testNumber,
      "Test User",
      "Test Doctor",
      "General Medicine",
      "1_1_2024",
      "10:00 AM",
      "100",
      "test123"
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: "WhatsApp test message sent successfully",
        messageId: result.messageId 
      });
    } else {
      res.json({ 
        success: false, 
        message: "WhatsApp test failed: " + result.error 
      });
    }
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};