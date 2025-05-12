import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Booking } from "@shared/schema";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2, LogOut, User as UserIcon, Calendar, Clock } from "lucide-react";

export default function AccountPageWrapper() {
  return (
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  );
}

function AccountPage() {
  const { t, language } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Carica le prenotazioni dell'utente
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/bookings");
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: t("account.bookings.error"),
          description: t("account.bookings.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Helper per formattare le date in base alla lingua
  const formatDate = (date: string | Date) => {
    const localeObj = language === "it" ? it : enUS;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "PPP", { locale: localeObj });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header dell'area utente */}
      <div className="bg-gradient-to-r from-primary/80 to-primary text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t("account.welcome")}</h1>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {t("account.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" />
              {t("account.tabs.profile")}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              {t("account.tabs.bookings")}
            </TabsTrigger>
          </TabsList>

          {/* Tab profilo */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("account.profile.title")}</CardTitle>
                <CardDescription>{t("account.profile.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">{t("account.profile.fullName")}</div>
                      <div className="font-medium">{user.fullName}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">{t("account.profile.username")}</div>
                      <div className="font-medium">{user.username}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("account.profile.email")}</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("account.profile.accountType")}</div>
                    <div className="font-medium">
                      {user.isAdmin ? t("account.profile.admin") : t("account.profile.user")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab prenotazioni */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("account.bookings.title")}</CardTitle>
                <CardDescription>{t("account.bookings.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden">
                        <div className="bg-primary/10 p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {t("account.bookings.nights").replace("{{count}}", Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)).toString())}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">
                                {t("account.bookings.guests")}: {booking.guestCount}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.status === "confirmed" ? (
                                  <span className="text-green-600 font-medium">
                                    {t("account.bookings.status.confirmed")}
                                  </span>
                                ) : booking.status === "pending" ? (
                                  <span className="text-amber-600 font-medium">
                                    {t("account.bookings.status.pending")}
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    {t("account.bookings.status.cancelled")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm">{booking.notes || t("account.bookings.noNotes")}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("account.bookings.noBookings")}</p>
                    <Button className="mt-4" onClick={() => window.location.href = "/booking"}>
                      {t("account.bookings.bookNow")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}