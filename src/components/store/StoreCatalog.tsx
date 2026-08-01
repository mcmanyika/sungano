"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { easeOut } from "@/lib/animations";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedProducts } from "@/lib/firebase/products";
import { startStoreCheckout } from "@/lib/store/checkout";
import { cn } from "@/lib/utils";
import { formatStorePrice, type StoreProduct } from "@/types/store";

export function StoreCatalog({
  limit,
  showHeader = true,
  showViewAll = false,
  layout = "grid",
}: {
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  layout?: "grid" | "horizontal";
}) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProduct, setActiveProduct] = useState<StoreProduct | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    setCanScrollLeft(scroller.scrollLeft > 8);
    setCanScrollRight(scroller.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("Store is not available right now.");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPublishedProducts(
      (nextProducts) => {
        setProducts(
          typeof limit === "number"
            ? nextProducts.slice(0, limit)
            : nextProducts,
        );
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load products.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [limit]);

  useEffect(() => {
    if (layout !== "horizontal" || loading || products.length === 0) {
      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    updateScrollButtons();
    scroller.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      scroller.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [layout, loading, products.length, updateScrollButtons]);

  useEffect(() => {
    if (!activeProduct) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveProduct(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProduct]);

  function scrollByCard(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const amount = Math.min(320, scroller.clientWidth * 0.8) * direction;
    scroller.scrollBy({ left: amount, behavior: "smooth" });
  }

  async function handleBuy(product: StoreProduct) {
    setCheckoutError("");
    setBuyingId(product.id);

    const result = await startStoreCheckout({ productId: product.id });

    if (!result.ok) {
      setCheckoutError(result.error);
      setBuyingId(null);
      return;
    }

    window.location.href = result.url;
  }

  if (!loading && !error && products.length === 0) {
    return null;
  }

  return (
    <div>
      {showHeader ? (
        <div className="mb-8 mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Merchandise
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Store
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-secondary" aria-hidden />
        </div>
      ) : null}

      {loading ? (
        layout === "horizontal" ? (
          <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-5">
              {Array.from({ length: limit ?? 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-4/5 w-[min(72vw,18rem)] shrink-0 animate-pulse rounded-2xl bg-neutral-200 sm:w-72"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit ?? 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-4/5 animate-pulse rounded-2xl bg-neutral-200"
              />
            ))}
          </div>
        )
      ) : error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : layout === "horizontal" ? (
        <div className="relative">
          <button
            type="button"
            aria-label="Scroll store left"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
            className={cn(
              "absolute left-0 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition hover:border-primary/20 hover:text-primary sm:left-1 sm:inline-flex md:-left-2",
              !canScrollLeft && "pointer-events-none opacity-0",
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll store right"
            disabled={!canScrollRight}
            onClick={() => scrollByCard(1)}
            className={cn(
              "absolute right-0 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition hover:border-primary/20 hover:text-primary sm:right-1 sm:inline-flex md:-right-2",
              !canScrollRight && "pointer-events-none opacity-0",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollerRef}
            className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex snap-x snap-mandatory gap-5">
              {products.map((product, index) => (
                <motion.button
                  key={product.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.45,
                    ease: easeOut,
                  }}
                  onClick={() => {
                    setCheckoutError("");
                    setActiveProduct(product);
                  }}
                  className="group w-[min(72vw,18rem)] shrink-0 snap-start text-left sm:w-72"
                >
                  <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-neutral-100 p-3 sm:p-4">
                    <div className="relative h-full w-full">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain transition duration-500 group-hover:scale-[1.03]"
                        sizes="288px"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-neutral-900">
                      {product.name}
                    </h3>
                    <p className="shrink-0 text-sm font-semibold text-neutral-800">
                      {formatStorePrice(product.price, product.currency)}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.button
              key={product.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05, duration: 0.45, ease: easeOut }}
              onClick={() => {
                setCheckoutError("");
                setActiveProduct(product);
              }}
              className="group w-full text-left"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-neutral-100 p-3 sm:p-4">
                <div className="relative h-full w-full">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-neutral-900">
                  {product.name}
                </h3>
                <p className="shrink-0 text-sm font-semibold text-neutral-800">
                  {formatStorePrice(product.price, product.currency)}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {showViewAll && !loading && !error && products.length > 0 ? (
        <div className="mt-8 text-center">
          <Link
            href="/store"
            className="text-sm font-semibold text-primary transition hover:text-primary-light"
          >
            View all
          </Link>
        </div>
      ) : null}

      <AnimatePresence>
        {activeProduct ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={activeProduct.name}
            >
              <button
                type="button"
                onClick={() => setActiveProduct(null)}
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white"
                aria-label="Close product details"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative aspect-4/5 w-full bg-neutral-100 sm:aspect-square">
                <Image
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 512px) 100vw, 512px"
                  unoptimized
                  priority
                />
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
                    {activeProduct.name}
                  </h3>
                  <p className="shrink-0 text-base font-semibold text-neutral-800">
                    {formatStorePrice(
                      activeProduct.price,
                      activeProduct.currency,
                    )}
                  </p>
                </div>

                {activeProduct.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {activeProduct.description}
                  </p>
                ) : null}

                {checkoutError ? (
                  <p className="mt-4 text-sm font-medium text-red-600" role="alert">
                    {checkoutError}
                  </p>
                ) : null}

                <Button
                  type="button"
                  className="mt-6 w-full"
                  disabled={buyingId === activeProduct.id}
                  onClick={() => void handleBuy(activeProduct)}
                >
                  {buyingId === activeProduct.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Buy now
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
