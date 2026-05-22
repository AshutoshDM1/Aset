import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const GetStarted = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 text-center animate-in fade-in duration-500">
      <Card className="max-w-xl w-full border-none shadow-none ring-0 p-6 md:p-8">
        <CardHeader className="flex flex-col items-center gap-4">
          <img className="w-70" src="/img/cover.png" alt="cover image" />
          <div className="space-y-1.5">
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
              Get Started with Aset
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-normal max-w-xs mx-auto">
              Create your very first folder to organize, upload, and securely
              share your digital assets.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="w-full flex justify-center ">
          <Button
            asChild
            size="lg"
            className="w-fit rounded-xl font-medium group transition-all duration-200"
          >
            <Link
              to="/dashboard/my-files"
              className="flex items-center justify-center gap-2"
            >
              Create a Folder
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GetStarted;
