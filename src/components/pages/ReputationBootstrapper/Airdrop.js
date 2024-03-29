import React from 'react'
import styled from 'styled-components'
import Divider from 'components/common/Divider'
import TimelineProgress from 'components/common/TimelineProgress'
import logo from 'assets/svgs/ethfinex-logo.svg'
import * as contractService from 'core/services/contractService'
import * as providerService from 'core/services/providerService'
import * as erc20Service from 'core/services/erc20Service'
import * as necRepService from 'core/services/necRepAllocationService'
import * as numberLib from 'core/libs/lib-number-helpers'

const AirdropWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border);
  border-top: none;
  border-bottom: none;
  width: 450px;
  padding-top: 20px;
`

const Logo = styled.img`
  width: 50%;
`

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-tems: center;
  margin: 0px 0px 0px 0px;
  width: 80%
`

const InfoTitle = styled.div`
  color: var(--inactive-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  letter-spacing: 1px;
  width: 100%
`

const Info = styled(InfoTitle)`
  color: var(--white-text);
  text-align: right;
`

const Button = styled.div`
  background: var(--action-button);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  padding: 10px 0px;
  width: 80%;
  margin-bottom: 20px;
`

const InfoLine = ({ title, info }) => (
  <InfoWrapper>
    <InfoTitle>{title}</InfoTitle>
    <Info>{info}</Info>
  </InfoWrapper>
)

const Airdrop = () => {
  const [dropPercentage, setDropPercentage] = React.useState(0)
  const [dropTimer, setDropTimer] = React.useState('...')
  const [necBalance, setNecBalance] = React.useState('...')
  const [necBalanceDisplay, setNecBalanceDisplay] = React.useState('...')
  const [repBalance, setRepBalance] = React.useState('...')
  const [dropBlock, setDropBlock] = React.useState('...')
  const [currentBlock, setCurrentBlock] = React.useState('...')

  React.useEffect(() => {
    const fetch = async () => {
      const provider = await providerService.getProvider()
      const defaultAccount = await providerService.getDefaultAccount(provider)
      const necTokenInstance = await contractService.getNectarTokenAddress()
      const necRepAllocationInstance = await contractService.getNectarRepAllocationAddress()

      // NEC Balance
      const currUserBalance = await erc20Service.balanceOf(provider, necTokenInstance, defaultAccount)
      setNecBalance(`${currUserBalance} NEC`)
      setNecBalanceDisplay(`${numberLib.toEther(currUserBalance)} NEC`)

      // REP Balance
      const currRepBalance = await necRepService.getSnapshotRep(provider, necRepAllocationInstance, defaultAccount)
      setRepBalance(`${currRepBalance} REP`)

      // Drop Blocknumber
      const currDropBlock = await necRepService.getSnapshotBlock(provider, necRepAllocationInstance)
      setDropBlock(currDropBlock)

      // Current Blocknumber
      const currLatestBlock = await necRepService.getCurrentBlock(provider)
      setCurrentBlock(currLatestBlock)

      // Calculate the number of days and hours the dropBlock
      // is from the current block
      const blockDiff = currDropBlock - currLatestBlock

      let seconds = blockDiff * 13
      if (seconds < 13) {
        seconds = 0
      }

      if (seconds === 0) {
        setDropPercentage(100)
        setDropTimer('Has Concluded')
      } else {
        let hours = (seconds / 60) / 60
        const days = Math.fround(hours / 24)
        hours -= days * 24
        hours = Math.fround(hours)
        setDropTimer(`In ${days} days, ${hours} hours`)

        // Using 30 days a duration length
        const maxDays = 30
        setDropPercentage(100 * (1 - (seconds / (maxDays * 24 * 60 * 60))))
      }
    }
    fetch()
  }, [])

  return (
    <AirdropWrapper>
      <TimelineProgress
        value={dropPercentage}
        icon={<Logo src={logo} alt="ethfinex" />}
        title="NectarDAO Reputation Airdrop"
        subtitle={dropTimer}
        width="50px"
        height="50px"
      />
      <Divider width="80%" margin="20px 0px 20px 0px" />
      <InfoLine title="Nectar Balance" info={necBalanceDisplay} />
      <InfoLine title="Receive Voting Power" info={repBalance} />
      <Divider width="80%" margin="20px 0px 20px 0px" />
      <InfoLine title="Airdrop Blocknumber" info={dropBlock} />
      <InfoLine title="Current Blocknumber" info={currentBlock} />
      <Divider width="80%" margin="20px 0px 20px 0px" />
      <Button>Buy NEC</Button>
    </AirdropWrapper>
  )
}

export default Airdrop
