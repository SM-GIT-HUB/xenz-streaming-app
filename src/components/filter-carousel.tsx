'use client'

import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Skeleton } from "./ui/skeleton"

interface FilterCarouselProps {
    value?: string | null;
    isLoading?: boolean;
    onSelect: (value: string | null) => void;
    data: {
        value: string;
        label: string;
    }[]
}

function FilterCarousel({ value, isLoading, onSelect, data } : FilterCarouselProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        })
    }, [api])

  return (
    <div className="relative w-full">
        {/* fade */}
        {
            !isLoading &&
            <div className={cn(
                "absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none",
                current == 1 && "hidden"
            )} />
        }

        <Carousel setApi={setApi} opts={{ align: "start", dragFree: true }} className="w-full px-12">
            <CarouselContent className="-ml-3">
                {
                    !isLoading &&
                    <CarouselItem className="pl-3 basis-auto" onClick={() => onSelect(null)}>
                        <Badge variant={!value? "default" : "secondary"} className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm">
                            All
                        </Badge>
                    </CarouselItem>
                }

                {/* Loading skeleton starts here */}
                {/* fade left */}
                {isLoading && <div className={cn("absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" )} />}

                {
                    isLoading && Array.from({ length: 14 }).map((_, idx) => (
                        <CarouselItem key={idx} className="pl-3 basis-auto">
                            <Skeleton className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold">
                                &nbsp;
                            </Skeleton>
                        </CarouselItem>
                    ))
                }

                {/* fade right */}
                {isLoading && <div className={cn("absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" )} />}
                {/* Loading skeleton ends here*/}

                {
                    !isLoading && data.map((item) => {
                        return (
                            <CarouselItem key={item.value} className="pl-3 basis-auto" onClick={() => onSelect(item.value)}>
                                <Badge variant={value == item.value? "default" : "secondary"} className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm">
                                    {item.label}
                                </Badge>
                            </CarouselItem>
                        )
                    })
                }
            </CarouselContent>
            <CarouselPrevious className="left-0 z-20"/>
            <CarouselNext className="right-0 z-20"/>
        </Carousel>

        {/* fade */}
        {
            !isLoading &&
            <div className={cn(
                "absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none",
                current == count && "hidden"
            )} />
        }
    </div>
  )
}

export default FilterCarousel