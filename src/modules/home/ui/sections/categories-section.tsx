'use client'

import FilterCarousel from "@/components/filter-carousel"
import { trpc } from "@/trpc/client"
import { useRouter } from "next/navigation"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"


function CategoriesSectionSkeleton()
{
  return (
    <FilterCarousel isLoading data={[]} onSelect={() => {}}/>
  )
}

function CategoriesSection({ categoryId } : { categoryId?: string }) {
  return (
    <Suspense fallback={<CategoriesSectionSkeleton/>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId}/>
      </ErrorBoundary>
    </Suspense>
  )
}

function CategoriesSectionSuspense({ categoryId } : { categoryId?: string }) {
  const router = useRouter();

  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const data = categories.map((c) => ({
    value: c.id,
    label: c.name
  }))

  function onSelect(value: string | null)
  {
    const url = new URL(window.location.href);
    
    if (value) {
      url.searchParams.set("categoryId", value);
    }
    else
      url.searchParams.delete("categoryId");
    
    router.push(url.toString());
  }

  return (
    <FilterCarousel onSelect={onSelect} value={categoryId} data={data}/>
  )
}

export default CategoriesSection