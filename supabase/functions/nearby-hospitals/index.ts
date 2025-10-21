import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Google Places API Nearby Search
    const radius = 50000; // 50km
    const type = 'hospital';
    const keyword = 'chest cancer specialist oncology';

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&keyword=${keyword}&key=${apiKey}`;

    console.log('Fetching hospitals from Google Places API...');
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hospitals', details: data.error_message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate distance and format results
    const hospitals = data.results.slice(0, 5).map((place: any) => {
      const hospitalLat = place.geometry.location.lat;
      const hospitalLng = place.geometry.location.lng;

      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (hospitalLat - latitude) * Math.PI / 180;
      const dLon = (hospitalLng - longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(latitude * Math.PI / 180) * Math.cos(hospitalLat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return {
        name: place.name,
        address: place.vicinity || 'Address not available',
        rating: place.rating || null,
        userRatingsTotal: place.user_ratings_total || 0,
        distance: `${distance.toFixed(1)} km`,
        distanceValue: distance,
        lat: hospitalLat,
        lng: hospitalLng,
        placeId: place.place_id,
        openNow: place.opening_hours?.open_now,
      };
    });

    // Sort by distance
    hospitals.sort((a: any, b: any) => a.distanceValue - b.distanceValue);

    console.log(`Found ${hospitals.length} hospitals`);

    return new Response(
      JSON.stringify({ hospitals }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in nearby-hospitals function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
