"use client"

import { useEffect, useRef, useState } from "react"

export function AnimatedCounter({ 
  value, 
  suffix = "", 
  duration = 2000 
}: { 
  value: number, 
  suffix?: string, 
  duration?: number 
}) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  
  // Use simple IntersectionObserver if framer-motion is missing, or simple state if needed.
  // Actually we can implement our own simple hook
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })
    
    if (ref.current) observer.observe(ref.current)
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    
    let startTime: number | null = null
    let animationFrame: number
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      // check if it's a float
      const isFloat = value % 1 !== 0
      const currentVal = easeProgress * value
      
      if (isFloat) {
        setCount(Number(currentVal.toFixed(1)))
      } else {
        setCount(Math.floor(currentVal))
      }
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step)
      }
    }
    
    animationFrame = window.requestAnimationFrame(step)
    
    return () => window.cancelAnimationFrame(animationFrame)
  }, [isVisible, value, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}
