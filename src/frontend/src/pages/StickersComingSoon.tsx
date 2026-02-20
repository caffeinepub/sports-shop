import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function StickersComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="container py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Stickers Coming Soon!</CardTitle>
          <CardDescription className="text-base mt-2">
            We're working on bringing you an amazing collection of sports stickers. Stay tuned for exciting designs and quality products!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/' })} size="lg" className="gap-2">
            <ArrowLeft className="h-5 w-5" />
            Browse Available Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
