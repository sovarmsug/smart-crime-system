const nodemailer = require('nodemailer');

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Initialize Firebase Admin (if credentials are available)
let firebaseApp = null;
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.warn('Firebase Admin initialization failed:', error.message);
}

/**
 * Send SMS notification using Twilio
 */
async function sendSMS(phoneNumber, message) {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`SMS sent to ${phoneNumber}: SID ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`SMS sending failed to ${phoneNumber}:`, error);
    throw error;
  }
}

/**
 * Send email notification
 */
async function sendEmail(toEmail, subject, message, htmlContent = null) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured');
    }

    const mailOptions = {
      from: `"Smart Crime System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: message,
      html: htmlContent || `<p>${message.replace(/\n/g, '<br>')}</p>`
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}: Message ID ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Email sending failed to ${toEmail}:`, error);
    throw error;
  }
}

/**
 * Send push notification using Firebase Cloud Messaging
 */
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase Admin not initialized');
    }

    // Get user's FCM tokens from database (you would need to implement this)
    const { db } = require('../config/database');
    const userTokens = await db('user_fcm_tokens')
      .where('user_id', userId)
      .where('is_active', true)
      .select('token');

    if (userTokens.length === 0) {
      console.log(`No active FCM tokens found for user ${userId}`);
      return { success: false, message: 'No active tokens found' };
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      tokens: userTokens.map(t => t.token)
    };

    const result = await admin.messaging().sendMulticast(message);
    
    console.log(`Push notification sent to ${userId}: ${result.successCount} successes, ${result.failureCount} failures`);
    
    // Clean up invalid tokens
    if (result.failureCount > 0) {
      const invalidTokens = [];
      result.responses.forEach((response, index) => {
        if (!response.success && response.error.code === 'messaging/invalid-registration-token') {
          invalidTokens.push(userTokens[index].token);
        }
      });

      if (invalidTokens.length > 0) {
        await db('user_fcm_tokens')
          .whereIn('token', invalidTokens)
          .update({ is_active: false });
      }
    }

    return { 
      success: true, 
      successCount: result.successCount,
      failureCount: result.failureCount
    };
  } catch (error) {
    console.error(`Push notification sending failed for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Send broadcast push notification to multiple users
 */
async function sendBroadcastNotification(userIds, title, body, data = {}) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase Admin not initialized');
    }

    const { db } = require('../config/database');
    const userTokens = await db('user_fcm_tokens')
      .whereIn('user_id', userIds)
      .where('is_active', true)
      .select('token');

    if (userTokens.length === 0) {
      console.log('No active FCM tokens found for target users');
      return { success: false, message: 'No active tokens found' };
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      tokens: userTokens.map(t => t.token)
    };

    const result = await admin.messaging().sendMulticast(message);
    
    console.log(`Broadcast push notification: ${result.successCount} successes, ${result.failureCount} failures`);

    return { 
      success: true, 
      successCount: result.successCount,
      failureCount: result.failureCount
    };
  } catch (error) {
    console.error('Broadcast push notification failed:', error);
    throw error;
  }
}

/**
 * Format crime alert message
 */
function formatCrimeAlertMessage(crimeType, location, severity, description) {
  const severityEmojis = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
    critical: '🚨'
  };

  const emoji = severityEmojis[severity] || '⚠️';
  
  return `${emoji} CRIME ALERT\n\n` +
         `Type: ${crimeType.replace('_', ' ').toUpperCase()}\n` +
         `Severity: ${severity.toUpperCase()}\n` +
         `Location: ${location}\n` +
         `Description: ${description}\n\n` +
         `Please stay alert and report any suspicious activities.`;
}

/**
 * Format prediction alert message
 */
function formatPredictionAlertMessage(riskLevel, area, timePeriod, recommendations) {
  const riskEmojis = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
    critical: '🚨'
  };

  const emoji = riskEmojis[riskLevel] || '⚠️';
  
  return `${emoji} PREDICTION ALERT\n\n` +
         `Risk Level: ${riskLevel.toUpperCase()}\n` +
         `Area: ${area}\n` +
         `Time Period: ${timePeriod}\n` +
         `Recommendations: ${recommendations}\n\n` +
         `Increased vigilance advised in this area.`;
}

/**
 * Send crime report alert
 */
