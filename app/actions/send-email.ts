'use server'

import nodemailer from 'nodemailer'
import { siteConfig } from '@/config/site'

export type SendEmailState = {
  success?: boolean
  error?: string
}

export async function sendContactEmail(prevState: SendEmailState, formData: FormData): Promise<SendEmailState> {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string
  const honeypot = formData.get('_gotcha') as string
  const formType = formData.get('formType') as string

  // Honeypot Spam Protection
  // If the hidden field is filled, it's likely a bot. Return success to fool them.
  if (honeypot) {
    console.warn('Honeypot field filled. Rejecting spam.')
    return { success: true }
  }

  // Simple validation
  if (!firstName || !email || !message) {
    return { success: false, error: 'Please fill in all required fields.' }
  }

  // SMTP Configuration Check
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP configuration')
    return { success: false, error: 'Server configuration error. Please contact us directly.' }
  }

  const emailSubject = formType === 'appointment'
    ? `New Appointment Request: ${firstName} ${lastName}`
    : `New Contact Inquiry: ${firstName} ${lastName}`

  const emailHeader = formType === 'appointment'
    ? "New Appointment Request"
    : "New Contact Inquiry"

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"FitSquare Website" <${process.env.SMTP_USER}>`,
      to: siteConfig.contact.email,
      replyTo: email,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${emailHeader}</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          </div>
          <div style="margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This email was sent from the ${formType === 'appointment' ? 'appointment' : 'contact'} form on your website.
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: 'Failed to send message. Please try again later.' }
  }
}
