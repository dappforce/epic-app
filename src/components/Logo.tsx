import Epic from '@/assets/logo/epic.svg'
import { ComponentProps } from 'react'

export type LogoProps = ComponentProps<'p'>

export default function Logo({ ...props }: LogoProps) {
  return <Epic {...props} />
}
