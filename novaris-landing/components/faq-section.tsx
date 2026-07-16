"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How is Novaris different from a typical staking dashboard?",
    answer:
      "Most dashboards display a number only after a backend job produces it. In Novaris the reward math lives entirely inside the smart contract — the earned() value you see is read straight from onchain state and computed the moment you ask.",
  },
  {
    id: "2",
    question: "What is the reward-per-token accumulator?",
    answer:
      "It's the heart of the protocol: one pool-wide figure that rises every second in proportion to the reward rate divided by total staked. Your rewards equal your stake times how far that figure has advanced since your last checkpoint — a constant-time calculation no matter how many stakers there are.",
  },
  {
    id: "3",
    question: "Is there a lock-up period?",
    answer:
      "None at all. You can withdraw part or all of your stake whenever you want. An unstake checkpoints your pending rewards first, so pulling out your principal never costs you accrued earnings.",
  },
  {
    id: "4",
    question: "What if I claim when no rewards are owed?",
    answer:
      "Nothing goes wrong — it's a no-op that simply returns 0 instead of throwing an error, so there's no downside to checking in early.",
  },
  {
    id: "5",
    question: "Is Novaris live and usable today?",
    answer:
      "Yes. Token A, Token B, and the staking pool contract are all deployed on Stellar Testnet with real, verifiable transaction history — this isn't a concept, it's running code.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="w-full bg-slate-900 py-24 md:py-32 border-b border-slate-700/30"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Header */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-4 py-2 border border-slate-700 w-fit">
              <div className="w-2.5 h-2.5 bg-cyan-400" />
              <span className="text-sm font-medium text-slate-400 tracking-wide">
                FAQ
              </span>
            </div>
            
            <h2 className="text-balance text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.1]">
              {"Questions, Answered".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ filter: "blur(10px)", opacity: 0 }}
                  whileInView={{ filter: "blur(0px)", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </h2>

            <p className="text-balance text-base md:text-lg text-slate-400 leading-relaxed max-w-md">
              Quick answers on the Novaris reward-per-token accumulator and how
              staking on Stellar Soroban works. Still can't find what you need?
              Reach out below.
            </p>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="flex flex-col">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  "border-t border-slate-700/30",
                  index === faqs.length - 1 && "border-b"
                )}
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full py-6 flex items-center justify-between gap-4 text-left group"
                >
                  <span className="text-lg md:text-xl font-normal text-white group-hover:text-slate-300 transition-colors">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pr-12">
                        <p className="text-base leading-relaxed text-slate-400">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
