import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  useRouteError,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RouteErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.statusText || error.data?.message || "The requested page could not be loaded."
    : error instanceof Error
      ? error.message
      : "An unexpected application error occurred.";

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="py-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" />
          </span>
          <h1 className="mt-5 text-2xl font-black">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-1 size-4" /> Go to home
              </Link>
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-1 size-4" /> Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
