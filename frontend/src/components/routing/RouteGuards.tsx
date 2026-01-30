import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import FullscreenLoader from '../common/FullscreenLoader';
import { useAuth } from '../../context/AuthContext';

type Props = {
  children: ReactElement;
};

export function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader message="Verifying access" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function PublicRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader message="Preparing portal" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
