import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Tag, ArrowLeft, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    fullName: string;
  };
}

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post non trovato');
        }
        throw new Error('Errore nel caricamento del post');
      }
      return response.json();
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
              <div className="h-64 bg-gray-300 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">Post non trovato</h2>
            <p className="text-gray-600 mb-4">
              L'articolo che stai cercando non esiste o è stato rimosso.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna al Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header con immagine featured */}
      <div className="relative">
        {post.featuredImage ? (
          <div className="h-96 overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ) : (
          <div className="h-96 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
        )}
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-6">
          <Link href="/blog">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header del post */}
          <Card className="mb-8 -mt-32 relative z-10">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString('it-IT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                <div className="flex items-center gap-1 ml-4">
                  <Eye className="h-4 w-4" />
                  {post.viewCount} visualizzazioni
                </div>
                {post.author && (
                  <div className="flex items-center gap-1 ml-4">
                    <User className="h-4 w-4" />
                    {post.author.fullName}
                  </div>
                )}
              </div>
              
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                {post.title}
              </CardTitle>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="capitalize">
                  {post.category}
                </Badge>
                {post.tags?.map(tag => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Contenuto del post */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none
                prose-headings:text-gray-900 
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
                prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-8
                prose-h3:text-xl prose-h3:font-medium prose-h3:mb-3 prose-h3:mt-6
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-em:text-gray-800
                prose-ul:mb-4 prose-ol:mb-4
                prose-li:text-gray-700 prose-li:mb-1
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
                prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:my-6
                prose-blockquote:text-blue-900 prose-blockquote:italic
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-3xl font-bold mb-6 mt-8 text-gray-900">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-900">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-medium mb-3 mt-6 text-gray-900">{children}</h3>,
                    p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 my-6 text-blue-900 italic">
                        {children}
                      </blockquote>
                    ),
                    a: ({href, children}) => (
                      <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    )
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Footer con meta informazioni */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  Pubblicato il {new Date(post.createdAt).toLocaleDateString('it-IT')}
                  {post.updatedAt !== post.createdAt && (
                    <span className="ml-2">
                      • Aggiornato il {new Date(post.updatedAt).toLocaleDateString('it-IT')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span>{post.viewCount} visualizzazioni</span>
                  <Badge variant="outline" className="capitalize">
                    {post.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="text-center mt-8">
            <Link href="/blog">
              <Button size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Leggi altri articoli
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}