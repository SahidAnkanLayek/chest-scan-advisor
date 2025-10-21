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

    // Use new Google Places API (Text Search) with larger radius
    const radius = 200000; // 200km for district/state level coverage
    const query = 'hospital chest cancer specialist oncology';

    // New Places API endpoint
    const url = `https://places.googleapis.com/v1/places:searchText`;

    console.log('Fetching hospitals from Google Places API (New)...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours'
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude
            },
            radius: radius
          }
        },
        maxResultCount: 20 // Get more results to ensure we have 5 good ones
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places API error:', response.status, data);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hospitals', details: data.error?.message || 'Unknown error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.places || data.places.length === 0) {
      console.log('No hospitals found');
      return new Response(
        JSON.stringify({ hospitals: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate distance and format results
    const hospitals = data.places.slice(0, 5).map((place: any) => {
      const hospitalLat = place.location.latitude;
      const hospitalLng = place.location.longitude;

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
        name: place.displayName?.text || 'Hospital',
        address: place.formattedAddress || 'Address not available',
        rating: place.rating || null,
        userRatingsTotal: place.userRatingCount || 0,
        distance: `${distance.toFixed(1)} km`,
        distanceValue: distance,
        lat: hospitalLat,
        lng: hospitalLng,
        placeId: place.id,
        openNow: place.currentOpeningHours?.openNow,
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
