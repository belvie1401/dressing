import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { ToastProvider } from "@/components/ui/Toast";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import ServiceWorkerRegistrar from "@/components/ui/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "LIEN — Votre dressing connecté",
  description:
    "Votre dressing intelligent connecté aux stylistes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LIEN",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#111111",
    "msapplication-TileImage": "/icons/icon-144x144.png?v=2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      localization={frFR}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      appearance={{
        layout: {
          logoImageUrl: '/logo.png',
          logoPlacement: 'inside' as const,
          showOptionalFields: false,
          socialButtonsPlacement: 'top' as const,
          socialButtonsVariant: 'blockButton' as const,
        },
        variables: {
          colorPrimary: '#111111',
          colorBackground: '#F7F5F2',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#111111',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorText: '#111111',
          colorTextSecondary: '#8A8A8A',
          colorNeutral: '#111111',
          colorDanger: '#D4785C',
          borderRadius: '16px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          spacingUnit: '4px',
        },
        elements: {
          rootBox: {
            width: '100%',
          },
          card: {
            backgroundColor: '#FFFFFF',
            boxShadow: 'none',
            border: '1px solid #EFEFEF',
            borderRadius: '24px',
            padding: '28px 24px',
            width: '100%',
            maxWidth: '400px',
          },
          headerTitle: {
            fontFamily: 'Playfair Display, serif',
            fontSize: '22px',
            color: '#111111',
            fontWeight: '500',
            textAlign: 'center' as const,
          },
          headerSubtitle: {
            color: '#8A8A8A',
            fontSize: '13px',
            textAlign: 'center' as const,
          },
          logoBox: {
            display: 'none',
          },
          socialButtonsBlockButton: {
            borderRadius: '9999px',
            border: '1px solid #EFEFEF',
            backgroundColor: '#FFFFFF',
            color: '#111111',
            fontWeight: '500',
            fontSize: '14px',
            padding: '14px 24px',
            '&:hover': {
              backgroundColor: '#F7F5F2',
              border: '1px solid #111111',
            },
          },
          socialButtonsBlockButtonText: {
            color: '#111111',
            fontWeight: '500',
          },
          dividerLine: {
            backgroundColor: '#EFEFEF',
          },
          dividerText: {
            color: '#CFCFCF',
            fontSize: '12px',
          },
          formFieldLabel: {
            fontSize: '11px',
            color: '#8A8A8A',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            fontWeight: '500',
            marginBottom: '6px',
          },
          formFieldInput: {
            borderRadius: '14px',
            border: '1px solid #EFEFEF',
            backgroundColor: '#FFFFFF',
            color: '#111111',
            fontSize: '14px',
            padding: '14px 16px',
            '&:focus': {
              border: '1px solid #111111',
              boxShadow: 'none',
              outline: 'none',
            },
            '&::placeholder': {
              color: '#CFCFCF',
            },
          },
          formFieldInputShowPasswordButton: {
            color: '#8A8A8A',
          },
          formButtonPrimary: {
            backgroundColor: '#111111',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '14px 24px',
            textTransform: 'none' as const,
            letterSpacing: '0',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#333333',
              boxShadow: 'none',
            },
            '&:active': {
              backgroundColor: '#000000',
            },
          },
          formButtonReset: {
            color: '#8A8A8A',
            fontSize: '13px',
          },
          footerActionText: {
            color: '#8A8A8A',
            fontSize: '13px',
          },
          footerActionLink: {
            color: '#111111',
            fontWeight: '500',
            textDecoration: 'underline',
            '&:hover': {
              color: '#333333',
            },
          },
          formFieldErrorText: {
            color: '#D4785C',
            fontSize: '12px',
          },
          alertText: {
            fontSize: '13px',
            color: '#D4785C',
          },
          alert: {
            backgroundColor: '#FFF8F6',
            borderColor: '#D4785C33',
            borderRadius: '12px',
          },
          formFieldAction: {
            color: '#8A8A8A',
            fontSize: '12px',
            textDecoration: 'underline',
          },
          identityPreviewText: {
            color: '#111111',
            fontSize: '13px',
          },
          identityPreviewEditButton: {
            color: '#C6A47E',
          },
          otpCodeFieldInput: {
            borderRadius: '12px',
            border: '2px solid #EFEFEF',
            color: '#111111',
            fontSize: '20px',
            fontFamily: 'Playfair Display, serif',
            '&:focus': {
              borderColor: '#111111',
            },
          },
          footer: {
            display: 'none',
          },
          main: {
            gap: '16px',
          },
        },
      }}
    >
    <html lang="fr" className="h-full">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png?v=2" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png?v=2" />

        {/* iOS splash screens */}
        <link rel="apple-touch-startup-image" href="/splash/splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2208.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-828x1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1536x2048.png"
          media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-2048x2732.png"
          media="(min-device-width: 1024px) and (max-device-width: 1366px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistrar />
        <PWAInstallPrompt />
      </body>
    </html>
    </ClerkProvider>
  );
}
