import { useUser } from '@clerk/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const useValidateSignup = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.publicMetadata?.has_signed_up) {
      navigate('/');
    }
  }, [user, navigate]);

  return user;
};

export default useValidateSignup;
