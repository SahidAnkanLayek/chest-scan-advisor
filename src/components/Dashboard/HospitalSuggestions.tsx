import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Navigation, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Hospital {
  name: string;
  specialist: string;
  phone: string;
  distance: string;
  address: string;
  lat: number;
  lng: number;
}

const HospitalSuggestions = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          loadNearbyHospitals(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          loadMockHospitals();
        }
      );
    } else {
      loadMockHospitals();
    }
  };

  const loadNearbyHospitals = (lat: number, lng: number) => {
    // In production, this would call a real API like Google Places
    // For now, using mock data with calculated distances
    setTimeout(() => {
      setHospitals([
        {
          name: "City General Hospital",
          specialist: "Dr. Sarah Johnson",
          phone: "+1 (555) 123-4567",
          distance: "2.3 km",
          address: "123 Medical Center Dr, Suite 100",
          lat: lat + 0.02,
          lng: lng + 0.01,
        },
        {
          name: "St. Mary's Medical Center",
          specialist: "Dr. Michael Chen",
          phone: "+1 (555) 234-5678",
          distance: "4.7 km",
          address: "456 Healthcare Blvd, Floor 3",
          lat: lat + 0.03,
          lng: lng + 0.02,
        },
        {
          name: "University Hospital",
          specialist: "Dr. Emily Rodriguez",
          phone: "+1 (555) 345-6789",
          distance: "6.1 km",
          address: "789 University Ave, Building A",
          lat: lat + 0.04,
          lng: lng + 0.03,
        },
        {
          name: "Metropolitan Health Clinic",
          specialist: "Dr. James Wilson",
          phone: "+1 (555) 456-7890",
          distance: "8.5 km",
          address: "321 Metro Plaza, Suite 200",
          lat: lat + 0.05,
          lng: lng + 0.04,
        },
        {
          name: "Riverside Medical Group",
          specialist: "Dr. Patricia Lee",
          phone: "+1 (555) 567-8901",
          distance: "12.3 km",
          address: "654 Riverside Dr, Unit 5",
          lat: lat + 0.08,
          lng: lng + 0.06,
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const loadMockHospitals = () => {
    setTimeout(() => {
      setHospitals([
        {
          name: "City General Hospital",
          specialist: "Dr. Sarah Johnson",
          phone: "+1 (555) 123-4567",
          distance: "N/A",
          address: "123 Medical Center Dr, Suite 100",
          lat: 0,
          lng: 0,
        },
        {
          name: "St. Mary's Medical Center",
          specialist: "Dr. Michael Chen",
          phone: "+1 (555) 234-5678",
          distance: "N/A",
          address: "456 Healthcare Blvd, Floor 3",
          lat: 0,
          lng: 0,
        },
        {
          name: "University Hospital",
          specialist: "Dr. Emily Rodriguez",
          phone: "+1 (555) 345-6789",
          distance: "N/A",
          address: "789 University Ave, Building A",
          lat: 0,
          lng: 0,
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const openDirections = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospital.lat},${hospital.lng}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Nearby Specialists</CardTitle>
            <CardDescription>
              Top 5 hospitals with chest cancer specialists within 50km
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {hospitals.map((hospital, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{hospital.name}</h3>
                          <p className="text-sm text-muted-foreground">{hospital.address}</p>
                        </div>
                        <Badge variant="secondary">{hospital.distance}</Badge>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Specialist:</span>
                          {hospital.specialist}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {hospital.phone}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openDirections(hospital)}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Get Directions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${hospital.phone}`)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HospitalSuggestions;