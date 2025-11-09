import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Webhook } from "https://esm.sh/svix@1.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Get webhook headers
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new Response('Missing webhook headers', { status: 400 });
    }

    // Get the body
    const body = await req.text();

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return new Response('Webhook verification failed', { status: 400 });
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log(`Received webhook event: ${eventType}`);

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address || '';

      console.log(`Creating profile for user: ${id}, email: ${email}`);

      // Create Supabase client with service role key
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Insert profile into Supabase
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: id,
          email: email,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatar_url: image_url || null,
        });

      if (error) {
        console.error('Error creating profile:', error);
        return new Response(JSON.stringify({ error: 'Failed to create profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Profile created successfully for user: ${id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
