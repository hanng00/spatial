import { Variants, Transition } from "framer-motion";

// Minimal editorial/academic animations - opacity only, no movement, no bounce
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

// More dramatic fade-in-up for hero elements
export const fadeInUpHero: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    }
  },
  exit: { opacity: 0, y: 30 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// Orchestrated timing with smooth easing curves for high-impact animations
export const timing: {
  slow: Transition;
  normal: Transition;
  fast: Transition;
  hero: Transition; // Special timing for hero section
} = {
  slow: { 
    duration: 0.6, 
    ease: [0.16, 1, 0.3, 1] // Smooth ease-out curve
  },
  normal: { 
    duration: 0.4, 
    ease: [0.16, 1, 0.3, 1] // Smooth ease-out curve
  },
  fast: { 
    duration: 0.25, 
    ease: [0.16, 1, 0.3, 1] // Smooth ease-out curve
  },
  hero: {
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1] // Slower, more dramatic for hero
  },
};

// Orchestrated stagger for high-impact reveals
export const stagger: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08, // More pronounced stagger for orchestrated feel
    },
  },
};

// Hero-specific stagger for dramatic page load
export const heroStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1, // Slower stagger for hero section
    },
  },
};

// No scale animations - removed for minimalism
export const scaleIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Minimal slide animations
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

