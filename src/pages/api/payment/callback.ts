import type { APIRoute } from 'astro';
import { supabase } from '../../../utils/supabase';

// Web Crypto SHA-256
async function generateSha256(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function atou(b64: string) {
  return decodeURIComponent(escape(atob(b64)));
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { response } = await request.json();
    const xVerifyHeader = request.headers.get('x-verify');

    if (!response || !xVerifyHeader) {
      return new Response('Invalid payload', { status: 400 });
    }

    const saltKey = import.meta.env.PHONEPE_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = import.meta.env.PHONEPE_SALT_INDEX || '1';

    // Verify signature
    const stringToHash = response + saltKey;
    const sha256Hash = await generateSha256(stringToHash);
    const expectedSignature = sha256Hash + "###" + saltIndex;

    if (expectedSignature !== xVerifyHeader) {
      console.error('Invalid PhonePe webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const decodedResponse = JSON.parse(atou(response));
    
    if (decodedResponse.success && decodedResponse.code === 'PAYMENT_SUCCESS') {
      const transactionId = decodedResponse.data.merchantTransactionId;
      const providerReferenceId = decodedResponse.data.transactionId;

      await supabase
        .from('finals_tickets')
        .update({
          payment_status: 'paid',
          phonepe_transaction_id: transactionId,
          phonepe_provider_reference_id: providerReferenceId
        })
        .eq('id', transactionId);
        
      return new Response('OK', { status: 200 });
    } else {
      const transactionId = decodedResponse.data?.merchantTransactionId;
      if (transactionId) {
        await supabase
          .from('finals_tickets')
          .update({
            payment_status: 'failed',
          })
          .eq('id', transactionId);
      }
      return new Response('OK', { status: 200 });
    }
  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return new Response('Internal error', { status: 500 });
  }
};
