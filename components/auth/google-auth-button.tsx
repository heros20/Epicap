import { signInWithGoogleAction } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function GoogleAuthButton({
  next,
  source,
  cta,
  hint,
}: {
  next: string
  source: "connexion" | "inscription"
  cta: string
  hint: string
}) {
  return (
    <div className="space-y-4">
      <form action={signInWithGoogleAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="source" value={source} />
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="h-auto w-full justify-center gap-3 rounded-2xl border-border/80 bg-background/80 px-5 py-4"
        >
          <GoogleMark />
          {cta}
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">{hint}</p>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          ou
        </span>
        <Separator className="flex-1" />
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.8 12.23c0-.72-.06-1.25-.2-1.8H12v3.37h5.64c-.11.84-.71 2.1-2.04 2.95l-.02.11 2.73 2.08.19.02c1.77-1.61 2.79-3.98 2.79-6.73Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.07-.89 6.76-2.42l-3.22-2.21c-.86.59-2.01 1-3.54 1a6.16 6.16 0 0 1-5.83-4.16l-.11.01-2.83 2.16-.04.1A10.21 10.21 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.17 14.21A6.08 6.08 0 0 1 5.83 12c0-.77.13-1.52.33-2.21l-.01-.15-2.87-2.2-.09.04A10.01 10.01 0 0 0 2.17 12c0 1.62.39 3.16 1.08 4.52l2.92-2.31Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.63c1.93 0 3.23.82 3.97 1.5l2.89-2.76C17.06 2.75 14.76 2 12 2a10.21 10.21 0 0 0-8.81 5.48l2.97 2.31A6.16 6.16 0 0 1 12 5.63Z"
        fill="#EA4335"
      />
    </svg>
  )
}
