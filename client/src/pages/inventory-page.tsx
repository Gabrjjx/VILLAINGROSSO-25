import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingDown, 
  AlertTriangle,
  History,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  purchasePrice: number;
  notes: string;
  createdAt: string;
  lastChecked: string;
}

interface InventoryMovement {
  id: number;
  itemId: number;
  type: string;
  quantity: number;
  reason: string;
  createdAt: string;
  user: {
    fullName: string;
  };
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Query per ottenere tutti gli elementi dell'inventario
  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    enabled: !!user?.isAdmin
  });

  // Query per elementi con scorte basse
  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
    enabled: !!user?.isAdmin
  });

  // Mutation per aggiungere elemento
  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/inventory", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Elemento aggiunto", description: "Elemento inventario creato con successo" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowAddDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Errore", 
        description: error.message || "Errore durante la creazione dell'elemento",
        variant: "destructive" 
      });
    }
  });

  // Mutation per movimento inventario
  const addMovementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/inventory/movements", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Movimento registrato", description: "Movimento inventario aggiunto con successo" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowMovementDialog(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Errore", 
        description: error.message || "Errore durante la registrazione del movimento",
        variant: "destructive" 
      });
    }
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accesso Limitato</h2>
            <p className="text-gray-600">
              Solo gli amministratori possono accedere alla gestione inventario.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === "" || item.category === selectedCategory)
  );

  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      location: formData.get('location'),
      currentQuantity: parseInt(formData.get('currentQuantity') as string),
      minimumQuantity: parseInt(formData.get('minimumQuantity') as string),
      unit: formData.get('unit'),
      purchasePrice: parseFloat(formData.get('purchasePrice') as string) || 0,
      notes: formData.get('notes')
    };
    addItemMutation.mutate(data);
  };

  const handleAddMovement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      itemId: selectedItem.id,
      type: formData.get('type'),
      quantity: parseInt(formData.get('quantity') as string),
      reason: formData.get('reason')
    };
    addMovementMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Gestione Inventario
              </h1>
              <p className="text-xl text-orange-100">
                Traccia attrezzature e forniture della villa
              </p>
            </div>
            <Package className="h-24 w-24 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert scorte basse */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Attenzione: Scorte Basse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <Badge key={item.id} variant="destructive">
                    {item.name}: {item.currentQuantity} {item.unit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controlli */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca elementi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tutte le categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte le categorie</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Elemento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuovo Elemento Inventario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input name="category" placeholder="es. Cucina, Bagno" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea name="description" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Posizione</Label>
                    <Input name="location" placeholder="es. Ripostiglio, Cucina" />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unità di misura</Label>
                    <Input name="unit" defaultValue="pz" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentQuantity">Quantità attuale *</Label>
                    <Input name="currentQuantity" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="minimumQuantity">Quantità minima</Label>
                    <Input name="minimumQuantity" type="number" defaultValue="1" />
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Prezzo (€)</Label>
                    <Input name="purchasePrice" type="number" step="0.01" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Note</Label>
                  <Textarea name="notes" />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={addItemMutation.isPending}>
                    {addItemMutation.isPending ? "Salvando..." : "Salva"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid elementi */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isLowStock = item.currentQuantity <= item.minimumQuantity;
              
              return (
                <Card key={item.id} className={`transition-all hover:shadow-lg ${isLowStock ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                      {isLowStock && (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      {item.location && (
                        <Badge variant="secondary">{item.location}</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Quantità disponibile:</span>
                        <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                          {item.currentQuantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Quantità minima:</span>
                        <span>{item.minimumQuantity} {item.unit}</span>
                      </div>
                      {item.purchasePrice > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Prezzo:</span>
                          <span>€{item.purchasePrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowMovementDialog(true);
                        }}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Movimento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog movimento inventario */}
        <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Nuovo Movimento - {selectedItem?.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMovement} className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo movimento *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrata</SelectItem>
                    <SelectItem value="out">Uscita</SelectItem>
                    <SelectItem value="damaged">Danneggiato</SelectItem>
                    <SelectItem value="maintenance">Manutenzione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantità *</Label>
                <Input name="quantity" type="number" required />
              </div>
              
              <div>
                <Label htmlFor="reason">Motivo</Label>
                <Textarea name="reason" placeholder="Descrivi il motivo del movimento" />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMovementDialog(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={addMovementMutation.isPending}>
                  {addMovementMutation.isPending ? "Salvando..." : "Registra"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}