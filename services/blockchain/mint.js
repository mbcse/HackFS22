import { web3, createTx } from '../../utilities/web3Utils'
import config from '../../config'
import logger from '../../utilities/logger.js'
import Transaction from '../../database/transaction'

export const mintTicket = async (receiverName, receiver, passId, IPFSHash, ticketPrice, ticketBurnValue, txId) => {
  // const creatorAddress = (await getAdminWallet()).address;
  const eventOnChainContract = new web3.eth.Contract(config.CONTRACTS.NFT.ABI, config.CONTRACTS.NFT.ADDRESS)
  const txObject = {}

  txObject.data = eventOnChainContract.methods
    .mintTicket(
      receiverName,
      receiver,
      passId,
      IPFSHash,
      ticketPrice,
      ticketBurnValue
    )
    .encodeABI()

  txObject.gasLimit = web3.utils.toHex(250000)
  txObject.to = eventOnChainContract.options.address
  txObject.value = '0x'

  const txSerialized = await createTx(txObject)
  const tx = await Transaction.findById(txId)

  web3.eth
    .sendSignedTransaction(txSerialized)
    .on('transactionHash', async (txHash) => {
      logger.info('Transaction Sent, TxHash: ' + txHash)
      await tx.saveTransactionHash(txHash)
    })
    .on('receipt', async (rc) => {
      logger.info(`Transaction Status: ${(rc.status ? 'Successful' : 'Failed')}`)
      try {
        if (rc.status) await tx.setSuccess()
        else await tx.setFailed()
      } catch (err) {
        logger.error(err)
      }
    })
    .on('error', async (web3err) => {
      logger.info('Transaction Status: ' + 'Failed')
      logger.error('Web3 Error, Transaction Reverted' + web3err.message)
      try {
        await tx.setFailed()
      } catch (err) {
        logger.error(err)
      }
    })
}
