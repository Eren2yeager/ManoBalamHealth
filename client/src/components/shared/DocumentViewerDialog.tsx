import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cloudinary (or any) URL of the document — image or PDF. */
  url: string | null;
  title?: string;
  description?: string;
}

const isPdf = (url: string) => /\.pdf($|\?)/i.test(url) || url.includes("/raw/");

/**
 * In-app preview for uploaded credential documents. Renders images inline and
 * PDFs in an iframe, with a fallback link to open the original in a new tab.
 */
export function DocumentViewerDialog({
  open,
  onOpenChange,
  url,
  title = "Document preview",
  description,
}: DocumentViewerDialogProps) {
  const pdf = useMemo(() => (url ? isPdf(url) : false), [url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {url && (
          <div className="grid max-h-[70vh] place-items-center overflow-auto rounded-2xl border border-slate-100 bg-slate-50">
            {pdf ? (
              <iframe src={url} title={title} className="h-[65vh] w-full rounded-2xl" />
            ) : (
              <img src={url} alt={title} className="max-h-[65vh] w-auto object-contain" />
            )}
          </div>
        )}
        <Button asChild variant="outline" className="h-10 w-fit rounded-xl font-bold">
          <a href={url ?? "#"} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 size-4" />
            Open original
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
