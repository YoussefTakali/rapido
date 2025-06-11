import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { SendDevisDto } from './dto/create-mail.dto';
import * as nodemailer from 'nodemailer';
import e from 'express';
import { emit } from 'process';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private stripe: Stripe;

  constructor() {
    // Initialize Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-05-28.basil",
    });
  }

private createTransporter() {
   console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
  console.log('SMTP_PASS length:', process.env.SMTP_PASS?.length);
  return nodemailer.createTransport({ // ✅ Correct
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false , // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}


  async createStripePaymentSession(totalTtc: number): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Devis Payment',
              },
              unit_amount: Math.round(totalTtc * 100 * 0.5), // 50% deposit in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      });

      if (!session.url) { 
        throw new Error('Failed to create payment session URL');
      }
      return session.url;
    } catch (error) {
      this.logger.error('Error creating Stripe session:', error);
      throw error;
    }
  }

  private generateEmailContent(data: SendDevisDto, paymentLink?: string): string {
    const formattedDate = new Date(data.dem_date).toLocaleDateString('fr-FR');
    
    let htmlContent = `
      <p><strong>Objet : Votre devis de déménagement – ${data.company_name}</strong></p>

      <p>Cher(e) Mme/M. ${data.client_name},</p>

      <p>Nous vous remercions pour la confiance que vous accordez à <strong>${data.company_name}</strong> dans le cadre de votre projet de déménagement.</p>

      <p>Suite à notre échange, vous trouverez ci-joint les détails de votre devis personnalisé :</p>
      <ul>
          <li><strong>Montant du devis :</strong> ${data.total_M} €</li>
          <li><strong>Date prévue du déménagement :</strong> ${formattedDate}</li>
          <li><strong>Numéro de devis :</strong> ${data.devis_number}</li>
      </ul>`;

    if (paymentLink) {
      htmlContent += `
        <p>Afin de finaliser votre réservation, nous vous invitons à effectuer le versement de l'acompte correspondant à <strong>50% du montant total</strong>, via le lien sécurisé suivant :</p>
        <p>💳 👉 <a href='${paymentLink}'><strong>Lien de paiement sécurisé</strong></a></p>`;
    }

    const companyContact = data.company_name === "RAPIDO Déménagement" 
      ? `📧 devis@rapido-demenagement.fr<br/>
         📞 04 65 84 60 33<br/>
         🌐 <a href='https://www.rapido-demenagement.fr'>www.rapido-demenagement.fr</a>`
      : `📧 devis@otis-demenagement.fr<br/>
         📞 01 89 70 82 07 | 01 89 70 56 19<br/>
         🌐 <a href='https://otis-demenagement.fr'>otis-demenagement.fr</a>`;

    htmlContent += `
      <p>Notre équipe commerciale reste à votre entière disposition pour toute question ou ajustement concernant cette offre.</p>
      
      <p>Dans l'attente de votre confirmation, nous vous remercions à nouveau pour votre confiance.</p>
      
      <p><strong>Bien cordialement,</strong></p>
      
      <p><strong>Département Commercial</strong><br/>
      <strong>${data.company_name}</strong><br/>
      ${companyContact}</p>`;

    return htmlContent;
  }

  async sendDevisMail(data: SendDevisDto): Promise<boolean> {
    console.log('Sending email with data:', data);
    try {
      let paymentLink: string | undefined;

      // Create payment link if total_ttc is provided
      if (data.total_ttc) {
        paymentLink = await this.createStripePaymentSession(data.total_ttc);
      }

      const transporter = this.createTransporter();
      const htmlContent = this.generateEmailContent(data, paymentLink);

      // Prepare attachments
      const attachments = [
        {
          filename: 'devis.pdf',
          content: data.pdf1Content,
          contentType: 'application/pdf',
        },
        {
          filename: 'cgv.pdf',
          content: data.pdf2Content,
          contentType: 'application/pdf',
        },
      ];

      // Add third PDF if provided
      if (data.pdf3Content) {
        attachments.push({
          filename: 'ListeMobilier.pdf',
          content: data.pdf3Content,
          contentType: 'application/pdf',
        });
      }
      console.log(data.company_email, data.client_email, data.client_name, data.devis_number, data.dem_date, data.company_name);
      const mailOptions = {
        from: {
          name: data.company_name,
          address: data.company_email,
        },
        to: `"${data.client_name}" <${data.client_email}>`, // ✅ correct format
        bcc: `"${data.company_name}" <${data.company_email}>`, // ✅ correct format
        subject: `Votre devis n°${data.devis_number}`,
        html: htmlContent,
        attachments,
      };


      const result = await transporter.sendMail(mailOptions);
      this.logger.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }
}