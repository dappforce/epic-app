import CatClicker from '@/components/CatClicker'
import {
  decreaseEnergyValue,
  increasePointsBalance,
} from '@/services/datahub/leaderboard/points-balance/optimistic'
import {
  FULL_ENERGY_VALUE,
  getClickedPointsByDayQuery,
  getEnergyStateQuery,
} from '@/services/datahub/leaderboard/points-balance/query'
import { getActiveStakingTokenomicMetadataQuery } from '@/services/datahub/leaderboard/query'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { useQueryClient } from '@tanstack/react-query'
import { useHapticFeedbackRaw } from '@tma.js/sdk-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { TouchEvent, TouchList, useEffect, useRef, useState } from 'react'
import {
  getEnergyStateStore,
  getTappedPointsStateStore,
  setEnergyStateToStore,
  setTappedPointsStateToStore,
} from './store'

dayjs.extend(utc)

type PointsClickerProps = {
  className?: string
}

const PointsClicker = ({ className }: PointsClickerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isTouched, setIsTouched] = useState(false)
  const [touches, setTouches] = useState<TouchList>()
  const haptic = useHapticFeedbackRaw(true)
  const client = useQueryClient()
  const myAddress = useMyMainAddress()
  const { data, isLoading: isEnergyLoading } = getEnergyStateQuery.useQuery(
    myAddress || ''
  )
  const { data: tokenomicMetadata, isLoading: isTokenomicMetadataLoading } =
    getActiveStakingTokenomicMetadataQuery.useQuery({})
  const { data: clickedPointsByDay, isLoading: isClickedPointsLoading } =
    getClickedPointsByDayQuery.useQuery(myAddress || '')

  const [startAnimation, setStartAnimation] = useState(false)

  const { energyValue } = data || {}

  const isEmptyEnergy = energyValue === 0

  const disableClicker =
    isClickedPointsLoading ||
    isTokenomicMetadataLoading ||
    !tokenomicMetadata ||
    isEnergyLoading ||
    (clickedPointsByDay &&
      clickedPointsByDay?.tapsCount >= tokenomicMetadata.maxTapsPerDay) ||
    isEmptyEnergy

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (startAnimation && !isTouched) {
      timeout = setTimeout(() => {
        setStartAnimation(false)
      }, 1000)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [startAnimation, isTouched])

  useEffect(() => {
    const refCurrent = ref.current
    let ts: number | undefined
    const onTouchStart = (e: any) => {
      ts = e.touches[0].clientY
    }
    const onTouchMove = (e: any) => {
      if (refCurrent) {
        const scroll = refCurrent.scrollTop
        const te = e.changedTouches[0].clientY
        if (scroll <= 0 && ts! < te) {
          e.preventDefault()
        }
      } else {
        e.preventDefault()
      }
    }

    ref.current?.addEventListener('touchstart', onTouchStart, {
      passive: false,
    })
    refCurrent?.addEventListener('touchmove', onTouchMove, {
      passive: false,
    })

    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener('touchstart', onTouchStart)
        refCurrent.removeEventListener('touchmove', onTouchMove)
      }
    }
  }, [])

  const onMouseDown = (event: TouchEvent<HTMLDivElement>) => {
    setStartAnimation(true)
    setIsTouched(true)
    setTouches(event.touches)
  }

  const onMouseUp = () => {
    setIsTouched(false)

    for (let i = 0; i < (touches?.length || 0); i++) {
      const touch = touches?.item(i)

      if (ref.current && touch) {
        const word = document.createElement('div')
        word.classList.add('floating-word')
        word.textContent = '+1'

        const rect = ref.current.getBoundingClientRect()

        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top

        word.style.left = x - 25 + 'px'
        word.style.top = y - 25 + 'px'

        ref.current.appendChild(word)

        if (myAddress && !isEmptyEnergy) {
          const balance = increasePointsBalance({
            client,
            address: myAddress,
            pointsByClick: 1,
          })

          decreaseEnergyValue({
            client,
            address: myAddress,
            energyValuePerClick: 1,
          })
          const storedTappedPoints = getTappedPointsStateStore()

          const newTappedPoints = storedTappedPoints?.tappedPoints
            ? parseInt(storedTappedPoints.tappedPoints) + 1
            : 1

          setTappedPointsStateToStore({
            tappedPoints: newTappedPoints.toString(),
          })

          const storedEnergy = getEnergyStateStore()

          const newEnergyValue = storedEnergy?.energyValue
            ? parseInt(storedEnergy.energyValue) - 1
            : FULL_ENERGY_VALUE - 1

          setEnergyStateToStore({
            energyValue: newEnergyValue.toString(),
            timestamp: dayjs().utc().unix().toString(),
          })
        }
        setTimeout(() => {
          ref.current?.removeChild(word)
        }, 3000)
      }
    }

    haptic?.result?.impactOccurred('medium')

    setTouches(undefined)
  }

  return (
    <>
      <div
        ref={ref}
        className={cx('relative pl-3', className)}
        onTouchStart={disableClicker ? undefined : onMouseDown}
        onTouchEnd={disableClicker ? undefined : onMouseUp}
      >
        <div
          className={cx(
            'absolute z-0 h-[175px] w-[175px] bg-[#5E81EA] blur-[102px]',
            'bottom-0 left-0 right-0 top-0 m-auto'
          )}
          style={{ transform: 'translate3d(0, 0, 0)' }}
        ></div>
        <CatClicker
          isPaused={!startAnimation || disableClicker}
          style={{
            filter: disableClicker ? 'brightness(0.7) grayscale(0.8)' : '',
          }}
        />
      </div>
    </>
  )
}

export default PointsClicker
