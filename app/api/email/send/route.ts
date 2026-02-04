import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendEmail,
  generateVerificationEmail,
  generateOrderConfirmationEmail,
  generateDeliveryUpdateEmail,
  generateWelcomeSellerEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case "verification": {
        const { email, name, token } = data;
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
        const emailContent = generateVerificationEmail(name, verificationLink);
        
        const result = await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        return NextResponse.json(result);
      }

      case "order_confirmation": {
        const { email, customerName, orderId, items, total, deliveryAddress } = data;
        const emailContent = generateOrderConfirmationEmail(
          customerName,
          orderId,
          items,
          total,
          deliveryAddress
        );

        const result = await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        return NextResponse.json(result);
      }

      case "delivery_update": {
        const { email, customerName, orderId, status, riderName, riderPhone } = data;
        const emailContent = generateDeliveryUpdateEmail(
          customerName,
          orderId,
          status,
          riderName,
          riderPhone
        );

        const result = await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        return NextResponse.json(result);
      }

      case "welcome_seller": {
        const { email, shopName, ownerName } = data;
        const emailContent = generateWelcomeSellerEmail(shopName, ownerName);

        const result = await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
