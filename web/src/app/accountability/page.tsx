"use client";

import { SiteHeader } from "@/components/SiteHeader";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ProfileDetail } from "./components/ProfileDetail";
import { SearchCard } from "./components/SearchCard";
import { SearchResults } from "./components/SearchResults";
import { usePoliticianDetail, usePoliticianSearch } from "./data";

const MIN_QUERY_LENGTH = 0;

export default function AccountabilityPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AccountabilityPageContent />
    </Suspense>
  );
}

function AccountabilityPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQuery = searchParams.get("q") ?? "";
  const initialSelected = searchParams.get("id");

  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);
  const debouncedQuery = useDebouncedValue(query, 300);

  const {
    data: results = [],
    isLoading: isSearching,
    isError: searchError,
  } = usePoliticianSearch({
    query: debouncedQuery,
    limit: 20,
    enabled: true,
    minQueryLength: MIN_QUERY_LENGTH,
  });

  const {
    data: detail,
    isLoading: isLoadingDetail,
    isError: detailError,
  } = usePoliticianDetail(selectedId, { limit: 50 });

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedId) params.set("id", selectedId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [query, selectedId, pathname, router]);

  const handleSelect = (intressentId: string) => {
    setSelectedId(intressentId);
  };

  useEffect(() => {
    if (!selectedId && results.length > 0) {
      setSelectedId(results[0].intressent_id);
    }
  }, [results, selectedId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-6 lg:py-8">
        <ResizablePanelGroup
          direction="horizontal"
          className="gap-4 min-h-[70vh]"
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="space-y-4 h-full">
              <SearchCard
                value={query}
                onChange={setQuery}
                minChars={MIN_QUERY_LENGTH}
              />
              <SearchResults
                query={query}
                results={results}
                isLoading={isSearching}
                isError={searchError}
                onSelect={handleSelect}
                selectedId={selectedId}
                minQueryLength={MIN_QUERY_LENGTH}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={40}>
            <ProfileDetail
              selectedId={selectedId}
              detail={detail}
              isLoading={isLoadingDetail}
              isError={detailError}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
