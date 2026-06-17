export function parseBookmarkHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const bookmarks = []

  function parseDl(dlElement) {
    const children = dlElement.children
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.tagName === 'DT') {
        const dtChildren = child.children
        for (let j = 0; j < dtChildren.length; j++) {
          const dtChild = dtChildren[j]
          if (dtChild.tagName === 'A') {
            const tagsAttr = dtChild.getAttribute('TAGS') || ''
            const tags = tagsAttr ? tagsAttr.split(',').map(t => t.trim()).filter(Boolean) : []
            bookmarks.push({
              title: dtChild.textContent || dtChild.getAttribute('HREF'),
              url: dtChild.getAttribute('HREF'),
              tags
            })
          } else if (dtChild.tagName === 'H3') {
            // 文件夹标题，跳过，下一个 DL 是文件夹内容
          } else if (dtChild.tagName === 'DL') {
            parseDl(dtChild)
          }
        }
      }
    }
  }

  const dlElements = doc.querySelectorAll('DL')
  if (dlElements.length > 0) {
    parseDl(dlElements[0])
  }

  return bookmarks
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
