'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Meteors } from '@/components/magicui/meteors';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, GithubIcon, Atom, Code, Share2, ChevronRight } from 'lucide-react';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { AuroraText } from '@/components/magicui/aurora-text';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { cn } from '@/lib/utils';

// Replace static data with API data
interface Author {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Tool {
  _id: string;
  name: string;
  shortDescription: string;
  image: string;
  deployedUrl: string;
  tags: string[];
  author: Author;
}

export default function Home() {
  // State for featured tools
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured tools on component mount
  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tools?limit=3');
        const data = await response.json();
        if (data.tools && Array.isArray(data.tools)) {
          setFeaturedTools(data.tools);
        }
      } catch (error) {
        console.error('Failed to fetch featured tools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTools();
  }, []);

  // Scroll reference for hero section
  const featuredRef = useRef<HTMLElement>(null);
  
  // Function is now used for documentation purposes
  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24">
      {/* Hero Section with Meteors - Full Screen */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        
        {/* Meteors Effect - Enhanced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Meteors 
            number={40} 
            className="text-primary/20"
            minDuration={5}
            maxDuration={15}
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 my-auto">
          <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 w-fit shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
            <span
              className={cn(
                "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]",
              )}
              style={{
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
                WebkitClipPath: "padding-box",
              }}
            />
            🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
            <AnimatedGradientText className="text-sm font-medium">
              The Ultimate Developer Toolbox
            </AnimatedGradientText>
            <ChevronRight
              className="ml-1 size-4 stroke-neutral-500 transition-transform
          duration-300 ease-in-out group-hover:translate-x-0.5"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
            Building <AuroraText colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]}>better</AuroraText> <AuroraText colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]}>tools</AuroraText> <br className="hidden md:block" />
            for <TypingAnimation 
                   words={['developers', 'creators', 'teams', 'startups', 'enterprises']} 
                   className="text-primary relative"
                 >
                    developers
                  </TypingAnimation>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover, share, and connect with the best developer tools and resources 
            to supercharge your workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/explore">
              <Button size="lg" className="px-8 h-12 rounded-full">
                Explore Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="px-8 h-12 rounded-full">
                Share Your Tool
              </Button>
            </Link>
          </div>
          
          <div className="pt-12 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient bg-[length:300%_100%]"></div>
              <div className="relative bg-card/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-border/50">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">10k+</div>
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                    <GithubIcon className="h-4 w-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
                <span className="text-sm">
                  <AnimatedGradientText className="font-medium">
                    Trusted by thousands
                  </AnimatedGradientText> of developers worldwide
                </span>
              </div>
            </div>
          </div>
          
          {/* Scroll down button removed */}
        </div>
      </section>

      {/* Featured Tools Section */}
      <section ref={featuredRef} className="container mx-auto px-4 space-y-10 pt-16 scroll-mt-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold flex items-center">
              <span>Featured</span> <AuroraText className="ml-2" colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]}>Tools</AuroraText>
            </h2>
            <p className="text-muted-foreground mt-1">Discover trending developer tools</p>
          </div>
          <Link href="/explore">
            <Button variant="outline" className="rounded-full">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading placeholders
            Array(3).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="group relative bg-card/50 rounded-xl overflow-hidden border border-border/60 animate-pulse"
                style={{ maxWidth: '100%' }}
              >
                <div className="aspect-video bg-muted"></div>
                <div className="p-3">
                  <div className="h-5 bg-muted rounded-md w-2/3 mb-2"></div>
                  <div className="h-8 bg-muted rounded-md w-full"></div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 mx-3 mb-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-muted"></div>
                    <div className="w-16 h-3 bg-muted rounded-md"></div>
                  </div>
                </div>
              </div>
            ))
          ) : featuredTools.length > 0 ? (
            featuredTools.map((tool) => (
              <div 
                key={tool._id} 
                className="group relative bg-card/50 rounded-xl overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/5"
                style={{ maxWidth: '100%' }}
              >
                <Link href={`/tools/${tool._id}`} className="block">
                  {/* Image section */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={tool.image || "/placeholder-tool.png"}
                      alt={tool.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Tag overlay */}
                    <div className="absolute top-2 right-2 z-20">
                      {tool.tags && tool.tags[0] && (
                        <span className="text-[10px] bg-black/30 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-medium border border-white/10">
                          {tool.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 h-[2.5rem]">
                      {tool.shortDescription}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center justify-between mt-2 pt-2 mx-3 mb-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={tool.author?.avatar || "/default-avatar.png"}
                      alt={tool.author?.name || "Author"}
                      className="w-5 h-5 rounded-full border border-border/50"
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                      {tool.author?.name || "Anonymous"}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(tool.deployedUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center"
                  >
                    Visit <ArrowRight className="ml-0.5 h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No tools found. Be the first to share a tool!</p>
              <Link href="/register" className="mt-4 inline-block">
                <Button>Share Your Tool</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Why Choose Builder Central? Section */}
      <section className="container mx-auto px-4 py-16 bg-card/30 rounded-3xl space-y-12 relative">
        {/* Subtle background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl opacity-50"></div>
        
        <div className="relative text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose <AuroraText colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]}>Builder Central</AuroraText>?
          </h2>
          <p className="text-xl text-muted-foreground">
            We're building the best platform for developers to discover and share tools.
          </p>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 p-6 rounded-xl bg-card/80 hover:shadow-md transition-all duration-300 border border-border/50 group hover:border-primary/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Atom className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Curated Collection</h3>
            <p className="text-muted-foreground">
              Every tool is carefully reviewed for quality and usefulness before being published.
            </p>
          </div>
          
          <div className="space-y-4 p-6 rounded-xl bg-card/80 hover:shadow-md transition-all duration-300 border border-border/50 group hover:border-primary/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Developer Focused</h3>
            <p className="text-muted-foreground">
              Built by developers for developers, focusing on tools that actually improve productivity.
            </p>
          </div>
          
          <div className="space-y-4 p-6 rounded-xl bg-card/80 hover:shadow-md transition-all duration-300 border border-border/50 group hover:border-primary/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Growing Community</h3>
            <p className="text-muted-foreground">
              Join thousands of developers who share and discover new tools every day.
            </p>
          </div>
        </div>
        
        <div className="relative text-center pt-8">
          <Link href="/register">
            <Button size="lg" className="px-8 rounded-full group shadow-md hover:shadow-lg">
              <span className="group-hover:mr-1 transition-all">Join Our Community</span>
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-border mt-24 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center">
                <span>Builder</span>
                <AuroraText className="ml-1" colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]}>Central</AuroraText>
              </h3>
              <p className="text-muted-foreground text-sm">
                The ultimate platform for developer tools and resources.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2">
                <li><Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">All Tools</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">New Releases</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Builder Central. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}