import { useState } from 'react'
import SectionWrapper from '../../utils/SectionWrapper'
import { sectionTitleStyles } from '../../utils/commonStyles'
import UserTypeDropdown from '../UserTypeDropdown'
import EarnCalcSection from './EarnCalcByStaker'
import EarnInfoByCretor from './EarnInfoByCreator'

export type UserType = 'staker' | 'creator'

const UsersEarnInfo = () => {
  const [userType, setUserType] = useState<UserType>('staker')

  return (
    <div className='relative z-[1] flex flex-col gap-4'>
      <div
        id='how-to-increase-my-rewards'
        className='absolute top-[-63px]'
      ></div>
      <span className={sectionTitleStyles}>
        How much can I earn as a{' '}
        <UserTypeDropdown value={userType} onChangeValue={setUserType} />
      </span>
      <SectionWrapper className='flex flex-col gap-4'>
        {userType === 'staker' ? <EarnCalcSection /> : <EarnInfoByCretor />}
      </SectionWrapper>
    </div>
  )
}

export default UsersEarnInfo
