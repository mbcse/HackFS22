let accountConnected
let isConnected = false
let web3

function setSelectedAccount (account) {
  accountConnected = account
}

function setIsConnected (val) {
  isConnected = val
}

function setWeb3 (web3provider) {
  web3 = web3provider
}

async function switchChain () {
  try {
    alert('Please Connect to RinkeBy Testnet to continue')
    await window.ethereum.request({
		  method: 'wallet_switchEthereumChain',
		  params: [{ chainId: '0x4' }]
    })
	  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
		  try {
        await window.ethereum.request({
			  method: 'wallet_addEthereumChain',
			  params: [
            {
				  chainId: '0x4',
				  chainName: 'Rinkeby Test Network',
				  rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'] /* ... */
            }
			  ]
        })
		  } catch (addError) {
        alert('Please connect to rinkeyby testnet to continue')
		  }
    }
    // handle other "switch" errors
	  }
}

async function connectWallet () {
  const provider = window.ethereum

  if (typeof provider !== 'undefined') {
    await provider
      .request({ method: 'eth_requestAccounts' })
      .then((accounts) => {
        setSelectedAccount(accounts[0])
        setIsConnected(true)
        console.log(`Selected account is ${accounts[0]}`)
      })
      .catch((err) => {
        console.log(err)
      })

    window.ethereum.on('connect', function (accounts) {
      setSelectedAccount(accounts[0])
      console.log(`Selected account is ${accounts[0]}`)
    })

    window.ethereum.on('accountsChanged', function (accounts) {
      setSelectedAccount(accounts[0])
      console.log(`Selected account changed to ${accounts[0]}`)
    })

    window.ethereum.on('disconnect', function (err) {
      setSelectedAccount(null)
      setIsConnected(true)
    })

    window.ethereum.on('chainChanged', function (chainId) {
      console.log(`Chain changed to ${chainId}`)
      if (chainId != '0x4') {
        switchChain()
      }
    })

    const web3 = new Web3(provider)
    setWeb3(web3)
    const networkId = await web3.eth.net.getId()

    console.log(`Network ID is ${networkId}`)

    if (networkId !== 4) {
      switchChain()
    }

    return web3
  } else {
    throw new Error('No Wallet Provider Detected')
  }
}

async function getAndVerifySignature (email) {
  let requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'same-origin',
    redirect: 'follow'
  }

  const signDataresponse = await fetch('/user/auth/signingdata', requestOptions)
  let resData = await signDataresponse.json()
  console.log(resData)
  const signature = await web3.eth.personal.sign(resData.data.signingData, accountConnected)
  console.log(signature)

  requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signer: accountConnected, email, signature }),
    credentials: 'same-origin',
    redirect: 'follow'
  }
  const verifySignatureResponse = await fetch('/user/auth/cryptologin', requestOptions)
  resData = await verifySignatureResponse.json()
  console.log(resData)
  if (resData.data.result) {
    window.location.href = '/user/dashboard'
  } else {
    // eslint-disable-next-line no-undef
    showErrorToast('Invalid Signature')
  }
}

document.getElementById('connect-wallet-button').addEventListener('click', async (e) => {
  e.preventDefault()
  const emailAddress = document.getElementById('user_email').value
  console.log('Connecting Wallet')
  await connectWallet()
  console.log('Verifying Signature')
  await getAndVerifySignature(emailAddress)
})
