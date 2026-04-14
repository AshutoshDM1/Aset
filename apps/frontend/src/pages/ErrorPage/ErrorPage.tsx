import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router';

export default function ErrorPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="relative mx-auto flex  w-full max-w-3xl items-center justify-center px-6 py-10">
        <Card className="w-full max-w-lg border-0 bg-transparent shadow-none animate-in fade-in py-20 duration-500">
          <div className="flex items-center justify-center">
            <h2 className="text-4xl font-semibold tracking-tight">404</h2>
          </div>
          <CardHeader className="items-center space-y-6 text-center">
            <div className="space-y-2">
              <CardTitle className="text-balance text-4xl font-semibold tracking-tight">
                Something went wrong
              </CardTitle>
              <p className="mx-auto max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
                Our servers are having a bit of trouble processing your request.
                Please try again in a few moments.
              </p>
            </div>
          </CardHeader>

          <CardContent className="mt-6 space-y-6 flex items-center justify-center">
            <div className="mx-auto flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw aria-hidden data-icon="inline-start" />
                Reload
              </Button>
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
