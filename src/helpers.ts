function sleep(ms) {
  return new Promise(r => {
    setTimeout(() => {
      r(null)
    }, ms)
  })
}

export {
  sleep
}
