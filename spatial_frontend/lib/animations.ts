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

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// Minimal timing - linear or near-linear, very fast
export const timing: {
  slow: Transition;
  normal: Transition;
  fast: Transition;
} = {
  slow: { 
    duration: 0.5, 
    ease: "linear" // Completely linear, no bounce
  },
  normal: { 
    duration: 0.4, 
    ease: "linear" // Completely linear, no bounce
  },
  fast: { 
    duration: 0.2, 
    ease: "linear" // Completely linear, no bounce
  },
};

// Minimal stagger - very subtle delays
export const stagger: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.06, // Very minimal stagger
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

