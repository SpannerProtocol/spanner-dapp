import { withStyles } from '@material-ui/core'
import Timeline from '@material-ui/lab/Timeline'
import TimelineConnector from '@material-ui/lab/TimelineConnector'
import TimelineContent from '@material-ui/lab/TimelineContent'
import TimelineDot from '@material-ui/lab/TimelineDot'
import TimelineItem from '@material-ui/lab/TimelineItem'
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent'
import TimelineSeparator from '@material-ui/lab/TimelineSeparator'
import { Header4, HeavyText, SText } from 'components/Text'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import useTheme from 'utils/useTheme'
import LargePopover, { PopoverProps } from '../Popover/LargePopOver'
import { useTranslation } from 'react-i18next'

const TooltipContainer = styled.div`
  width: 228px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  mouseOver: JSX.Element
}

export function TimelineToolTip({ mouseOver, ...rest }: TooltipProps) {
  return <LargePopover content={<TooltipContainer>{mouseOver}</TooltipContainer>} {...rest} />
}

export function TimelineMouseOver({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TimelineToolTip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </TimelineToolTip>
  )
}

export interface ItemSimple {
  time: string
  label: string
  mouseOver?: JSX.Element
}

export interface ItemWithOpposite {
  leftLabel: string
  rightLabel: string
  mouseOver?: JSX.Element
}

function Separator({ isLast }: { isLast?: boolean }) {
  const theme = useTheme()
  if (isLast) {
    return (
      <TimelineSeparator>
        <TimelineDot style={{ padding: '0.15rem', backgroundColor: theme.primary1 }} />
      </TimelineSeparator>
    )
  }
  return (
    <TimelineSeparator>
      <TimelineDot style={{ padding: '0.15rem', backgroundColor: theme.primary1 }} />
      <TimelineConnector style={{ width: '1px' }} />
    </TimelineSeparator>
  )
}

const TimelineItemOneSide = withStyles({
  missingOppositeContent: {
    '&:before': {
      display: 'none',
    },
  },
})(TimelineItem)

export default function TimelineSimple({ items }: { items: ItemSimple[] }) {
  return (
    <>
      <Timeline>
        {items.map((item, index) => (
          <>
            {item.mouseOver ? (
              <TimelineMouseOver key={index} mouseOver={item.mouseOver}>
                <TimelineItemOneSide>
                  <Separator isLast={index === items.length - 1} />
                  <TimelineContent>
                    <Header4>{item.label}</Header4>
                    <SText>{item.time}</SText>
                  </TimelineContent>
                </TimelineItemOneSide>
              </TimelineMouseOver>
            ) : (
              <TimelineItemOneSide key={index}>
                <Separator isLast={index === items.length - 1} />
                <TimelineContent>
                  <Header4>{item.label}</Header4>
                  <SText>{item.time}</SText>
                </TimelineContent>
              </TimelineItemOneSide>
            )}
          </>
        ))}
      </Timeline>
    </>
  )
}

export function TimelineWithOpposite({ items }: { items: ItemWithOpposite[] }) {
  const { t } = useTranslation()
  return (
    <>
      <Timeline style={{ padding: '0' }}>
        {items.map((item, index) => (
          <div key={index}>
            {item.mouseOver ? (
              <TimelineMouseOver key={index} mouseOver={item.mouseOver}>
                <TimelineItem style={{ minHeight: '50px' }}>
                  <TimelineOppositeContent style={{ padding: '0.25rem 1rem 0 0' }}>
                    <SText width="100%" textAlign="right">
                      {item.leftLabel}
                    </SText>
                  </TimelineOppositeContent>
                  <Separator isLast={index === items.length - 1} />
                  <TimelineContent style={{ padding: '0.25rem 0 0 1rem' }}>
                    <HeavyText width="100%">{t(item.rightLabel)}</HeavyText>
                  </TimelineContent>
                </TimelineItem>
              </TimelineMouseOver>
            ) : (
              <TimelineItem key={index} style={{ minHeight: '50px' }}>
                <TimelineOppositeContent>
                  <SText>{item.leftLabel}</SText>
                </TimelineOppositeContent>
                <Separator isLast={index === items.length - 1} />
                <TimelineContent>
                  <Header4>{item.rightLabel}</Header4>
                </TimelineContent>
              </TimelineItem>
            )}
          </div>
        ))}
      </Timeline>
    </>
  )
}
