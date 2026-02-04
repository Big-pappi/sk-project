import nodemailer from "nodemailer";

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Sokoni Kiganjani" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}

// Email Templates
export function generateVerificationEmail(name: string, verificationLink: string) {
  return {
    subject: "Verify Your Sokoni Kiganjani Account",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Sokoni Kiganjani</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Local Marketplace</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for joining Sokoni Kiganjani! To complete your registration and start exploring our marketplace, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.3s;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 20px 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0; color: #22c55e; font-size: 14px; word-break: break-all;">
                ${verificationLink}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              
              <p style="margin: 0; color: #6a6a6a; font-size: 13px;">
                This link will expire in 24 hours. If you didn't create an account with Sokoni Kiganjani, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6a6a6a; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@sokoni.co.tz" style="color: #22c55e; text-decoration: none;">support@sokoni.co.tz</a>
              </p>
              <p style="margin: 0; color: #9a9a9a; font-size: 12px;">
                © ${new Date().getFullYear()} Sokoni Kiganjani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

export function generateOrderConfirmationEmail(
  customerName: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  deliveryAddress: string
) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
          <span style="color: #1a1a1a; font-weight: 500;">${item.name}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">
          TZS ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Confirmed!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9);">Order #${orderId.slice(0, 8).toUpperCase()}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px;">
                Hi ${customerName}, thank you for your order! We're preparing it for delivery.
              </p>
              
              <!-- Order Items -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 12px 0; text-align: left; color: #6a6a6a; font-size: 14px;">Item</th>
                  <th style="padding: 12px 0; text-align: center; color: #6a6a6a; font-size: 14px;">Qty</th>
                  <th style="padding: 12px 0; text-align: right; color: #6a6a6a; font-size: 14px;">Price</th>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 16px 0; text-align: right; font-weight: 600; font-size: 18px;">Total:</td>
                  <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 18px; color: #22c55e;">TZS ${total.toLocaleString()}</td>
                </tr>
              </table>
              
              <!-- Delivery Address -->
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="margin: 0 0 10px; color: #1a1a1a; font-size: 16px;">Delivery Address</h3>
                <p style="margin: 0; color: #4a4a4a;">${deliveryAddress}</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9a9a9a; font-size: 12px;">
                © ${new Date().getFullYear()} Sokoni Kiganjani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

export function generateDeliveryUpdateEmail(
  customerName: string,
  orderId: string,
  status: "picked_up" | "in_transit" | "delivered",
  riderName?: string,
  riderPhone?: string
) {
  const statusMessages = {
    picked_up: {
      title: "Your Order Has Been Picked Up!",
      message: "Your order has been picked up by our delivery partner and is on its way.",
    },
    in_transit: {
      title: "Your Order Is On The Way!",
      message: "Your order is currently in transit and will arrive soon.",
    },
    delivered: {
      title: "Order Delivered!",
      message: "Your order has been successfully delivered. Enjoy!",
    },
  };

  const { title, message } = statusMessages[status];

  return {
    subject: `${title} - Order #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px;">
                Hi ${customerName}, ${message}
              </p>
              ${riderName && riderPhone ? `
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #1a1a1a; font-size: 16px;">Delivery Partner</h3>
                <p style="margin: 0; color: #4a4a4a;">
                  <strong>${riderName}</strong><br>
                  <a href="tel:${riderPhone}" style="color: #22c55e; text-decoration: none;">${riderPhone}</a>
                </p>
              </div>
              ` : ""}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9a9a9a; font-size: 12px;">
                © ${new Date().getFullYear()} Sokoni Kiganjani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

export function generateWelcomeSellerEmail(shopName: string, ownerName: string) {
  return {
    subject: "Welcome to Sokoni Kiganjani - Your Shop is Ready!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome, Seller!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9);">${shopName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">Hi ${ownerName}!</h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Congratulations! Your shop "${shopName}" has been created on Sokoni Kiganjani. Here's what you can do next:
              </p>
              
              <ul style="padding-left: 20px; color: #4a4a4a; font-size: 16px; line-height: 2;">
                <li>Add products to your catalog</li>
                <li>Set up your shop profile and branding</li>
                <li>Wait for admin verification</li>
                <li>Start receiving orders!</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Go to Dashboard
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9a9a9a; font-size: 12px;">
                © ${new Date().getFullYear()} Sokoni Kiganjani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}
