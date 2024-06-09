import { createQuery } from '@/subsocial-query'
import { gql } from 'graphql-request'
import {
  GetBalanceQuery,
  GetBalanceQueryVariables,
} from '../../generated-query'
import { datahubQueryRequest, getDayAndWeekTimestamp } from '../../utils'

export const FULL_ENERGY_VALUE = 100

const GET_BALANCE = gql`
  query GetBalance($address: String!) {
    socialProfileBalances(args: { where: { address: $address } }) {
      activeStakingPoints
    }
  }
`
async function getBalance(address: string): Promise<number> {
  const res = await datahubQueryRequest<
    GetBalanceQuery,
    GetBalanceQueryVariables
  >({
    document: GET_BALANCE,
    variables: { address },
  })

  return Number(res.socialProfileBalances?.activeStakingPoints ?? 0) || 0
}

export const getBalanceQuery = createQuery({
  key: 'getBalance',
  fetcher: getBalance,
  defaultConfigGenerator: (address) => ({
    enabled: !!address,
  }),
})

const GET_ENERGY_STATE = gql`
  query GetEnergyState($address: String!) {
    gamificationTappingEnergyState(args: { where: { address: $address } }) {
      energyValue
      timestamp
    }
  }
`

const getEnergyState = async (address: string) => {
  const res = await datahubQueryRequest<
    {
      gamificationTappingEnergyState: {
        energyValue: number
        timestamp: number
      }
    },
    { address: string }
  >({
    document: GET_ENERGY_STATE,
    variables: { address },
  })

  return {
    energyValue:
      res.gamificationTappingEnergyState?.energyValue || FULL_ENERGY_VALUE,
    timestamp: res.gamificationTappingEnergyState?.timestamp,
  }
}

export const getEnergyStateQuery = createQuery({
  key: 'getEnergyState',
  fetcher: getEnergyState,
  defaultConfigGenerator: (address) => ({
    enabled: !!address,
  }),
})

const GET_CLICKED_POINTS_BY_DAYS = gql`
  query GetClickedPointsByDayS($address: String!, $dates: [Int!]!) {
    gamificationTappingActivityStatsByDate(
      args: { where: { dates: $dates, address: $address } }
    ) {
      data {
        tapsCount
        date
      }
    }
  }
`
const getClickedPointsByDays = async (address: string) => {
  const { day } = getDayAndWeekTimestamp()

  const res = await datahubQueryRequest<
    {
      gamificationTappingActivityStatsByDate: {
        tapsCount: number
        date: string
      }
    },
    { address: string; dates: number[] }
  >({
    document: GET_CLICKED_POINTS_BY_DAYS,
    variables: { address, dates: [day] },
  })

  return {
    tapsCount: res.gamificationTappingActivityStatsByDate?.tapsCount || 0,
    date: res.gamificationTappingActivityStatsByDate?.date,
  }
}

export const getClickedPointsByDayQuery = createQuery({
  key: 'getClickedPointsByDay',
  fetcher: getClickedPointsByDays,
  defaultConfigGenerator: (address) => ({
    enabled: !!address,
  }),
})
