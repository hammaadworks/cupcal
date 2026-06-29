import type { APIRoute } from 'astro';
import { supabase } from '../../../utils/supabase';

// Web Crypto SHA-256
async function generateSha256(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Unicode safe base64
function utoa(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

export const POST: APIRoute = async ({ request, url, locals }) => {
  try {
    const { eventId, email, whatsapp, priceInCents, name } = await request.json();

    // Insert pending ticket into DB to get UUID
    const { data: ticket, error } = await supabase
      .from('finals_tickets')
      .insert([
        {
          event_id: eventId,
          email,
          whatsapp,
          payment_status: 'pending'
        }
      ])
      .select('id')
      .single();

    if (error || !ticket) {
      console.error('Supabase Error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    const transactionId = ticket.id;
    const amount = priceInCents; // Already in paise
    const env = (locals as any).runtime?.env || import.meta.env;
    const merchantId = env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const saltKey = env.PHONEPE_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = env.PHONEPE_SALT_INDEX || '1';
    
    // Create base URL for redirects/callbacks
    const baseUrl = `${url.protocol}//${url.host}`;

    const payload = {
      merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: email,
      amount,
      redirectUrl: `${baseUrl}/api/payment/redirect?id=${transactionId}`,
      redirectMode: "POST",
      callbackUrl: `${baseUrl}/api/payment/callback`,
      mobileNumber: whatsapp.replace(/\D/g, '').substring(0, 10),
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const base64Payload = utoa(JSON.stringify(payload));
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256Hash = await generateSha256(stringToHash);
    const xVerify = sha256Hash + "###" + saltIndex;

    const phonePeUrl = env.PHONEPE_ENV === 'PROD' 
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    const phonepeResponse = await fetch(phonePeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const phonepeData = await phonepeResponse.json();

    if (phonepeData.success && phonepeData.data && phonepeData.data.instrumentResponse) {
      const redirectUrl = phonepeData.data.instrumentResponse.redirectInfo.url;
      return new Response(JSON.stringify({ url: redirectUrl }), { status: 200 });
    } else {
      console.error('PhonePe Error:', phonepeData);
      return new Response(JSON.stringify({ error: 'Payment gateway error', details: phonepeData }), { status: 500 });
    }
  } catch (error) {
    console.error('Init Payment Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
