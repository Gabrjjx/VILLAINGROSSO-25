import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Booking, ContactMessage, User } from "@shared/schema";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminRoute } from "@/components/ProtectedRoute";
import { 
  Loader2, LogOut, User as UserIcon, Calendar, Mail, Check, 
  MoreHorizontal, Home, Users
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function AdminPageWrapper() {
  return (
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  );
}

function AdminPage() {
  const { t, language } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Carica gli utenti
  const { data: users, isLoading: usersLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: t("admin.users.error"),
          description: t("admin.users.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Carica tutte le prenotazioni
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/bookings");
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: t("admin.bookings.error"),
          description: t("admin.bookings.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Carica i messaggi di contatto
  const { data: messages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/messages");
        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: t("admin.messages.error"),
          description: t("admin.messages.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Funzione per segnare un messaggio come letto
  const markMessageAsRead = async (id: number) => {
    try {
      const res = await apiRequest("PATCH", `/api/admin/messages/${id}/read`);
      if (!res.ok) {
        throw new Error("Failed to mark message as read");
      }
      
      // Aggiorna la cache con il messaggio letto
      queryClient.setQueryData<ContactMessage[]>(["/api/admin/messages"], (oldData) => {
        if (!oldData) return [];
        return oldData.map(msg => {
          if (msg.id === id) {
            return { ...msg, read: true };
          }
          return msg;
        });
      });
      
      toast({
        title: t("admin.messages.success"),
        description: t("admin.messages.markedAsRead"),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        title: t("admin.messages.error"),
        description: t("admin.messages.errorMarking"),
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Helper per formattare le date in base alla lingua
  const formatDate = (date: string | Date) => {
    const localeObj = language === "it" ? it : enUS;
    return format(new Date(date), "PPP", { locale: localeObj });
  };

  // Statistiche per la dashboard
  const stats = {
    totalUsers: users?.length || 0,
    totalBookings: bookings?.length || 0,
    pendingBookings: bookings?.filter(b => b.status === "pending").length || 0,
    unreadMessages: messages?.filter(m => !m.read).length || 0,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header dell'area amministrativa */}
      <div className="bg-gradient-to-r from-primary/80 to-primary text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {t("admin.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-4">
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              {t("admin.tabs.dashboard")}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              {t("admin.tabs.users")}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              {t("admin.tabs.bookings")}
            </TabsTrigger>
            <TabsTrigger value="messages">
              <Mail className="h-4 w-4 mr-2" />
              {t("admin.tabs.messages")}
            </TabsTrigger>
          </TabsList>

          {/* Tab Dashboard */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.users")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.registeredUsers")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.bookings")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalBookings}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.totalBookings")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.pending")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.pendingBookings")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.messages")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.unreadMessages}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.unreadMessages")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">{t("admin.dashboard.recentBookings")}</h2>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.bookings.table.guest")}</TableHead>
                        <TableHead>{t("admin.bookings.table.dates")}</TableHead>
                        <TableHead>{t("admin.bookings.table.guests")}</TableHead>
                        <TableHead>{t("admin.bookings.table.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.slice(0, 5).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.guestName}</TableCell>
                          <TableCell>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </TableCell>
                          <TableCell>{booking.guestCount}</TableCell>
                          <TableCell>
                            {booking.status === "confirmed" ? (
                              <Badge className="bg-green-500">{t("admin.bookings.status.confirmed")}</Badge>
                            ) : booking.status === "pending" ? (
                              <Badge className="bg-amber-500">{t("admin.bookings.status.pending")}</Badge>
                            ) : (
                              <Badge className="bg-red-500">{t("admin.bookings.status.cancelled")}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.bookings.noBookings")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab Utenti */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.users.title")}</CardTitle>
                <CardDescription>{t("admin.users.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.users.table.id")}</TableHead>
                        <TableHead>{t("admin.users.table.name")}</TableHead>
                        <TableHead>{t("admin.users.table.email")}</TableHead>
                        <TableHead>{t("admin.users.table.username")}</TableHead>
                        <TableHead>{t("admin.users.table.role")}</TableHead>
                        <TableHead>{t("admin.users.table.created")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge>{t("admin.users.roles.admin")}</Badge>
                            ) : (
                              <Badge variant="outline">{t("admin.users.roles.user")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt || new Date())}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.users.noUsers")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Prenotazioni */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.bookings.title")}</CardTitle>
                <CardDescription>{t("admin.bookings.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.bookings.table.id")}</TableHead>
                        <TableHead>{t("admin.bookings.table.guest")}</TableHead>
                        <TableHead>{t("admin.bookings.table.dates")}</TableHead>
                        <TableHead>{t("admin.bookings.table.guests")}</TableHead>
                        <TableHead>{t("admin.bookings.table.status")}</TableHead>
                        <TableHead>{t("admin.bookings.table.amount")}</TableHead>
                        <TableHead className="text-right">{t("admin.bookings.table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.id}</TableCell>
                          <TableCell className="font-medium">{booking.guestName}</TableCell>
                          <TableCell>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </TableCell>
                          <TableCell>{booking.guestCount}</TableCell>
                          <TableCell>
                            {booking.status === "confirmed" ? (
                              <Badge className="bg-green-500">{t("admin.bookings.status.confirmed")}</Badge>
                            ) : booking.status === "pending" ? (
                              <Badge className="bg-amber-500">{t("admin.bookings.status.pending")}</Badge>
                            ) : (
                              <Badge className="bg-red-500">{t("admin.bookings.status.cancelled")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>€{booking.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("admin.bookings.openMenu")}</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("admin.bookings.actions")}</DropdownMenuLabel>
                                <DropdownMenuItem>{t("admin.bookings.viewDetails")}</DropdownMenuItem>
                                {booking.status === "pending" && (
                                  <DropdownMenuItem>{t("admin.bookings.confirm")}</DropdownMenuItem>
                                )}
                                {booking.status !== "cancelled" && (
                                  <DropdownMenuItem>{t("admin.bookings.cancel")}</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.bookings.noBookings")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Messaggi */}
          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.messages.title")}</CardTitle>
                <CardDescription>{t("admin.messages.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className={`overflow-hidden ${!message.read ? "border-primary" : ""}`}>
                        <div className="bg-muted p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-lg">{message.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {message.email} - {formatDate(message.createdAt || new Date())}
                              </p>
                            </div>
                            <div>
                              {!message.read ? (
                                <Badge variant="outline" className="border-primary text-primary">
                                  {t("admin.messages.unread")}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                                  {t("admin.messages.read")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="mb-4">{message.message}</p>
                          {!message.read && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markMessageAsRead(message.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t("admin.messages.markAsRead")}
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.messages.noMessages")}</p>
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