async function sendCrimeAlert(crimeReport, targetUsers, notificationChannels = { sms: false, email: false, push: true }) {
  try {
    const message = formatCrimeAlertMessage(
      crimeReport.crime_type,
      crimeReport.address || `${crimeReport.district}, ${crimeReport.county}`,
      crimeReport.severity,
      crimeReport.description
    );

    const title = `Crime Alert: ${crimeReport.crime_type.replace('_', ' ').toUpperCase()}`;
    const body = `${crimeReport.severity.toUpperCase()} severity reported in ${crimeReport.district || 'your area'}`;

    const results = {
      sms: { sent: 0, failed: 0, total: 0 },
      email: { sent: 0, failed: 0, total: 0 },
      push: { sent: 0, failed: 0, total: 0 }
    };

    // Send SMS
    if (notificationChannels.sms) {
      const phoneUsers = targetUsers.filter(u => u.phone_number);
      results.sms.total = phoneUsers.length;
      
      for (const user of phoneUsers) {
        try {
          await sendSMS(user.phone_number, message);
          results.sms.sent++;
        } catch (error) {
          results.sms.failed++;
        }
      }
    }

    // Send Email
    if (notificationChannels.email) {
      const emailUsers = targetUsers.filter(u => u.email);
      results.email.total = emailUsers.length;
      
      for (const user of emailUsers) {
        try {
          await sendEmail(user.email, title, message);
          results.email.sent++;
        } catch (error) {
          results.email.failed++;
        }
      }
    }

    // Send Push Notifications
    if (notificationChannels.push) {
      try {
        const userIds = targetUsers.map(u => u.id);
        const pushResult = await sendBroadcastNotification(userIds, title, body, {
          type: 'crime_alert',
          crime_id: crimeReport.id,
          severity: crimeReport.severity
        });
        
        results.push.sent = pushResult.successCount;
        results.push.failed = pushResult.failureCount;
        results.push.total = userIds.length;
      } catch (error) {
        results.push.failed = targetUsers.length;
        results.push.total = targetUsers.length;
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending crime alert:', error);
    throw error;
  }
}

/**
 * Send prediction alert
 */
async function sendPredictionAlert(prediction, targetUsers, notificationChannels = { sms: false, email: false, push: true }) {
  try {
    const message = formatPredictionAlertMessage(
      prediction.risk_level,
      prediction.area_description || 'Predicted area',
      prediction.time_period,
      prediction.recommendations || 'Exercise increased caution'
    );

    const title = `Prediction Alert: ${prediction.risk_level.toUpperCase()} Risk`;
    const body = `${prediction.prediction_type.replace('_', ' ').toUpperCase()} prediction for ${prediction.time_period}`;

    const results = {
      sms: { sent: 0, failed: 0, total: 0 },
      email: { sent: 0, failed: 0, total: 0 },
      push: { sent: 0, failed: 0, total: 0 }
    };

    // Similar implementation to sendCrimeAlert
    if (notificationChannels.sms) {
      const phoneUsers = targetUsers.filter(u => u.phone_number);
      results.sms.total = phoneUsers.length;
      
      for (const user of phoneUsers) {
        try {
          await sendSMS(user.phone_number, message);
          results.sms.sent++;
        } catch (error) {
          results.sms.failed++;
        }
      }
    }

    if (notificationChannels.email) {
      const emailUsers = targetUsers.filter(u => u.email);
      results.email.total = emailUsers.length;
      
      for (const user of emailUsers) {
        try {
          await sendEmail(user.email, title, message);
          results.email.sent++;
        } catch (error) {
          results.email.failed++;
        }
      }
    }

    if (notificationChannels.push) {
      try {
        const userIds = targetUsers.map(u => u.id);
        const pushResult = await sendBroadcastNotification(userIds, title, body, {
          type: 'prediction_alert',
          prediction_id: prediction.id,
          risk_level: prediction.risk_level
        });
        
        results.push.sent = pushResult.successCount;
        results.push.failed = pushResult.failureCount;
        results.push.total = userIds.length;
      } catch (error) {
        results.push.failed = targetUsers.length;
        results.push.total = targetUsers.length;
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending prediction alert:', error);
    throw error;
  }
}

module.exports = {
  sendSMS,
  sendEmail,
  sendPushNotification,
  sendBroadcastNotification,
  sendCrimeAlert,
  sendPredictionAlert,
  formatCrimeAlertMessage,
  formatPredictionAlertMessage
};
