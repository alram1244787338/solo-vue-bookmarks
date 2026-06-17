export function parseBookmarkHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const bookmarks = []

  function parseDl(dlElement, folderPath = []) {
    const children = Array.from(dlElement.children)
    let i = 0
    while (i < children.length) {
      const node = children[i]

      if (node.tagName === 'DT') {
        const h3 = findDirectChild(node, 'H3')
        const a = findDirectChild(node, 'A')

        if (a) {
          let description = ''
          if (i + 1 < children.length && children[i + 1].tagName === 'DD') {
            description = children[i + 1].textContent.trim()
            i++
          }

          const tagsAttr = a.getAttribute('TAGS') || ''
          const tags = tagsAttr ? tagsAttr.split(',').map(t => t.trim()).filter(Boolean) : []

          bookmarks.push({
            title: a.textContent || a.getAttribute('HREF'),
            url: a.getAttribute('HREF'),
            description,
            tags,
            folderPath: [...folderPath]
          })
        } else if (h3) {
          const folderName = h3.textContent.trim()

          const dlInside = findDirectChild(node, 'DL')
          if (dlInside) {
            parseDl(dlInside, [...folderPath, folderName])
          } else if (i + 1 < children.length && children[i + 1].tagName === 'DL') {
            parseDl(children[i + 1], [...folderPath, folderName])
            i++
          }
        }
      }

      i++
    }
  }

  function findDirectChild(parent, tagName) {
    for (const child of parent.children) {
      if (child.tagName === tagName) return child
    }
    return null
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
