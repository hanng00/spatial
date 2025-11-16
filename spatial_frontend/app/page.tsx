"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Link2, MapPin } from "lucide-react";
import Link from "next/link";
import { fadeIn, fadeInUp, timing, stagger } from "@/lib/animations";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Geometric pattern overlay - subtle network/connection theme */}
      <div className="fixed inset-0 pattern-grid pointer-events-none opacity-30" />

      {/* Sleek Topbar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-primary/20">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...timing.fast, delay: 0.1 }}
              className="font-serif text-base font-medium text-foreground"
            >
              Spatial
            </motion.h3>
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
            <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/70 to-background/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            {/* Subtle color cast - investigative amber */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(217,119,6,0.15),transparent_60%)]" />
          </motion.div>
        </div>

        {/* Text Overlay - Bottom Left */}
        <div className="relative z-10 flex h-full items-end">
          <div className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...timing.normal, delay: 0.2 }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...timing.normal, delay: 0.25 }}
              >
                <Badge
                  variant="outline"
                  className="mb-6 border-2 border-primary/40 bg-card/80 backdrop-blur-md text-primary font-medium"
                >
                  TRANSPARENCY & ACCOUNTABILITY
                </Badge>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...timing.normal, delay: 0.3 }}
                className="mb-4 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                SEE THE CONNECTIONS
                <br />
                <span className="text-primary">THAT SHAPE DECISIONS</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...timing.normal, delay: 0.35 }}
                className="mb-6 max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg"
              >
                Spatial transforms complex, disconnected public data into clear,
                actionable insights. Discover the hidden networks between
                corporations, politicians, and regulatory bodies.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...timing.normal, delay: 0.4 }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/map">
                  <Button
                    size="default"
                    className="border-2 border-primary bg-primary font-medium hover:bg-primary/90 transition-colors"
                  >
                    Explore the Map
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="default"
                  className="border-2 border-primary/40 bg-card/50 backdrop-blur-sm font-medium text-foreground hover:bg-card/70 hover:border-primary/60 transition-all"
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
                    <h2 className="px-6 mb-6 text-foreground text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Sweden Isn&apos;t What It Claims to Be
              </h2>
                    <div className="h-1 w-24 bg-primary mb-6" />
                  </motion.div>

                  {/* First paragraph - full width */}
                  <motion.div variants={fadeInUp} className="mb-16">
                    <p className="text-foreground text-lg sm:text-xl leading-relaxed mb-6 font-medium">
                Behind the facade of transparency and accountability lies a
                system where decisions are made in backrooms, connections are
                hidden, and power flows through invisible networks.
              </p>
                    <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-medium">
                You&apos;ve seen it: politicians voting against public interest,
                corporate interests shaping policy, procurement deals that
                don&apos;t add up. The data exists—scattered across government
                databases, buried in parliamentary records, hidden in corporate
                filings. But connecting the dots? That&apos;s been impossible.
                Until now.
              </p>
            </motion.div>

                  {/* Asymmetrical content blocks - staggered, overlapping */}
                  <div className="space-y-8">
                    {/* First block - offset left, larger */}
            <motion.div
              variants={fadeInUp}
                      className="group relative lg:-ml-12 bg-card/80 backdrop-blur-md p-8 lg:p-10 border-l-4 border-primary shadow-lg"
            >
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 rounded-full" />
                      <h3 className="mb-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  The Hidden Networks
                </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Board memberships, donations, and contracts are public—but
                  connecting them requires digging through thousands of documents.
                  The connections stay hidden.
                </p>
              </motion.div>

                    {/* Second block - offset right, smaller, overlapping */}
                    <motion.div
                      variants={fadeInUp}
                      className="group relative lg:ml-8 lg:-mt-6 bg-card/70 backdrop-blur-sm p-6 lg:p-8 border-t-4 border-accent shadow-md"
                    >
                      <h3 className="mb-3 text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                  The Questions That Go Unanswered
                </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Why did that politician vote that way? Who benefits? The
                  answers are buried in the data. We&apos;re making them visible.
                </p>
              </motion.div>

                    {/* Third block - offset left again, medium size */}
                    <motion.div
                      variants={fadeInUp}
                      className="group relative lg:-ml-6 bg-card/75 backdrop-blur-md p-7 lg:p-9 border-r-4 border-primary shadow-lg"
                    >
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent/20 rounded-full" />
                      <h3 className="mb-3 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Transparency That Actually Works
                </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  Not transparency theater—where data exists but is unusable.
                  Real transparency: connections mapped, relationships visualized,
                  patterns revealed.
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
              {/* Layered overlays - investigative theme */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/60 to-background/70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.1),transparent_70%)]" />

              {/* Quote Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <motion.blockquote
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...timing.normal, delay: 0.1 }}
                  className="max-w-3xl text-center"
                >
                  <p className="mb-4 font-serif text-2xl font-medium leading-relaxed text-foreground sm:text-3xl lg:text-4xl">
                    &ldquo;The only true wisdom is knowing you know
                    nothing.&rdquo;
                  </p>
                  <p className="text-sm font-medium text-primary sm:text-base">
                    — Socrates
                  </p>
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
              <h2 className="mb-4 text-foreground">Data Sources</h2>
              <p className="text-muted-foreground text-base">
                Public records from government transparency filings, procurement
                databases, corporate ownership registries, and lobbying
                disclosures.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid gap-8 border-t border-primary/20 pt-12 sm:grid-cols-2"
            >
              <motion.div variants={fadeInUp} className="group">
                <div className="mb-3 flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary transition-colors group-hover:text-primary/80" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Swedish Riksdagen
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Parliamentary speeches, voting records, document touchpoints,
                  and politician profiles from the Swedish Parliament.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="group">
                <div className="mb-3 flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-accent transition-colors group-hover:text-accent/80" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Corporate Networks
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Board memberships, ownership structures, and corporate
                  relationships mapped across entities.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="group">
                <div className="mb-3 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary transition-colors group-hover:text-primary/80" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Geographic Data
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Location-based analysis of political donations, corporate
                  deals, and regulatory meetings.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="group">
                <div className="mb-3 flex items-center gap-3">
                  <Database className="h-5 w-5 text-accent transition-colors group-hover:text-accent/80" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Procurement Records
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Government contracts, bidding processes, and vendor
                  relationships tracked over time.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA - Minimal, Direct */}
      <section className="relative py-24 overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-card/20 to-background" />
        <div className="absolute inset-0 pattern-grid opacity-10" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="mb-4 text-foreground">Explore the Data</h2>
            <p className="mb-8 text-muted-foreground text-base">
              Start mapping connections and uncovering relationships in public
              data.
            </p>
            <Link href="/map">
              <Button
                size="default"
                className="border-2 border-primary bg-primary font-medium hover:bg-primary/90 transition-colors"
              >
                Open Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
