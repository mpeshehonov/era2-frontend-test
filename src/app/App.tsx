import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/router";
import { Layout } from "@/widgets/layout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OnboardingTour } from "@/features/onboarding";
import { CopyToastProvider } from "@/features/copy-toast";
import { GlobalQueueStatusBar } from "@/features/generation-queue";
import { DailyCheckIn } from "@/features/promo";
import { CornerPromo } from "@/features/promo";
import { useLocation } from "@/shared/routing";

function AppOverlays() {
  const { pathname } = useLocation();
  const showMarketingOverlays = pathname !== "/queue";

  return (
    <>
      <OnboardingTour />
      <GlobalQueueStatusBar />
      <CopyToastProvider />
      {showMarketingOverlays && <DailyCheckIn />}
      {showMarketingOverlays && <CornerPromo />}
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Layout>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Layout>
      <AppOverlays />
    </AppProviders>
  );
}
