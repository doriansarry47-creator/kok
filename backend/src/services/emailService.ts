import nodemailer from 'nodemailer';
import { BookingWithUser } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@therapie-sensorimotrice.fr';
const APP_NAME = 'Thérapie Sensorimotrice';

export const sendBookingConfirmation = async (booking: BookingWithUser) => {
  try {
    const dateFormatted = format(new Date(booking.date), 'EEEE dd MMMM yyyy', { locale: fr });
    const mailOptions = {
      from: FROM_EMAIL,
      to: booking.patient_email,
      subject: `Confirmation de rendez-vous - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .booking-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Rendez-vous confirmé</h1>
            </div>
            <div class="content">
              <p>Bonjour ${booking.patient_first_name || 'Cher patient'},</p>
              <p>Votre rendez-vous a été confirmé avec succès.</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">📅 Date :</span> ${dateFormatted}
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Heure :</span> ${booking.start_time} - ${booking.end_time}
                </div>
                ${
                  booking.reason
                    ? `<div class="detail-row">
                         <span class="detail-label">📝 Motif :</span> ${booking.reason}
                       </div>`
                    : ''
                }
                <div class="detail-row">
                  <span class="detail-label">🆔 Référence :</span> ${booking.id}
                </div>
              </div>

              <p><strong>Important :</strong> Pour annuler ou modifier votre rendez-vous, veuillez le faire au moins 24 heures à l'avance.</p>
              
              <p>À très bientôt,<br>${APP_NAME}</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>© ${new Date().getFullYear()} ${APP_NAME} - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Email de confirmation envoyé', {
      bookingId: booking.id,
      email: booking.patient_email,
    });
  } catch (error) {
    logger.error('Erreur envoi email confirmation', { error, bookingId: booking.id });
    throw error;
  }
};

export const sendBookingReminder = async (booking: BookingWithUser) => {
  try {
    const dateFormatted = format(new Date(booking.date), 'EEEE dd MMMM yyyy', { locale: fr });
    const mailOptions = {
      from: FROM_EMAIL,
      to: booking.patient_email,
      subject: `Rappel : Rendez-vous demain - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .booking-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rappel de rendez-vous</h1>
            </div>
            <div class="content">
              <p>Bonjour ${booking.patient_first_name || 'Cher patient'},</p>
              <p>Nous vous rappelons votre rendez-vous prévu demain.</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">📅 Date :</span> ${dateFormatted}
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Heure :</span> ${booking.start_time} - ${booking.end_time}
                </div>
                <div class="detail-row">
                  <span class="detail-label">🆔 Référence :</span> ${booking.id}
                </div>
              </div>

              <p>En cas d'empêchement, merci de nous prévenir au plus tôt.</p>
              
              <p>À demain,<br>${APP_NAME}</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>© ${new Date().getFullYear()} ${APP_NAME} - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Email de rappel envoyé', { bookingId: booking.id, email: booking.patient_email });
  } catch (error) {
    logger.error('Erreur envoi email rappel', { error, bookingId: booking.id });
    throw error;
  }
};

export const sendBookingCancellation = async (
  booking: BookingWithUser,
  cancelledBy: 'patient' | 'admin'
) => {
  try {
    const dateFormatted = format(new Date(booking.date), 'EEEE dd MMMM yyyy', { locale: fr });
    const mailOptions = {
      from: FROM_EMAIL,
      to: booking.patient_email,
      subject: `Annulation de rendez-vous - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .booking-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Rendez-vous annulé</h1>
            </div>
            <div class="content">
              <p>Bonjour ${booking.patient_first_name || 'Cher patient'},</p>
              <p>${
                cancelledBy === 'patient'
                  ? 'Votre rendez-vous a été annulé avec succès.'
                  : 'Votre rendez-vous a été annulé par le thérapeute.'
              }</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">📅 Date :</span> ${dateFormatted}
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Heure :</span> ${booking.start_time} - ${booking.end_time}
                </div>
                ${
                  booking.cancellation_reason
                    ? `<div class="detail-row">
                         <span class="detail-label">📝 Raison :</span> ${booking.cancellation_reason}
                       </div>`
                    : ''
                }
                <div class="detail-row">
                  <span class="detail-label">🆔 Référence :</span> ${booking.id}
                </div>
              </div>

              <p>Vous pouvez prendre un nouveau rendez-vous à tout moment via votre espace patient.</p>
              
              <p>Cordialement,<br>${APP_NAME}</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>© ${new Date().getFullYear()} ${APP_NAME} - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Email d\'annulation envoyé', {
      bookingId: booking.id,
      email: booking.patient_email,
    });
  } catch (error) {
    logger.error('Erreur envoi email annulation', { error, bookingId: booking.id });
    throw error;
  }
};
