"use client";

import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fadeIn,
  fadeInUp,
  fadeInUpHero,
  heroStagger,
  stagger,
  timing,
} from "@/lib/animations";
import { motion } from "framer-motion";
import { ArrowRight, Database, Link2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Geometric pattern overlay - subtle network/connection theme */}
      <div className="fixed inset-0 pattern-grid pointer-events-none opacity-30" />

      {/* Sleek Topbar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-primary/20">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/map"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Map
            </Link>
            <Link
              href="#data"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Data
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section - Full Screen Dramatic Design */}
      <section className="relative h-screen w-full border-b border-primary/20 overflow-hidden">
        {/* Atmospheric background layers */}
        <div className="absolute inset-0 pattern-lines opacity-20" />

        {/* Full Screen Image - spans entire screen */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={timing.slow}
            className="h-full w-full overflow-hidden"
          >
            <Image
              src="https://images.pexels.com/photos/2167395/pexels-photo-2167395.jpeg"
              alt="Classical Greek sculpture representing democracy and intelligence"
              className="h-full w-full object-cover"
              sizes="100vw"
              fill
              priority
            />
            {/* Layered overlays for depth - amber/teal gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/60 to-background/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            {/* Bold amber color cast - more dominant */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(217,119,6,0.25),transparent_50%)]" />
            {/* Additional amber accent overlay for depth */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,119,6,0.08)_0%,transparent_40%)]" />
          </motion.div>
        </div>

        {/* Text Overlay - Bottom Left */}
        <div className="relative z-10 flex h-full items-end">
          <div className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
            <motion.div
              initial="initial"
              animate="animate"
              variants={heroStagger}
              className="max-w-3xl"
            >
              <motion.div variants={fadeInUpHero}>
                <Badge
                  variant="outline"
                  className="mb-8 border-2 border-primary bg-primary/20 backdrop-blur-md text-primary font-bold text-sm tracking-wider px-4 py-2 shadow-lg shadow-primary/10"
                >
                  TRANSPARENCY & ACCOUNTABILITY
                </Badge>
              </motion.div>
              {/* Bold amber accent bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{
                  ...timing.slow,
                  delay: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mb-6 h-1 bg-primary"
              />
              <motion.h1
                variants={fadeInUpHero}
                className="mb-6 font-serif text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl lg:text-7xl tracking-tight"
              >
                SEE THE CONNECTIONS
                <br />
                <span className="text-primary">THAT SHAPE DECISIONS</span>
              </motion.h1>
              <motion.p
                variants={fadeInUpHero}
                className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl"
              >
                Spatial transforms complex, disconnected public data into clear,
                actionable insights. Discover the hidden networks between
                corporations, politicians, and regulatory bodies.
              </motion.p>
              <motion.div
                variants={fadeInUpHero}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <Link href="/map">
                  <Button
                    size="lg"
                    className="border-2 border-primary bg-primary font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Explore the Map
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary/60 bg-card/60 backdrop-blur-sm font-semibold text-foreground hover:bg-primary/10 hover:border-primary transition-all"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* User Intent - Frustration & Problem Statement */}
      <section
        id="problem"
        className="relative border-b border-primary/20 overflow-hidden"
      >
        <div className="relative min-h-screen lg:min-h-[900px]">
          {/* Asymmetrical split: Image takes left 60%, content on right */}
          <div className="lg:grid lg:grid-cols-[60%_40%] lg:h-screen lg:max-h-[900px]">
            {/* Image side - prominent and visible */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={timing.slow}
              className="relative h-[400px] sm:h-[500px] lg:h-full lg:sticky lg:top-0"
            >
              <Image
                src="https://images.pexels.com/photos/17203903/pexels-photo-17203903.jpeg"
                alt="Swedish architecture and governance"
                className="h-full w-full object-cover"
                sizes="60vw"
                fill
                priority
              />
              {/* Minimal overlay - let image show through */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-background/40" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </motion.div>

            {/* Content side - asymmetrical layout */}
            <div className="relative lg:overflow-y-auto">
              <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={stagger}
                  className="max-w-2xl lg:max-w-none"
                >
                  {/* Main heading - offset to the left */}
                  <motion.div variants={fadeInUp} className="mb-12 lg:-ml-8">
                    <h2 className="px-6 mb-6 text-foreground text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
                      Sweden Isn&apos;t What It Claims to Be
                    </h2>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "120px" }}
                      viewport={{ once: true }}
                      transition={{ ...timing.slow, ease: [0.16, 1, 0.3, 1] }}
                      className="h-1.5 w-24 bg-primary mb-6 shadow-lg shadow-primary/30"
                    />
                  </motion.div>

                  {/* First paragraph - full width */}
                  <motion.div variants={fadeInUp} className="mb-16">
                    <p className="text-foreground text-lg sm:text-xl leading-relaxed mb-6 font-medium">
                      Behind the facade of transparency and accountability lies
                      a system where decisions are made in backrooms,
                      connections are hidden, and power flows through invisible
                      networks.
                    </p>
                    <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-medium">
                      You&apos;ve seen it: politicians voting against public
                      interest, corporate interests shaping policy, procurement
                      deals that don&apos;t add up. The data exists—scattered
                      across government databases, buried in parliamentary
                      records, hidden in corporate filings. But connecting the
                      dots? That&apos;s been impossible. Until now.
                    </p>
                  </motion.div>

                  {/* Asymmetrical content blocks - staggered, overlapping */}
                  <div className="space-y-8">
                    {/* First block - offset left, larger */}
                    <motion.div
                      variants={fadeInUp}
                      className="group relative lg:-ml-12 bg-card/90 backdrop-blur-md p-8 lg:p-10 border-l-4 border-primary shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
                    >
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-colors" />
                      <h3 className="mb-4 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        The Hidden Networks
                      </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        Board memberships, donations, and contracts are
                        public—but connecting them requires digging through
                        thousands of documents. The connections stay hidden.
                      </p>
                    </motion.div>

                    {/* Second block - offset right, smaller, overlapping */}
                    <motion.div
                      variants={fadeInUp}
                      className="group relative lg:ml-8 lg:-mt-6 bg-card/80 backdrop-blur-sm p-6 lg:p-8 border-t-4 border-accent shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all duration-300"
                    >
                      <h3 className="mb-3 text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                        The Questions That Go Unanswered
                      </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        Why did that politician vote that way? Who benefits? The
                        answers are buried in the data. We&apos;re making them
                        visible.
                      </p>
                    </motion.div>

                    {/* Third block - offset left again, medium size */}
                    <motion.div
                      variants={fadeInUp}
                      className="group relative lg:-ml-6 bg-card/85 backdrop-blur-md p-7 lg:p-9 border-r-4 border-primary shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
                    >
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent/30 rounded-full group-hover:bg-accent/40 transition-colors" />
                      <h3 className="mb-3 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        Transparency That Actually Works
                      </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        Not transparency theater—where data exists but is
                        unusable. Real transparency: connections mapped,
                        relationships visualized, patterns revealed.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section with Quote */}
      <section className="relative border-b border-primary/20 py-24 overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/10 to-transparent" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="mx-auto max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={timing.slow}
              className="relative aspect-16/10 overflow-hidden rounded-sm border border-primary/20"
            >
              <Image
                src="https://images.pexels.com/photos/12930097/pexels-photo-12930097.png"
                alt="Classical architecture and democracy"
                className="h-full w-full object-cover"
                sizes="100vw"
                fill
              />
              {/* Layered overlays - investigative theme with bolder amber */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/50 to-background/60" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.15),transparent_60%)]" />

              {/* Quote Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <motion.blockquote
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...timing.slow, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-4xl text-center"
                >
                  <div>
                    <p className="mb-6 font-serif text-3xl font-semibold leading-relaxed text-foreground sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight">
                      &ldquo;The only true wisdom is knowing you know
                      nothing.&rdquo;
                    </p>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "80px" }}
                      viewport={{ once: true }}
                      transition={{
                        ...timing.slow,
                        delay: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="h-1 bg-primary mb-4 mx-auto shadow-lg shadow-primary/30"
                    />
                    <p className="text-base font-bold text-primary sm:text-lg tracking-wide">
                      — Socrates
                    </p>
                  </div>
                </motion.blockquote>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Data Sources - Factual, Tool-Focused */}
      <section
        id="data"
        className="relative border-b border-primary/20 py-24 overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mx-auto max-w-4xl"
          >
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
                Data Sources
              </h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
                transition={{ ...timing.slow, ease: [0.16, 1, 0.3, 1] }}
                className="h-1.5 bg-primary mb-6 shadow-lg shadow-primary/30"
              />
              <p className="text-foreground/90 text-lg font-medium leading-relaxed">
                Public records from government transparency filings, procurement
                databases, corporate ownership registries, and lobbying
                disclosures.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid gap-8 border-t border-primary/20 pt-12 sm:grid-cols-2"
            >
              <motion.div
                variants={fadeInUp}
                className="group p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-card/70 transition-all duration-300"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary transition-colors group-hover:text-primary/90" />
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Swedish Riksdagen
                  </h3>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Parliamentary speeches, voting records, document touchpoints,
                  and politician profiles from the Swedish Parliament.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="group p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-accent/20 hover:border-accent/40 hover:bg-card/70 transition-all duration-300"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Link2 className="h-6 w-6 text-accent transition-colors group-hover:text-accent/90" />
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    Corporate Networks
                  </h3>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Board memberships, ownership structures, and corporate
                  relationships mapped across entities.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="group p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-card/70 transition-all duration-300"
              >
                <div className="mb-3 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary transition-colors group-hover:text-primary/90" />
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Geographic Data
                  </h3>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Location-based analysis of political donations, corporate
                  deals, and regulatory meetings.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="group p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-accent/20 hover:border-accent/40 hover:bg-card/70 transition-all duration-300"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Database className="h-6 w-6 text-accent transition-colors group-hover:text-accent/90" />
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    Procurement Records
                  </h3>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Government contracts, bidding processes, and vendor
                  relationships tracked over time.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA - Bold, Direct */}
      <section className="relative py-32 overflow-hidden">
        {/* Atmospheric background with amber accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-background" />
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,6,0.08),transparent_70%)]" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground">
              Explore the Data
            </h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "120px" }}
              viewport={{ once: true }}
              transition={{ ...timing.slow, ease: [0.16, 1, 0.3, 1] }}
              className="h-1.5 bg-primary mb-8 mx-auto shadow-lg shadow-primary/30"
            />
            <p className="mb-10 text-foreground/90 text-lg font-medium leading-relaxed">
              Start mapping connections and uncovering relationships in public
              data.
            </p>
            <Link href="/map">
              <Button
                size="lg"
                className="border-2 border-primary bg-primary font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 text-lg px-8 py-6"
              >
                Open Map
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
          <Logo size="lg" className="mt-8 mx-auto" />
        </div>
      </section>
    </div>
  );
}
