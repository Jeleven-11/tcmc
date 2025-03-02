'use server';

import nodemailer from 'nodemailer';
const SMTP_SERVER_HOST = process.env.SMTP_SERVER_HOST;
const SMTP_SERVER_USERNAME = process.env.SMTP_SERVER_USERNAME;
const SMTP_SERVER_PASSWORD = process.env.NODEMAILER_APP_PASSWORD;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: SMTP_SERVER_HOST,
  port: 587,
  secure: true,
  auth: {
    user: SMTP_SERVER_USERNAME,
    pass: SMTP_SERVER_PASSWORD,
  },
});

export default async function sendEmail(to: string, subject: string, text: string, html:string) {
    try {
      const info = await transporter.sendMail({
        from: SMTP_SERVER_USERNAME,
        to,
        subject,
        text,
        html
      });
  
      return { success: true, messageId: info.messageId };
    } catch (error) {
      return { success: false, error: error };
    }
  }