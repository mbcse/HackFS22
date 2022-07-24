/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
async function mintTicket (e) {
  e.preventDefault()
  const eventId = e.target.value
  console.log(e)
  console.log(eventId)

  const pay = await web3.eth.sendTransaction({ from: accountConnected, to: '0x8F52Ef5933925aa2e536c7c882A643ba4C0797b8', value: web3.utils.toWei('0.000001', 'ether') })
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  }
  //   const response = await fetch('/user/event', requestOptions)
  //   const responseData = response.json()
  await axios.post('/user/event/mint', JSON.stringify({ eventId }), requestOptions)
    .then((res) => {
      console.log(res)
      showSuccessToast(res.data.message)
    })
    .catch((err) => {
      if (err.response) {
        console.log(err.response)
        showErrorToast(err.response.data.message)
      }
    })
}

$('.mint-event-button').click(mintTicket)
