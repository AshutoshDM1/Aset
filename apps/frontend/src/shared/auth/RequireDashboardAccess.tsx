import { ClerkLoaded, ClerkLoading, useUser } from '@clerk/react';
import { Navigate, Outlet, useLocation } from 'react-router';
import PageLoader from '../PageLoader/PageLoader';

export default function RequireDashboardAccess() {
  const location = useLocation();
  const { user, isLoaded, isSignedIn } = useUser();

  // Important: only block when metadata explicitly says "false".
  // Many users won't have this field set yet (undefined), and should still be allowed in.
  const hasSignedUp = user?.publicMetadata?.has_signed_up;

  return (
    <>
      <ClerkLoading>
        <PageLoader />
      </ClerkLoading>

      <ClerkLoaded>
        {!isSignedIn ? (
          <Navigate to="/" replace state={{ from: location.pathname }} />
        ) : !isLoaded ? (
          <PageLoader />
        ) : !user ? (
          <PageLoader />
        ) : hasSignedUp === false ? (
          <Navigate to="/" replace state={{ from: location.pathname }} />
        ) : (
          <Outlet />
        )}
      </ClerkLoaded>
    </>
  );
}
