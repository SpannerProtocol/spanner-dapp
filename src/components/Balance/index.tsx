import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { ItalicText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatToUnit } from 'utils/formatUnit'

interface BalanceProps {
  token: string
}

export default function Balance({ token }: BalanceProps) {
  const { t } = useTranslation()
  const balance = useSubscribeBalance(token)
  const { chainDecimals } = useSubstrate()
  return (
    <>
      <SpacedSection style={{ margin: '0' }}>
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ItalicText width="fit-content">{t(`Available Balance`)}</ItalicText>
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(
                `Your balance. Make sure you have enough to cover the transaction and enough BOLT for the transaction fee.`
              )}
            />
          </div>
          <ItalicText width="fit-content">{`${formatToUnit(balance, chainDecimals, 2)} ${token}`}</ItalicText>
        </RowBetween>
      </SpacedSection>
    </>
  )
}
