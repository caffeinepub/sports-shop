import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Store, Shield, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCart, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { SiFacebook, SiInstagram, SiX } from 'react-icons/si';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  
  const cartItemCount = cart?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate({ to: '/' });
    } else {
      try {
        await login();
        toast.success('Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('Login failed', {
            description: 'Please try again.',
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Store className="h-7 w-7 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              yourdailysprtshop
            </span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              className="font-semibold"
              onClick={() => navigate({ to: '/' })}
            >
              Products
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="font-semibold"
              onClick={() => navigate({ to: '/stickers' })}
            >
              Stickers
            </Button>

            {isAuthenticated && isAdmin && (
              <Button
                variant="ghost"
                size="lg"
                className="font-semibold gap-2"
                onClick={() => navigate({ to: '/admin' })}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="relative font-semibold"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button
              variant={isAuthenticated ? "outline" : "default"}
              size="lg"
              className="font-semibold gap-2"
              onClick={handleAuth}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>Logging in...</>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/30 mt-auto">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                yourdailysprtshop
              </h3>
              <p className="text-sm text-muted-foreground">
                Your one-stop shop for quality table tennis balls and badminton shuttles.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/stickers" className="text-muted-foreground hover:text-foreground transition-colors">
                    Stickers
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3">Connect With Us</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <SiFacebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://www.instagram.com/itznabeastbro/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <SiInstagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <SiX className="h-5 w-5" />
                  </a>
                </div>
                <a 
                  href="https://www.instagram.com/itznabeastbro/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <SiInstagram className="h-4 w-4" />
                  <span>@itznabeastbro</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} yourdailysprtshop. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'yourdailysprtshop'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
