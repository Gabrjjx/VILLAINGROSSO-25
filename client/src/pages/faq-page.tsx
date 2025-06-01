import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  ThumbsUp, 
  ThumbsDown, 
  Eye,
  HelpCircle,
  MessageCircle,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  viewCount: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  isActive: boolean;
  createdAt: string;
}

export default function FaqPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // Query per ottenere tutte le FAQ
  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/faqs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return response.json();
    }
  });

  // Query per la ricerca
  const { data: searchResults = [], refetch: searchFaqs } = useQuery<Faq[]>({
    queryKey: ["/api/faqs/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const response = await fetch(`/api/faqs/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search FAQs');
      return response.json();
    },
    enabled: false
  });

  // Mutation per incrementare visualizzazioni
  const incrementViewMutation = useMutation({
    mutationFn: async (faqId: number) => {
      await apiRequest("POST", `/api/faqs/${faqId}/view`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    }
  });

  // Mutation per votare
  const voteMutation = useMutation({
    mutationFn: async ({ faqId, isHelpful }: { faqId: number; isHelpful: boolean }) => {
      await apiRequest("POST", `/api/faqs/${faqId}/vote`, { isHelpful });
    },
    onSuccess: () => {
      toast({ title: "Voto registrato", description: "Grazie per il tuo feedback!" });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
    onError: (error: any) => {
      if (error.message?.includes('Authentication required')) {
        toast({ 
          title: "Accesso richiesto", 
          description: "Devi essere loggato per votare le FAQ",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Errore", 
          description: "Errore durante la registrazione del voto",
          variant: "destructive" 
        });
      }
    }
  });

  const displayedFaqs = searchQuery.trim() ? searchResults : faqs;
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchFaqs();
    }
  };

  const toggleFaq = (faqId: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(faqId)) {
      newOpenItems.delete(faqId);
    } else {
      newOpenItems.add(faqId);
      // Incrementa visualizzazioni quando viene aperta
      incrementViewMutation.mutate(faqId);
    }
    setOpenItems(newOpenItems);
  };

  const handleVote = (faqId: number, isHelpful: boolean) => {
    voteMutation.mutate({ faqId, isHelpful });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16 pt-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <HelpCircle className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Domande Frequenti
            </h1>
          </div>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Trova risposte alle domande più comuni sulla Villa Ingrosso
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Barra di ricerca */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Cerca nelle FAQ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Filtri per categoria */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              size="sm"
            >
              Tutte le categorie
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className="capitalize"
              >
                {category}
              </Button>
            ))}
            
            {/* Pulsante Admin per aggiungere FAQ */}
            {user?.isAdmin && (
              <Link href="/admin">
                <Button className="bg-green-600 hover:bg-green-700 ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi FAQ
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Risultati */}
        {displayedFaqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery.trim() ? "Nessun risultato trovato" : "Nessuna FAQ disponibile"}
            </h3>
            <p className="text-gray-500">
              {searchQuery.trim() 
                ? "Prova a modificare la tua ricerca o contattaci per ulteriori informazioni."
                : "Le FAQ saranno disponibili a breve."
              }
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {displayedFaqs.map((faq) => {
              const isOpen = openItems.has(faq.id);
              const totalVotes = faq.helpfulVotes + faq.notHelpfulVotes;
              const helpfulPercentage = totalVotes > 0 ? (faq.helpfulVotes / totalVotes) * 100 : 0;
              
              return (
                <Card key={faq.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Collapsible open={isOpen} onOpenChange={() => toggleFaq(faq.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 text-left">
                            <CardTitle className="text-lg mb-2 pr-4">
                              {faq.question}
                            </CardTitle>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <Badge variant="outline" className="capitalize">
                                {faq.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {faq.viewCount}
                              </div>
                              {totalVotes > 0 && (
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {helpfulPercentage.toFixed(0)}%
                                </div>
                              )}
                              {faq.tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap">{faq.answer}</div>
                          </div>
                        </div>
                        
                        {/* Voting */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Questa risposta è stata utile?
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(faq.id, true);
                              }}
                              disabled={voteMutation.isPending}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Sì ({faq.helpfulVotes})
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(faq.id, false);
                              }}
                              disabled={voteMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              No ({faq.notHelpfulVotes})
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Non hai trovato quello che cercavi?
              </h3>
              <p className="text-gray-600 mb-4">
                Contattaci direttamente per ricevere assistenza personalizzata.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Contattaci
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}