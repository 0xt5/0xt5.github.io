document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.copyEmailBtfBound === '1') return
  document.body.dataset.copyEmailBtfBound = '1'

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      try {
        const input = document.createElement('input')
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        return true
      } catch {
        return false
      }
    }
  }

  document.body.addEventListener('click', async event => {
    const link = event.target.closest('.copy-email-link-btf')
    if (!link) return
    event.preventDefault()
    const email = link.getAttribute('data-email') || ''
    if (!email) return
    const ok = await copyText(email)
    const text = ok ? '\u90ae\u7bb1\u5df2\u590d\u5236' : '\u590d\u5236\u5931\u8d25\uff0c\u8bf7\u624b\u52a8\u590d\u5236'
    if (window.btf && typeof btf.snackbarShow === 'function' && window.GLOBAL_CONFIG && GLOBAL_CONFIG.Snackbar !== undefined) {
      btf.snackbarShow(text)
    } else {
      alert(text)
    }
  })
})
