/*
global muxbots
*/

muxbots.onFeedPull((callback) => {
  handleOnFeedPull(callback)
})

const pageURL = 'https://nationaltoday.com/what-is-today/'

const handleOnFeedPull = async (callback) => {
  if (!shouldFetch()) {
    muxbots.newResponse()
      .addNoResultsMessage('No more for today, come back tomorrow!')
      .send(callback)
    return
  }

  try {
    let pageContent = await fetchPage()
    let dayDescription = parsePage(pageContent)
    muxbots.newResponse()
      .addMessage(dayDescription)
      .addWebpageSmall(muxbots.newWebpage()
        .setURL(pageURL)
        .setTitle(`More information about Today`)
        .setImage('https://mk0nationaltodayijln.kinstacdn.com/wp-content/uploads/2017/04/apple-touch-icon-152x152-1.png'))
      .send(callback)

    const currentDate = new Date()
    muxbots.localStorage.setItem('lastFetchDate', currentDate.toDateString())
  } catch (error) {
    console.log(error)
    muxbots.newResponse()
      .addNoResultsMessage('An issue occurred while fetching web page')
      .send(callback)
  }
}

const shouldFetch = () => {
  const lastFetchDate = muxbots.localStorage.getItem('lastFetchDate')
  if (lastFetchDate === undefined) {
    return true
  }
  const currentDate = new Date()
  const currentDateWithSign = currentDate.toDateString()
  return (currentDateWithSign !== lastFetchDate)
}

const fetchPage = () => {
  return new Promise((resolve, reject) => {
    muxbots.http.get(pageURL, (response) => {
      if (!response.data) {
        reject(response.error)
      }
      resolve(response.data)
    })
  })
}

const parsePage = (pageContent) => {
  const currentDate = new Date()
  const monthStringMap = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  }
  let monthString = monthStringMap[currentDate.getMonth()]
  let dateString = `${monthString} ${currentDate.getDate()}`
  const pattern = `<h4>(.*) &#8211; ${dateString}</h4>`
  const regEx = new RegExp(pattern)
  const dayDescription = (regEx.exec(pageContent))[1]
  return `${dateString} is ${dayDescription}`
}
