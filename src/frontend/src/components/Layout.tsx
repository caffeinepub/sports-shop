import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Store, Shield, LogIn, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCart, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { SiInstagram } from 'react-icons/si';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  
  const cartItemCount = cart?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Show admin link if user is authenticated and is confirmed admin
  const showAdminLink = isAuthenticated && !isAdminLoading && isAdmin === true;

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
            description: error.message || 'Please try again.',
          });
        }
      }
    }
  };

  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname)
    : 'unknown-app';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-black text-xl">
              <Store className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                yourdailysprtshop
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-semibold transition-colors hover:text-primary"
              >
                Products
              </Link>
              <Link
                to="/stickers"
                className="text-sm font-semibold transition-colors hover:text-primary"
              >
                Stickers
              </Link>
              {showAdminLink && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold transition-colors hover:text-primary flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="font-semibold"
            >
              {isLoggingIn ? (
                'Logging in...'
              ) : isAuthenticated ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30 py-8">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                yourdailysprtshop
              </h3>
              <p className="text-sm text-muted-foreground">
                Your one-stop shop for quality sports equipment and accessories.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/stickers" className="text-muted-foreground hover:text-primary transition-colors">
                    Stickers
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                      Shopping Cart
                    </Link>
                  </li>
                )}
                {showAdminLink && (
                  <li>
                    <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3">Connect With Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a
                  href="mailto:ghiyadhairya@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} yourdailysprtshop. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-primary transition-colors"
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
