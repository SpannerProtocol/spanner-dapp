import { ArrowForwardIos } from '@material-ui/icons'
import { CopyWrapper } from 'components/Copy/Copy'
import BuyAssetForm from 'components/Form/FormBuyAsset'
import { TravelCabinInfo } from 'interfaces/bulletTrain'
import React, { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { ThemeContext } from 'styled-components'
import { ReactComponent as Ticket } from '../../../assets/svg/ticket.svg'
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import { DetailCardSimple } from '../../../components/Card/DetailCard'
import Row, { RowBetween, RowFixed } from '../../../components/Row'
import { Header2, HeavyText, SText } from '../../../components/Text'
import { GridWrapper, Section, SpacedSection } from '../../../components/Wrapper'
import { DAPP_HOST } from '../../../constants'
import { useBlockManager } from '../../../hooks/useBlocks'
import { useSubTravelCabinInventory, useTravelCabins } from '../../../hooks/useQueryTravelCabins'
import { useSubstrate } from '../../../hooks/useSubstrate'
import useWallet, { useIsConnected } from '../../../hooks/useWallet'
import { useProjectManager } from '../../../state/project/hooks'
import cdDivide from '../../../utils/cdDivide'
import { blockToDays } from '../../../utils/formatBlocks'
import { formatToUnit } from '../../../utils/formatUnit'
import getApy from '../../../utils/getApy'
import { getCabinClassImage, getCabinOrder } from '../../../utils/getCabinClass'
import useTheme from '../../../utils/useTheme'
import { SoldToModal } from './SoldTo'

export function Cabins() {
  const { projectState } = useProjectManager()
  const { chainDecimals } = useSubstrate()
  const travelCabins = useTravelCabins(projectState.selectedProject?.token)

  const sortedCabins = useMemo(
    () => travelCabins.sort((t1, t2) => getCabinOrder(t1[1].name.toString()) - getCabinOrder(t2[1].name.toString())),
    [travelCabins]
  )
  return (
    <GridWrapper columns="1">
      {sortedCabins.map((entry, index) => {
        const travelCabinInfo = entry[1]
        const token = travelCabinInfo.token_id.isToken
          ? travelCabinInfo.token_id.asToken.toString()
          : travelCabinInfo.token_id.asDexShare.toString()
        return <CabinCard key={index} travelCabinInfo={entry[1]} token={token} chainDecimals={chainDecimals} />
      })}
    </GridWrapper>
  )
}

export function CabinsSection() {
  const { t } = useTranslation()
  return (
    <>
      <Header2 padding="1rem 0">{t('Buy a Cabin')}</Header2>
      <Cabins />
    </>
  )
}

export const CabinCardGrid = styled.div`
  display: grid;
  grid-template-areas: 'state info apy bonus';
  background: transparent;
  grid-template-columns: minmax(40px, 50px) 3fr 1fr 1fr;
  grid-column-gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  justify-content: flex-start;
  text-align: left;
  margin: 0;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-areas: 'state info apy bonus';
    background: transparent;
    grid-template-columns: minmax(40px, 50px) 3fr 1fr 1fr;
    grid-column-gap: 0.25rem;
    text-align: left;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    width: 100%;
  `};
