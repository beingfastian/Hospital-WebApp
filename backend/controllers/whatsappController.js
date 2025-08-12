import twilio from 'twilio';
import appointmentModel from "../model/appointmentModel.js";
import userModel from "../model/userModel.js";
import doctorModel from "../model/doctorModel.js";
import { sendWhatsAppConfirmation } from "../config/whatsappService.js";

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

    // Find user by WhatsApp number
    const user = await userModel.findOne({ 
      $or: [
        { whatsappNumber: phoneNumber },
        { phone: phoneNumber }
      ]
    });
    
    switch(userMessage) {
      case 'status':
        if (user) {
          const appointments = await appointmentModel.find({ 
            userId: user._id, 
            cancelled: false 
          }).sort({ date: -1 }).limit(1);
          
          if (appointments.length > 0) {
            const apt = appointments[0];
            responseMessage = `
*Your Latest Appointment:*
Date: ${apt.slotDate}
Time: ${apt.slotTime}
Doctor: Dr. ${apt.docData.name}
Status: ${apt.isCompleted ? 'Completed' : 'Upcoming'}
            `;
          } else {
            responseMessage = 'You have no upcoming appointments.';
          }
        } else {
          responseMessage = 'No user found with this phone number. Please register on our website first.';
        }
        break;
        
      case 'cancel':
        if (user) {
          const appointment = await appointmentModel.findOne({ 
            userId: user._id, 
            cancelled: false,
            isCompleted: false 
          }).sort({ date: -1 });
          
          if (appointment) {
            // Cancel the appointment
            appointment.cancelled = true;
            await appointment.save();
            
            // Release doctor slot
            const doctor = await doctorModel.findById(appointment.docId);
            if (doctor && doctor.slots_booked[appointment.slotDate]) {
              doctor.slots_booked[appointment.slotDate] = 
                doctor.slots_booked[appointment.slotDate].filter(
                  time => time !== appointment.slotTime
                );
              await doctor.save();
            }
            
            responseMessage = '❌ Your appointment has been cancelled successfully.';
          } else {
            responseMessage = 'No active appointment found to cancel.';
          }
        } else {
          responseMessage = 'Please register on our website to manage appointments.';
        }
        break;
        
      case 'help':
      default:
        responseMessage = `
*Welcome to Prescripto Bot! 🏥*

Commands:
• *STATUS* - Check appointment
• *CANCEL* - Cancel appointment
• *HELP* - Show this menu

To book appointments, please visit our website or app.
        `;
    }

    // Send Twilio response
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(responseMessage);
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send WhatsApp notification for new appointment
export const sendWhatsAppNotification = async (req, res) => {
  try {
    const { phoneNumber, appointmentDetails } = req.body;
    
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