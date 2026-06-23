import { cn } from "@/shared/lib/utils";

interface BrandIconProps {
  className?: string;
}

export function TelegramIcon({ className }: BrandIconProps) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#27A7E7" />
      <path
        d="M17.82 7.18 15.9 16.2c-.14.64-.52.8-1.05.5l-2.9-2.14-1.4 1.35c-.16.15-.29.28-.6.28l.22-2.96 5.39-4.87c.23-.21-.05-.33-.36-.12l-6.66 4.2-2.87-.9c-.62-.2-.64-.62.13-.92l11.2-4.31c.52-.2.97.12.8.87Z"
        fill="#fff"
      />
    </svg>
  );
}

export function YandexIcon({ className }: BrandIconProps) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
      <text
        x="12"
        y="12"
        fill="#fff"
        dominantBaseline="central"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
      >
        Я
      </text>
    </svg>
  );
}

export function GoogleIcon({ className }: BrandIconProps) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21.6 12.23c0-.74-.07-1.46-.2-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.25c1.9-1.75 2.97-4.33 2.97-7.45Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.25-2.52c-.9.6-2.05.96-3.39.96-2.6 0-4.82-1.76-5.61-4.13H3.03v2.6A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.88A6.01 6.01 0 0 1 6.07 12c0-.65.12-1.28.32-1.88v-2.6H3.03A10 10 0 0 0 2 12c0 1.61.38 3.13 1.03 4.48l3.36-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.99c1.47 0 2.8.5 3.84 1.5l2.87-2.87C16.98 3 14.7 2 12 2a10 10 0 0 0-8.97 5.52l3.36 2.6C7.18 7.75 9.4 5.99 12 5.99Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function VkIcon({ className }: BrandIconProps) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0077FF" />
      <path
        d="M12.72 17.15c-5.1 0-8.01-3.5-8.13-9.32h2.56c.08 4.27 1.97 6.08 3.47 6.46V7.83h2.42v3.69c1.48-.16 3.03-1.84 3.56-3.69h2.42c-.4 2.28-2.1 3.96-3.3 4.65 1.2.56 3.12 2.02 3.85 4.67H16.9c-.58-1.77-2-3.14-3.86-3.33v3.33h-.31Z"
        fill="#fff"
      />
    </svg>
  );
}
