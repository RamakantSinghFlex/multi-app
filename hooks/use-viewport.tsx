"use client"

import * as React from "react"

export function useIsSize(BREAKPOINT: number = 768) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [BREAKPOINT])

  return !!isMobile
}
