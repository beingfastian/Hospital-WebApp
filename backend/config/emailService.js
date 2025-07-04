import nodemailer from 'nodemailer';

// Check if email configuration is available
const isEmailConfigured = () => {
  return !!(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_FROM
  );
};

// Create email transporter with validation
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('Email configuration incomplete. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });
};

// Format date for email
const formatDate = (dateString) => {
  const date = new Date(dateString.replace(/_/g, '/'));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Send appointment confirmation to user
export const sendUserAppointmentConfirmation = async (userEmail, userName, doctorName, doctorSpeciality, appointmentDate, appointmentTime, fee) => {
  try {
    if (!isEmailConfigured()) {
      console.log('Email not configured - User confirmation email skipped');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: '🏥 Appointment Confirmed - Prescripto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin-bottom: 10px;">Prescripto</h1>
            <h2 style="color: #333; margin-top: 0;">Appointment Confirmed! ✅</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Dear ${userName},</h3>
            <p style="color: #666; line-height: 1.6;">
              Your appointment has been successfully booked. Here are the details:
            </p>
          </div>
          
          <div style="background-color: #fff; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #4CAF50; margin-top: 0; margin-bottom: 15px;">📋 Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Speciality:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${doctorSpeciality}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(appointmentDate)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${appointmentTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Fee:</strong></td>
                <td style="padding: 10px 0;">$${fee}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-top: 0;">📝 Important Notes:</h4>
            <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Please arrive 10 minutes before your scheduled appointment</li>
              <li>Bring a valid ID and any relevant medical documents</li>
              <li>You can cancel or reschedule up to 24 hours before your appointment</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Thank you for choosing Prescripto for your healthcare needs!
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ User appointment confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending user email:', error.message);
  }
};

// Send appointment notification to doctor
export const sendDoctorAppointmentNotification = async (doctorEmail, doctorName, userName, userEmail, appointmentDate, appointmentTime, fee) => {
  try {
    if (!isEmailConfigured()) {
      console.log('Email not configured - Doctor notification email skipped');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: doctorEmail,
      subject: '🔔 New Appointment Booked - Prescripto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2196F3; margin-bottom: 10px;">Prescripto</h1>
            <h2 style="color: #333; margin-top: 0;">New Appointment Booked! 📅</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Dear Dr. ${doctorName},</h3>
            <p style="color: #666; line-height: 1.6;">
              You have a new appointment booking. Please review the details below:
            </p>
          </div>
          
          <div style="background-color: #fff; border: 2px solid #2196F3; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2196F3; margin-top: 0; margin-bottom: 15px;">👤 Patient Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Patient Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${userName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Patient Email:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Appointment Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(appointmentDate)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Appointment Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${appointmentTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Consultation Fee:</strong></td>
                <td style="padding: 10px 0;">$${fee}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #1976d2; margin: 0; font-weight: 500;">
              💡 Please log in to your doctor dashboard to manage this appointment.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Thank you for being part of the Prescripto team!
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Doctor appointment notification email sent successfully');
  } catch (error) {
    console.error('❌ Error sending doctor email:', error.message);
  }
};

// Send appointment notification to admin
export const sendAdminAppointmentNotification = async (doctorName, userName, userEmail, appointmentDate, appointmentTime, fee) => {
  try {
    if (!isEmailConfigured()) {
      console.log('Email not configured - Admin notification email skipped');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: '📊 New Appointment Booked - Prescripto Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF9800; margin-bottom: 10px;">Prescripto Admin</h1>
            <h2 style="color: #333; margin-top: 0;">New Appointment Alert! 🚨</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Dear Admin,</h3>
            <p style="color: #666; line-height: 1.6;">
              A new appointment has been booked on the platform. Here are the details:
            </p>
          </div>
          
          <div style="background-color: #fff; border: 2px solid #FF9800; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #FF9800; margin-top: 0; margin-bottom: 15px;">📋 Appointment Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Patient:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${userName} (${userEmail})</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Dr. ${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(appointmentDate)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${appointmentTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Fee:</strong></td>
                <td style="padding: 10px 0;">$${fee}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #e65100; margin: 0; font-weight: 500;">
              📈 Check your admin dashboard for more details and analytics.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              This notification helps you monitor platform activity.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated email from Prescripto Admin System.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Admin appointment notification email sent successfully');
  } catch (error) {
    console.error('❌ Error sending admin email:', error.message);
  }
};

// Test email connection on startup
export const testEmailConnection = async () => {
  if (!isEmailConfigured()) {
    console.log('⚠️  Email configuration incomplete - emails disabled');
    return false;
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection successful');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};