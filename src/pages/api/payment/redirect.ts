import type { APIRoute } from 'astro';
import { supabase } from '../../../utils/supabase';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const formData = await request.formData();
    const code = formData.get('code')?.toString();
    const transactionId = formData.get('transactionId')?.toString();
    const providerReferenceId = formData.get('providerReferenceId')?.toString();
    
    // Also parse from URL if it's a GET or query param
    const idParam = url.searchParams.get('id') || transactionId;

    if (!idParam) {
      return Response.redirect(`${url.origin}/my-ticket?error=invalid-redirect`, 302);
    }

    if (code === 'PAYMENT_SUCCESS') {
      // Update DB
      await supabase
        .from('finals_tickets')
        .update({
          payment_status: 'paid',
          phonepe_transaction_id: transactionId || idParam,
          phonepe_provider_reference_id: providerReferenceId
        })
        .eq('id', idParam);
        
      return Response.redirect(`${url.origin}/ticket/${idParam}`, 302);
    } else {
      // Payment failed
      await supabase
        .from('finals_tickets')
        .update({
          payment_status: 'failed',
          phonepe_transaction_id: transactionId || idParam,
        })
        .eq('id', idParam);
        
      return Response.redirect(`${url.origin}/finals?error=payment-failed`, 302);
    }
  } catch (error) {
    console.error('Redirect Processing Error:', error);
    return Response.redirect(`${url.origin}/my-ticket?error=processing-error`, 302);
  }
};
