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

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
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

// Email template for Siddique Hospital
const getEmailTemplate = (title, content, type = 'info') => {
  const colors = {
    info: '#4CAF50',
    warning: '#FF9800',
    success: '#2196F3'
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${colors[type]}; margin-bottom: 10px;">🏥 Siddique Hospital</h1>
        <h2 style="color: #333; margin-top: 0;">${title}</h2>
      </div>
      
      ${content}
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
        <h3 style="color: #333; margin-top: 0;">📍 Hospital Information</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Address:</strong> Civil Lines, Lahore-Sargodha Road, Sheikhupura</p>
        <p style="color: #666; margin: 5px 0;"><strong>Phone:</strong> +923348400517</p>
        <p style="color: #666; margin: 5px 0;"><strong>WhatsApp:</strong> +923348400517</p>
        <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> Siddiquehospital@gmail.com</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; font-size: 14px;">
          Thank you for choosing Siddique Hospital for your healthcare needs!
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
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

    const content = `
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
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Dr. ${doctorName}</td>
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
          <li>For WhatsApp updates, reply with STATUS to check appointment status</li>
        </ul>
      </div>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: '🏥 Appointment Confirmed - Siddique Hospital',
      html: getEmailTemplate('Appointment Confirmed! ✅', content, 'success')
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

    const content = `
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
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: doctorEmail,
      subject: '📅 New Appointment Booked - Siddique Hospital',
      html: getEmailTemplate('New Appointment Booked! 📅', content, 'info')
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
    if (!isEmailConfigured() || !process.env.ADMIN_EMAIL) {
      console.log('Email not configured or admin email not set - Admin notification email skipped');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) return;

    const content = `
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Dear Admin,</h3>
        <p style="color: #666; line-height: 1.6;">
          A new appointment has been booked on the Siddique Hospital platform. Here are the details:
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
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: '📊 New Appointment Booked - Siddique Hospital Admin',
      html: getEmailTemplate('New Appointment Alert! 🚨', content, 'warning')
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Admin appointment notification email sent successfully');
  } catch (error) {
    console.error('❌ Error sending admin email:', error.message);
  }
};

// Send welcome email to new patients
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    if (!isEmailConfigured()) {
      console.log('Email not configured - Welcome email skipped');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) return;

    const content = `
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Welcome ${userName}!</h3>
        <p style="color: #666; line-height: 1.6;">
          Thank you for registering with Siddique Hospital. We're committed to providing you with the best healthcare services.
        </p>
      </div>
      
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: #2e7d32; margin-top: 0;">🌟 What's Next?</h4>
        <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Complete your profile with personal information</li>
          <li>Enable WhatsApp notifications for instant updates</li>
          <li>Browse our qualified doctors and their specialties</li>
          <li>Book your first appointment online</li>
        </ul>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: '🏥 Welcome to Siddique Hospital',
      html: getEmailTemplate('Welcome to Our Hospital Family! 🎉', content, 'success')
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully');
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
  }
};

// Test email connection on startup
export const testEmailConnection = async () => {
  if (!isEmailConfigured()) {
    console.log('⚠️ Email configuration incomplete - emails disabled');
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

// Get email service status
export const getEmailStatus = () => {
  return {
    configured: isEmailConfigured(),
    host: process.env.EMAIL_HOST || 'Not configured',
    from: process.env.EMAIL_FROM || 'Not configured'
  };
};