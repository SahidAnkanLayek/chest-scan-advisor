import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, Star, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Hospital {
  name: string;
  address: string;
  distance: string;
  rating: number | null;
  userRatingsTotal: number;
  lat: number;
  lng: number;
  placeId: string;
  openNow?: boolean;
}

const HospitalSuggestions = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLocationPermission = () => {
    setShowPermissionDialog(false);
    setLoading(true);
    
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
          setError("Unable to access your location. Please enable location services.");
          setLoading(false);
          toast({
            title: "Location Access Denied",
            description: "Please enable location services to find nearby hospitals.",
            variant: "destructive",
          });
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  const loadNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('nearby-hospitals', {
        body: { latitude: lat, longitude: lng },
      });

      if (error) throw error;

      if (data.hospitals && data.hospitals.length > 0) {
        setHospitals(data.hospitals);
      } else {
        setError("No hospitals found nearby. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setError("Failed to load nearby hospitals. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load nearby hospitals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openMapView = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospital.lat},${hospital.lng}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Access Required
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Allow X-Ray AI to access your location to find nearby chest cancer specialists?</p>
              <p className="text-xs text-muted-foreground">
                We'll use your location to find the 5 closest hospitals within 50km of you.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPermissionDialog(false)}>
              Not Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLocationPermission}>
              Allow Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Finding nearby hospitals...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-center text-muted-foreground">{error}</p>
              <Button onClick={handleLocationPermission} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-center text-muted-foreground">
                Click "Allow Access" to find nearby hospitals
              </p>
              <Button onClick={handleLocationPermission} variant="default" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Find Hospitals
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hospitals.map((hospital, index) => (
                <Card key={hospital.placeId || index} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{hospital.name}</h3>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            {hospital.rating && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{hospital.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({hospital.userRatingsTotal} reviews)
                                </span>
                                {hospital.openNow !== undefined && (
                                  <Badge variant={hospital.openNow ? "default" : "secondary"} className="text-xs">
                                    {hospital.openNow ? "Open Now" : "Closed"}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary">{hospital.distance}</Badge>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openMapView(hospital)}
                            className="flex-1"
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            View on Map
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
    </>
  );
};

export default HospitalSuggestions;