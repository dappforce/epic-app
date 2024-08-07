import ErrorBoundary from '@/components/ErrorBoundary'
import HeadConfig, { HeadConfigProps } from '@/components/HeadConfig'
import Spinner from '@/components/Spinner'
import Toast from '@/components/Toast'
import ProfilePostsListModal from '@/components/chats/ChatItem/profilePosts/ProfileProstsListModal'
import GlobalModals from '@/components/modals/GlobalModals'
import { ReferralUrlChanger } from '@/components/referral/ReferralUrlChanger'
import { env } from '@/env.mjs'
import useIsInIframe from '@/hooks/useIsInIframe'
import useSaveTappedPointsAndEnergy, {
  useGetEnergyStateRef,
} from '@/modules/telegram/TapPage/useSaveTappedPointsAndEnergy'
import { ConfigProvider } from '@/providers/config/ConfigProvider'
import EvmProvider from '@/providers/evm/EvmProvider'
import { getDatahubHealthQuery } from '@/services/datahub/health/query'
import { getLinkedIdentityQuery } from '@/services/datahub/identity/query'
import { increaseEnergyValue } from '@/services/datahub/leaderboard/points-balance/optimistic'
import { FULL_ENERGY_VALUE } from '@/services/datahub/leaderboard/points-balance/query'
import { useDatahubSubscription } from '@/services/datahub/subscription-aggregator'
import { QueryProvider } from '@/services/provider'
import {
  useMyAccount,
  useMyGrillAddress,
  useMyMainAddress,
} from '@/stores/my-account'
import { initAllStores } from '@/stores/registry'
import '@/styles/globals.css'
import { cx } from '@/utils/class-names'
import { isTouchDevice } from '@/utils/device'
import '@rainbow-me/rainbowkit/styles.css'
import { useQueryClient } from '@tanstack/react-query'
import { SDKProvider } from '@tma.js/sdk-react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import React, { useEffect, useRef, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import { Toaster, toast } from 'sonner'
import urlJoin from 'url-join'

export type AppCommonProps = {
  alwaysShowScrollbarOffset?: boolean
  head?: HeadConfigProps
  dehydratedState?: any
  session?: any
}

export default function App(props: AppProps<AppCommonProps>) {
  // useEffect(() => {
  //   import('eruda').then(({ default: eruda }) => {
  //     eruda.init()
  //   })
  // }, [])

  return (
    <SessionProvider
      basePath={
        env.NEXT_PUBLIC_BASE_PATH
          ? urlJoin(env.NEXT_PUBLIC_BASE_PATH, '/api/auth')
          : undefined
      }
      session={props.pageProps.session}
    >
      <Script id='gtm' strategy='afterInteractive'>
        {`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-MQZ9PG2W');
    `}
      </Script>
      <ConfigProvider>
        <Styles
          alwaysShowScrollbarOffset={props.pageProps.alwaysShowScrollbarOffset}
        />
        <SDKProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            forcedTheme='dark'
          >
            <HeadConfig {...props.pageProps.head} />
            <AppContent {...props} />
          </ThemeProvider>
        </SDKProvider>
      </ConfigProvider>
    </SessionProvider>
  )
}

function Styles({
  alwaysShowScrollbarOffset,
}: {
  alwaysShowScrollbarOffset?: boolean
}) {
  const isInIframe = useIsInIframe()

  const scrollbarSelector = isInIframe ? 'body' : 'html'
  const scrollbarStyling = alwaysShowScrollbarOffset
    ? `
      ${scrollbarSelector} {
        overflow-y: scroll;
      }
    `
    : ''

  return (
    <style jsx global>{`
      ${isInIframe
        ? // Fix issue with iframe height not calculated correctly in iframe
          `
        html,
        body {
          height: 100%;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
      `
        : ''}
      ${scrollbarStyling}
    `}</style>
  )
}

function AppContent({ Component, pageProps }: AppProps<AppCommonProps>) {
  const { head, dehydratedState, ...props } = pageProps

  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    initAllStores()
  }, [])

  return (
    <TelegramScriptWrapper>
      <QueryProvider dehydratedState={dehydratedState}>
        <DatahubSubscriber />
        <ToasterConfig />
        <ReferralUrlChanger />
        <GlobalModals />
        <DatahubHealthChecker />
        <SessionAccountChecker />
        <div className={cx('font-sans')}>
          <ErrorBoundary>
            <EvmProvider>
              <TappingHooksWrapper>
                <ProfileModalWrapper>
                  <Component {...props} />
                </ProfileModalWrapper>
              </TappingHooksWrapper>
            </EvmProvider>
          </ErrorBoundary>
        </div>
      </QueryProvider>
    </TelegramScriptWrapper>
  )
}

const ProfileModalWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <ProfilePostsListModal />
  </>
)

function TelegramScriptWrapper({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isTouchDevice() || isDesktop) {
      setIsExpanded(true)
    }
  }, [])

  useEffect(() => {
    // if more than 5secs onLoad is not called, just show the content
    setTimeout(() => {
      setIsExpanded(true)
    }, 5000)
  }, [])

  const onLoad = () => {
    const telegram = window.Telegram as any
    const webApp = telegram?.WebApp
    const isFromATelegramApp = !!webApp.initData
    if (webApp && isFromATelegramApp) {
      webApp.ready()
      webApp.expand()
      webApp.onEvent('viewportChanged', () => {
        if (webApp.isExpanded) {
          setIsExpanded(true)
        }
      })
    } else {
      // if not a telegram webapp, just show the content
      setIsExpanded(true)
    }
  }

  if (!isExpanded) {
    children = (
      <div className='flex h-screen w-full flex-col items-center justify-center'>
        <div className='flex items-center gap-2 text-text-muted'>
          <Spinner />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        onLoad={onLoad}
        src='https://telegram.org/js/telegram-web-app.js'
      />
      {children}
    </>
  )
}

const TappingHooksWrapper = ({ children }: { children: React.ReactNode }) => {
  const myAddress = useMyMainAddress()
  const client = useQueryClient()

  const { data: energyStateRef, isLoading } = useGetEnergyStateRef()

  useEffect(() => {
    if (isLoading) return
    const interval = setInterval(() => {
      if (energyStateRef.current?.energyValue === FULL_ENERGY_VALUE) return

      increaseEnergyValue({
        client,
        address: myAddress || '',
        energyValuePerClick: 1,
      })
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [isLoading])

  useSaveTappedPointsAndEnergy()

  return <>{children}</>
}

function DatahubSubscriber() {
  useDatahubSubscription()
  return null
}

function ToasterConfig() {
  return (
    <Toaster
      position='top-center'
      visibleToasts={2}
      className='!top-16 [&>*]:w-full'
    />
  )
}

function SessionAccountChecker() {
  const grillAddress = useMyGrillAddress()
  const { data: linkedIdentity } = getLinkedIdentityQuery.useQuery(
    grillAddress ?? ''
  )
  const mainAddress = useMyMainAddress()

  useEffect(() => {
    if (linkedIdentity && linkedIdentity.mainAddress !== mainAddress) {
      useMyAccount.getState().saveProxyAddress(linkedIdentity.mainAddress)
    }
  }, [linkedIdentity, mainAddress])

  return null
}

function DatahubHealthChecker() {
  const { data } = getDatahubHealthQuery.useQuery(null, {
    refetchInterval: 10_000,
    retry: false,
  })
  const currentId = useRef<string | number>('')
  useEffect(() => {
    if (typeof data !== 'boolean') return
    if (!data) {
      if (currentId.current) return
      const id = toast.custom(
        (t) => (
          <Toast
            t={t}
            title='We are currently performing maintenance. Thank you for your patience.'
            type='error'
          />
        ),
        { duration: Infinity, dismissible: false }
      )
      currentId.current = id
    } else {
      toast.dismiss(currentId.current)
      currentId.current = ''
    }
  }, [data])

  return null
}
