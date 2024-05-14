import { getPostQuery } from '@/services/api/query'
import { getPostRewardsQuery } from '@/services/datahub/content-staking/query'
import { formatBalance } from '@/utils/balance'
import { cx } from '@/utils/class-names'
import capitalize from 'lodash.capitalize'
import { ComponentProps } from 'react'
import { TbCoins } from 'react-icons/tb'
import PopOver from '../floating/PopOver'

export type PostRewardStatProps = ComponentProps<'div'> & { postId: string }

export default function PostRewardStat({
  postId,
  ...props
}: PostRewardStatProps) {
  const { data: reward } = getPostRewardsQuery.useQuery(postId)
  const { data: post } = getPostQuery.useQuery(postId)
  const isComment = post?.struct.isComment
  const entity = isComment ? 'comment' : 'post'

  const totalReward = formatBalance({
    value: reward?.reward ?? '',
    toPrecision: 2,
  })

  const { fromCommentSuperLikes, fromDirectSuperLikes, fromShareSuperLikes } =
    reward?.rewardsBySource || {}
  const directReward = formatBalance({
    value: fromDirectSuperLikes ?? '',
    toPrecision: 2,
  })
  const commentReward = formatBalance({
    value: fromCommentSuperLikes ?? '',
    toPrecision: 2,
  })
  const sharesReward = formatBalance({
    value: fromShareSuperLikes ?? '',
    toPrecision: 2,
  })

  if (!reward?.isNotZero) return null

  return (
    <div {...props} className={cx('text-text-muted', props.className)}>
      <div className='flex items-center gap-1.5'>
        <div className='relative flex items-center'>
          {convertToBigInt(reward.rewardDetail.draftReward) > 0 ? (
            <PopOver
              triggerOnHover
              panelSize='sm'
              trigger={
                <div className='flex items-center'>
                  <TbCoins />
                  <div className='absolute right-0 top-0 h-1 w-1 rounded-full bg-[#F8963A]' />
                </div>
              }
            >
              <span>
                {convertToBigInt(reward.rewardDetail.finalizedReward) > 0 && (
                  <>
                    {formatBalance({
                      value: reward.rewardDetail.finalizedReward,
                      toPrecision: 2,
                    })}{' '}
                    SUB earned +{' '}
                  </>
                )}
                {formatBalance({
                  value: reward.rewardDetail.draftReward,
                  toPrecision: 2,
                })}{' '}
                approx. today
              </span>
            </PopOver>
          ) : (
            <TbCoins />
          )}
        </div>
        <PopOver
          placement='top'
          yOffset={4}
          panelSize='sm'
          triggerOnHover
          trigger={<span>{totalReward} SUB</span>}
        >
          <div>
            <span>{capitalize(entity)} author rewards:</span>
            <ul className='[&>li]:flex [&>li]:items-center [&>li]:gap-1.5'>
              <li>
                <span className='h-1 w-1 rounded-full bg-text' />
                {directReward} from direct likes on this {entity}
              </li>
              {convertToBigInt(fromCommentSuperLikes ?? '0') > 0 &&
                entity === 'post' && (
                  <li>
                    <span className='h-1 w-1 rounded-full bg-text' />
                    {commentReward} from the likes on comments to this {entity}
                  </li>
                )}
              {BigInt(fromShareSuperLikes ?? '0') > 0 && (
                <li>
                  <span className='h-1 w-1 rounded-full bg-text' />
                  {sharesReward} from the likes on shared posts of this {entity}
                </li>
              )}
            </ul>
          </div>
        </PopOver>
      </div>
    </div>
  )
}

function convertToBigInt(value: string) {
  try {
    return BigInt(value)
  } catch (err) {
    console.error('Cannot convert to BigInt: ', value, err)
    return BigInt(0)
  }
}