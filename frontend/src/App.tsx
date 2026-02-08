import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorScreen } from '@/components/screens/ErrorScreen';
import { LoadingScreen } from '@/components/screens/LoadingScreen';

const StartScreen = lazy(() =>
  import('@/components/screens/StartScreen').then((m) => ({ default: m.StartScreen })),
);
const GameScreen = lazy(() =>
  import('@/components/screens/game-screen/GameScreen').then((m) => ({ default: m.GameScreen })),
);

const ErrorBoundaryFallback = () => {
  const navigate = useNavigate();
  return (
    <ErrorScreen
      errorMessage="An unexpected error occurred."
      isRetrying={false}
      onRetry={() => window.location.reload()}
      onBack={() => navigate('/', { replace: true })}
    />
  );
};

export const App = () => {
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary fallback={<ErrorBoundaryFallback />} resetKeys={['/']}>
              <StartScreen />
            </ErrorBoundary>
          }
        />
        <Route
          path="/game/:gameId"
          element={
            <ErrorBoundary fallback={<ErrorBoundaryFallback />} resetKeys={[pathname]}>
              <GameScreen />
            </ErrorBoundary>
          }
        />
      </Routes>
    </Suspense>
  );
};
