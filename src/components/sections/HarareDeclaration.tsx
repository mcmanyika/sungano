"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EmailSubscribe } from "@/components/ui/EmailSubscribe";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToDeclaration } from "@/lib/firebase/declaration";
import {
  DEFAULT_DECLARATION,
  formatDeclarationMessage,
  type Declaration,
} from "@/types/declaration";

export function HarareDeclaration() {
  const ref = useRef<HTMLElement>(null);
  const [declaration, setDeclaration] = useState<Declaration>({
    ...DEFAULT_DECLARATION,
    updatedAt: null,
  });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = subscribeToDeclaration(
      (nextDeclaration) => setDeclaration(nextDeclaration),
      () => setDeclaration({ ...DEFAULT_DECLARATION, updatedAt: null }),
    );

    return unsubscribe;
  }, []);

  const messageLines = formatDeclarationMessage(declaration.message);

  return (
    <section
      ref={ref}
      id="declaration"
      className="relative overflow-hidden py-28 md:py-36"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[12%] -bottom-[12%]"
        aria-hidden
      >
        <Image
          src="/images/banner3.png"
          alt=""
          fill
          loading="lazy"
          fetchPriority="low"
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8"
      >
        <blockquote className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
          {declaration.headline}
        </blockquote>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
          {messageLines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < messageLines.length - 1 && <br />}
            </span>
          ))}
        </p>
        <div className="mt-10">
          <EmailSubscribe source="harare-declaration" />
        </div>
      </motion.div>
    </section>
  );
}
