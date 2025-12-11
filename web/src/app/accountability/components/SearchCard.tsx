"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  minChars?: number;
};

export function SearchCard({ value, onChange, minChars = 2 }: Props) {
  const handleClear = () => onChange("");
  const hint =
    minChars > 0
      ? `Enter at least ${minChars} characters to search.`
      : "Start typing to search, or pick from the featured list below.";

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-4 w-4 text-muted-foreground" />
          Accountability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search for a politician to see their documents, votes, and activity.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Type a name or intressent-id..."
            aria-label="Search politicians"
            className="flex-1"
          />
          {value ? (
            <Button variant="ghost" size="icon" onClick={handleClear} aria-label="Clear search">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
