import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingStore } from "../store/bookingStore";

export const ConcernForm = () => {
  const { concernDescription, setConcern } = useBookingStore();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>What would you like to talk about?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="concern">Describe your concern</Label>
          <textarea
            id="concern"
            value={concernDescription}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="Please share what you're experiencing..."
            className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </CardContent>
    </Card>
  );
};