`

interface TravelCabinCard {
  travelCabinInfo: TravelCabinInfo
  chainDecimals: number
  token: string
}

function CabinCardDetails({ travelCabinInfo, chainDecimals, token }: TravelCabinCard) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { expectedBlockTime } = useBlockManager()
  const wallet = useWallet()

  const inventoryCount = useSubTravelCabinInventory(travelCabinInfo.index)

  const [buyOpen, setBuyOpen] = useState<boolean>(false)
  const isConnected = useIsConnected()
  const travelCabinIndex = travelCabinInfo.index

  const [soldToModalOpen, setSoldToModalOpen] = useState<boolean>(false)

  return (
    <>
      <SoldToModal cabinIndex={travelCabinIndex} isOpen={soldToModalOpen} onDismiss={() => setSoldToModalOpen(false)} />
      <BuyAssetForm
        targetType={'TravelCabin'}
        buyType={'CreateDpo'}
        travelCabinInfo={travelCabinInfo}
        isOpen={buyOpen}
        setIsOpen={setBuyOpen}
      />
      <SpacedSection margin="0.5rem 4rem" mobileMargin="0.5rem 4rem">
        <RowBetween>
          <HeavyText fontSize={'12px'} mobileFontSize={'12px'}>
            {t(`Yield`)}
          </HeavyText>
          <SText fontSize={'12px'} mobileFontSize={'12px'} width={'fit-content'}>
            {formatToUnit(travelCabinInfo.yield_total.toBn(), chainDecimals)} {token}
          </SText>
        </RowBetween>
        <RowBetween>
          <HeavyText fontSize={'12px'} mobileFontSize={'12px'}>
            {t(`Bonus`)}
          </HeavyText>
          <SText fontSize={'12px'} mobileFontSize={'12px'} width={'fit-content'}>
            {formatToUnit(travelCabinInfo.bonus_total.toBn(), chainDecimals)} {token}
          </SText>
        </RowBetween>
        {expectedBlockTime && (
          <RowBetween>
            <HeavyText fontSize={'12px'} mobileFontSize={'12px'} width={'fit-content'}>
              {t(`Trip`)}
            </HeavyText>
            <SText fontSize={'12px'} mobileFontSize={'12px'} width={'fit-content'}>
              {' '}
              {blockToDays(travelCabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}
            </SText>
          </RowBetween>
        )}
        {inventoryCount && (
          <RowBetween>
            <HeavyText fontSize={'12px'} mobileFontSize={'12px'}>
              {t(`Available`)}
            </HeavyText>
            <SText fontSize={'12px'} mobileFontSize={'12px'} width={'fit-content'}>
              {`${inventoryCount[1].toNumber() - inventoryCount[0].toNumber()}/${inventoryCount[1].toNumber()}`}
            </SText>
          </RowBetween>
        )}
        <Section>
          <Row justifyContent="flex-end">
            <SText onClick={() => setSoldToModalOpen(true)} color={`${theme.primary1}`}>
              {t('Inventory')}
            </SText>
            <ArrowForwardIos style={{ color: `${theme.primary1}`, width: '12px', height: '12px' }} />
          </Row>
        </Section>
      </SpacedSection>
      <Row style={{ alignItems: 'stretch', justifyContent: 'space-around' }} marginTop={'1.5rem'}>
        {/* BuyAssets */}
        <ButtonPrimary
          mobileMinWidth="120px"
          maxHeight="31px"
          width="100%"
          margin="0 1rem"
          disabled={!isConnected}
          onClick={() => setBuyOpen(true)}
        >
          {t(`Buy with DPO`)}
        </ButtonPrimary>
        {/* Invite */}
        {wallet && wallet.address && (
          <CopyWrapper
            toCopy={`${DAPP_HOST}/#/projects/${travelCabinInfo.token_id.asToken.toString()}?asset=${'TravelCabin'}&ref=${
              wallet.address
            }&project=${travelCabinInfo.token_id.asToken.toString()}`}
            childrenIsIcon={true}
            width="fit-content"
          >
            <ButtonSecondary mobileMinWidth="120px" maxHeight="31px" width="100%" margin="0 1rem">
              {t(`Invite`)}
            </ButtonSecondary>
          </CopyWrapper>
        )}
      </Row>
    </>
  )
}

export function CabinCard({ travelCabinInfo, chainDecimals, token }: TravelCabinCard) {
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()

  const theme = useContext(ThemeContext)

  const bonusPercent = Math.floor(
    cdDivide(travelCabinInfo.bonus_total, travelCabinInfo.deposit_amount, chainDecimals) * 100
  )

  if (!travelCabinInfo) return <></>

  return (
    <>
      <DetailCardSimple
        smallDetails
        defaultShow={true}
        details={<CabinCardDetails travelCabinInfo={travelCabinInfo} token={token} chainDecimals={chainDecimals} />}
      >
        <CabinCardGrid id={travelCabinInfo.name.toString()}>
          <div style={{ maxWidth: '30px', width: '30px' }}>{getCabinClassImage(travelCabinInfo.name.toString())}</div>
          <div>
            <HeavyText fontSize={'18px'} mobileFontSize={'14px'}>
              {`${t(`TravelCabin`)} ${travelCabinInfo.name.toString()}`}
            </HeavyText>
            <Row style={{ justifyContent: 'flex-start', textAlign: 'left' }} padding={'0.5rem 0rem'}>
              <Ticket width="20px" height="20px" />
              <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0 0 0 0.5rem'} width={'fit-content'}>
                {formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals)} {token}
              </SText>
            </Row>
          </div>
          {expectedBlockTime && (
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText width="100%" textAlign="left" color={theme.text3} padding="0">
                {t(`APY`)}
              </HeavyText>
              <HeavyText width="100%" fontSize="18px" mobileFontSize="14px" colorIsPrimary textAlign="left" padding="0">
                {expectedBlockTime && (
                  <>
                    {`${getApy({
                      totalYield: travelCabinInfo.yield_total.toBn(),
                      totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                      chainDecimals: chainDecimals,
                      blockTime: expectedBlockTime,
                      maturity: travelCabinInfo.maturity,
                    })}%`}
                  </>
                )}
              </HeavyText>
            </div>
          )}
          <RowFixed>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText width="100%" textAlign="left" color={theme.text3} padding="0">
                {t(`Bonus`)}
              </HeavyText>
              <HeavyText width="100%" fontSize="18px" mobileFontSize="14px" colorIsPrimary textAlign="left" padding="0">
                {bonusPercent}%
              </HeavyText>
            </div>
          </RowFixed>
        </CabinCardGrid>
      </DetailCardSimple>
    </>
  )
}
