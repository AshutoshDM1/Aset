import { SignIn } from '@clerk/react';
import Navbar from '@/shared/Navbar/Navbar';
import Footer from '@/shared/Footer/Footer';
import ScrollSmoother from '@/shared/SmoothScroll/SmoothScroll';

const SignInPage = () => {
  return (
    <ScrollSmoother>
      <div className="font-raleway bg-background min-h-[125vh] text-foreground flex flex-col justify-between">
        <div className="bg-linear-to-b from-white via-violet-300/30 to-white dark:from-black dark:via-indigo-950/40 dark:to-zinc-950 pb-5 grow flex flex-col">
          <Navbar />
          <div className="grow flex items-center justify-center py-12 px-4 z-10">
            <div className="relative">
              {/* Subtle visual glow behind the Clerk card */}
              <div className="absolute -inset-4 bg-radial-[circle_at_center,rgba(94,67,243,0.12),transparent_70%] blur-xl pointer-events-none" />
              <SignIn
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ScrollSmoother>
  );
};

export default SignInPage;
