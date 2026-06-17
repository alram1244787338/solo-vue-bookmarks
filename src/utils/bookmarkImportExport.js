export function parseBookmarkHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const bookmarks = []

  function parseDl(dlElement, folderPath = []) {
    const children = dlElement.children
    let i = 0
    while (i < children.length) {
      const child = children[i]
      if (child.tagName === 'DT') {
        const dtChildren = Array.from(child.children)

        const h3El = dtChildren.find(el => el.tagName === 'H3')
        const aEl = dtChildren.find(el => el.tagName === 'A')
        const dlEl = dtChildren.find(el => el.tagName === 'DL')

        if (aEl) {
          const tagsAttr = aEl.getAttribute('TAGS') || ''
          const tags = tagsAttr ? tagsAttr.split(',').map(t => t.trim()).filter(Boolean) : []

          let description = ''
          let nextSibling = children[i + 1]
          if (nextSibling && nextSibling.tagName === 'DD') {
            description = nextSibling.textContent.trim()
            i++
          } else {
            const ddInDt = dtChildren.find(el => el.tagName === 'DD')
            if (ddInDt) {
              description = ddInDt.textContent.trim()
            }
          }

          bookmarks.push({
            title: aEl.textContent || aEl.getAttribute('HREF'),
            url: aEl.getAttribute('HREF'),
            description,
            tags,
            folderPath: [...folderPath]
          })
        } else if (h3El && dlEl) {
          const folderName = h3El.textContent
          parseDl(dlEl, [...folderPath, folderName])
        } else if (h3El) {
          let nextIdx = i + 1
          while (nextIdx < children.length) {
            if (children[nextIdx].tagName === 'DL') {
              const folderName = h3El.textContent
              parseDl(children[nextIdx], [...folderPath, folderName])
              i = nextIdx
              break
            }
            if (children[nextIdx].tagName === 'DT') {
              break
            }
            nextIdx++
          }
        }
      }
      i++
    }
  }

  const firstDl = doc.querySelector('DL')
  if (firstDl) {
    parseDl(firstDl, [])
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
