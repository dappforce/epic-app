import { useEffect } from 'react'

// Solution from https://github.com/deptyped/vue-telegram/issues/11#issuecomment-1999265843
export default function useTgNoScroll() {
  useEffect(() => {
    const overflow = 500
    document.body.style.overflow = 'hidden'
    document.body.style.paddingTop = `${overflow}px`
    document.body.style.height = window.innerHeight + overflow + 'px !important'
    document.body.style.paddingBottom = `${overflow}px`
    window.scrollTo(0, overflow)

    return () => {
      document.body.style.overflow = 'initial'
      document.body.style.paddingTop = '0'
      document.body.style.height = 'auto'
      document.body.style.paddingBottom = '0'
    }
  }, [])
}