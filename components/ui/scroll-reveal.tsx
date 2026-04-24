"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-in" | "slide-up" | "slide-left" | "slide-right" | "scale-up" | "blur-in"
  delay?: number
  duration?: number
  threshold?: number
}

export function ScrollReveal({
  children,
  className,
  animation = "slide-up",
  delay = 0,
  duration = 800,
  threshold = 0.15,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (domRef.current) observer.unobserve(domRef.current)
          }
        })
      },
      { threshold, rootMargin: "0px 0px 10% 0px" },
    )

    const currentRef = domRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    // Filet de sécurité : évite une page « vide » si l’observateur ne se déclenche pas
    const fallback = window.setTimeout(() => {
      setIsVisible(true)
    }, 4000)

    return () => {
      window.clearTimeout(fallback)
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [threshold])

  const getAnimationClasses = () => {
    switch (animation) {
      case "fade-in":
        return isVisible ? "opacity-100" : "opacity-0"
      case "slide-up":
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      case "slide-left":
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
      case "slide-right":
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
      case "scale-up":
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      case "blur-in":
        return isVisible ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-md translate-y-6"
      default:
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
    }
  }

  return (
    <div
      ref={domRef}
      className={cn(
        "will-change-[opacity,transform,filter] ease-[cubic-bezier(0.22,1,0.36,1)]",
        getAnimationClasses(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionProperty: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  )
}
