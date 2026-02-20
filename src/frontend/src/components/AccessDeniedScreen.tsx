import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="container py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            {isAuthenticated
              ? 'You do not have permission to access this page. Only administrators can manage products.'
              : 'Please log in to access the admin panel.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!isAuthenticated ? (
            <Button onClick={login} disabled={isLoggingIn} size="lg" className="w-full">
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => navigate({ to: '/' })} size="lg" className="w-full">
            Return to Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
