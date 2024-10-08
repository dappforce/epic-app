import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_MNEMONIC: z.string().default(''),
    TELEGRAM_BOT_TOKEN: z.string().default(''),

    USER_ID_SALT: z.string().default(''),

    CRUST_IPFS_AUTH: z.string().default(''),
    IPFS_PIN_URL: z.string().default('https://pin.crustcloud.io/psa'),
    IPFS_WRITE_URL: z.string().default('https://gw-seattle.crustcloud.io'),

    COVALENT_API_KEY: z.string().default(''),

    NOTIFICATIONS_URL: z.string().default(''),
    NOTIFICATIONS_TOKEN: z.string().default(''),

    REDIS_HOST: z.string().default(''),
    REDIS_PORT: z.string().default(''),
    REDIS_PASSWORD: z.string().default(''),

    DATAHUB_QUEUE_URL: z.string().default(''),
    DATAHUB_QUEUE_TOKEN: z.string().default(''),

    NEXTAUTH_URL: z.string().default(''),
    NEXTAUTH_SECRET: z.string().default(''),
    TWITTER_CLIENT_ID: z.string().default(''),
    TWITTER_CLIENT_SECRET: z.string().default(''),
    GOOGLE_CLIENT_ID: z.string().default(''),
    GOOGLE_CLIENT_SECRET: z.string().default(''),
    FRAMES_SECRET: z.string().default(''),
    NEYNAR_API_KEY: z.string().default(''),
    DAPP_SECRET_KEY: z.string().default(''),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().default(''),
    NEXT_PUBLIC_APP_ID: z.string().default(''),
    NEXT_PUBLIC_MAIN_SPACE_ID: z
      .string()
      .default('')
      .transform((val) => val.split(',').filter(Boolean)[0]),
    NEXT_PUBLIC_SPACE_IDS: z
      .string()
      .default('')
      .transform((val) => val.split(',').filter(Boolean)),
    NEXT_PUBLIC_MAIN_CHAT_ID: z.string().default(''),
    NEXT_PUBLIC_CONTEST_CHAT_ID: z.string().default(''),
    NEXT_PUBLIC_CONTEST_NAME: z.string().default(''),
    NEXT_PUBLIC_CONTEST_END_TIME: z.string().default('').transform(Number),
    NEXT_PUBLIC_TIME_CONSTRAINT: z.string().default('').transform(Number),
    NEXT_PUBLIC_CONTEST_RANGE_KEY: z.string().default(''),
    NEXT_PUBLIC_BASE_PATH: z.string().default(''),
    NEXT_PUBLIC_TELEGRAM_BOT_ID: z.string().default(''),
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().default(''),
    NEXT_PUBLIC_OFFCHAIN_POSTING_HUBS: z
      .string()
      .default('')
      .transform((val) => val.split(',').filter(Boolean)),
    NEXT_PUBLIC_PROPOSALS_HUB: z.string().default(''),
    NEXT_PUBLIC_TELEGRAM_NOTIFICATION_BOT: z.string().default(''),

    NEXT_PUBLIC_AMP_ID: z.string().default(''),
    NEXT_PUBLIC_GA_ID: z.string().default(''),

    NEXT_PUBLIC_SQUID_URL: z.string().default(''),

    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().default(''),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().default(''),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default(''),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().default(''),
    NEXT_PUBLIC_FIREBASE_MESSAGING_ID: z.string().default(''),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().default(''),

    NEXT_PUBLIC_NOTIFICATION_APP_ID: z.string().default(''),

    NEXT_PUBLIC_COMMUNITY_HUB_ID: z.string().default(''),
    NEXT_PUBLIC_SUBSTRATE_URL: z.string().default(''),
    NEXT_PUBLIC_SUBSTRATE_WSS: z.string().default(''),

    NEXT_PUBLIC_DATAHUB_QUERY_URL: z.string().default(''),
    NEXT_PUBLIC_DATAHUB_SUBSCRIPTION_URL: z.string().default(''),
    NEXT_PUBLIC_NEYNAR_CLIENT_ID: z.string().default(''),

    NEXT_PUBLIC_DAPP_PUBLIC_KEY: z.string().default(''),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_MAIN_SPACE_ID: process.env.NEXT_PUBLIC_SPACE_IDS,
    NEXT_PUBLIC_SPACE_IDS: process.env.NEXT_PUBLIC_SPACE_IDS,
    NEXT_PUBLIC_MAIN_CHAT_ID: process.env.NEXT_PUBLIC_MAIN_CHAT_ID,
    NEXT_PUBLIC_CONTEST_CHAT_ID: process.env.NEXT_PUBLIC_CONTEST_CHAT_ID,
    NEXT_PUBLIC_CONTEST_NAME: process.env.NEXT_PUBLIC_CONTEST_NAME,
    NEXT_PUBLIC_CONTEST_END_TIME: process.env.NEXT_PUBLIC_CONTEST_END_TIME,
    NEXT_PUBLIC_TIME_CONSTRAINT: process.env.NEXT_PUBLIC_TIME_CONSTRAINT,
    NEXT_PUBLIC_CONTEST_RANGE_KEY: process.env.NEXT_PUBLIC_CONTEST_RANGE_KEY,
    NEXT_PUBLIC_TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    NEXT_PUBLIC_OFFCHAIN_POSTING_HUBS:
      process.env.NEXT_PUBLIC_OFFCHAIN_POSTING_HUBS,
    NEXT_PUBLIC_TELEGRAM_NOTIFICATION_BOT:
      process.env.NEXT_PUBLIC_TELEGRAM_NOTIFICATION_BOT,

    NEXT_PUBLIC_AMP_ID: process.env.NEXT_PUBLIC_AMP_ID,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,

    NEXT_PUBLIC_SQUID_URL: process.env.NEXT_PUBLIC_SQUID_URL,

    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

    NEXT_PUBLIC_NOTIFICATION_APP_ID:
      process.env.NEXT_PUBLIC_NOTIFICATION_APP_ID,

    NEXT_PUBLIC_COMMUNITY_HUB_ID: process.env.NEXT_PUBLIC_COMMUNITY_HUB_ID,
    NEXT_PUBLIC_SUBSTRATE_URL: process.env.NEXT_PUBLIC_SUBSTRATE_URL,
    NEXT_PUBLIC_SUBSTRATE_WSS: process.env.NEXT_PUBLIC_SUBSTRATE_WSS,

    NEXT_PUBLIC_DATAHUB_QUERY_URL: process.env.NEXT_PUBLIC_DATAHUB_QUERY_URL,
    NEXT_PUBLIC_DATAHUB_SUBSCRIPTION_URL:
      process.env.NEXT_PUBLIC_DATAHUB_SUBSCRIPTION_URL,
    NEXT_PUBLIC_NEYNAR_CLIENT_ID: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID,
    NEXT_PUBLIC_PROPOSALS_HUB: process.env.NEXT_PUBLIC_PROPOSALS_HUB,
    NEXT_PUBLIC_DAPP_PUBLIC_KEY: process.env.NEXT_PUBLIC_DAPP_PUBLIC_KEY,
  },
})
