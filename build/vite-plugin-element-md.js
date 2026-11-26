import path from 'path'
import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'
import hljs from 'highlight.js'
import { compileTemplate } from 'vue/compiler-sfc'

function stripScript(content) {
  const result = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return result && result[1] ? result[1].trim() : ''
}

function stripTemplate(content) {
  content = content.trim()
  if (!content) {
    return content
  }
  return content.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '').trim()
}

function highlightCode(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
    } catch (_) {}
  }
  try {
    return hljs.highlightAuto(str).value
  } catch (_) {}
  return ''
}

function genInlineComponentText(template, script, filename) {
  const compiled = compileTemplate({
    source: `<div>${template}</div>`,
    filename,
    isProduction: false
  })

  if (compiled.errors && compiled.errors.length) {
    console.error(`[vite-plugin-element-md] Error compiling template in ${filename}:`, compiled.errors)
  }

  let demoScript = script.trim()
  if (demoScript) {
    demoScript = demoScript.replace(/export\s+default/, 'const democomponentExport =')
  } else {
    demoScript = 'const democomponentExport = {}'
  }

  return `(function() {
    ${compiled.code}
    ${demoScript}
    return {
      render,
      staticRenderFns,
      ...democomponentExport
    }
  })()`
}

function createMarkdownParser(slug) {
  const md = new MarkdownIt({
    html: true,
    highlight(str, lang) {
      const normalizedLang = (lang || '').toLowerCase()
      const highlighted = highlightCode(str, normalizedLang)
      if (highlighted) {
        return `<pre v-pre><code class="hljs language-${normalizedLang || 'plaintext'}">${highlighted}</code></pre>`
      }
      return `<pre v-pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
    }
  })

  md.use(mdContainer, 'demo', {
    validate(params) {
      return params.trim().match(/^demo\s*(.*)$/)
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
      if (tokens[idx].nesting === 1) {
        const description = m && m.length > 1 ? m[1] : ''
        const content = tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : ''
        return `<demo-block slug="${slug}">
        ${description ? `<div>${md.render(description)}</div>` : ''}
        <!--element-demo: ${content}:element-demo-->
        `
      }
      return '</demo-block>'
    }
  })

  md.use(mdContainer, 'tip', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div class="tip">\n'
      }
      return '</div>\n'
    }
  })

  md.use(mdContainer, 'warning', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div class="warning">\n'
      }
      return '</div>\n'
    }
  })

  const defaultFence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const prevToken = tokens[idx - 1]
    const isInDemoContainer =
      prevToken && prevToken.nesting === 1 && prevToken.info.trim().match(/^demo\s*(.*)$/)
    if (isInDemoContainer) {
      const lang = (token.info || 'html').trim().toLowerCase()
      const highlighted = highlightCode(token.content, lang === 'html' ? 'xml' : lang) || md.utils.escapeHtml(token.content)
      return `<template slot="highlight"><pre v-pre><code class="hljs language-${lang}">${highlighted}</code></pre></template>`
    }
    return defaultFence(tokens, idx, options, env, self)
  }

  return md
}

export function transformMarkdownToVueSfc(source, id) {
  const slug = path.basename(id, '.md')
  const md = createMarkdownParser(slug)
  const content = md.render(source)

  const startTag = '<!--element-demo:'
  const startTagLen = startTag.length
  const endTag = ':element-demo-->'
  const endTagLen = endTag.length

  let componentsString = ''
  let demoId = 0
  const output = []
  let start = 0

  let commentStart = content.indexOf(startTag)
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen)
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart))

    const commentContent = content.slice(commentStart + startTagLen, commentEnd)
    const html = stripTemplate(commentContent)
    const script = stripScript(commentContent)
    const demoComponentContent = genInlineComponentText(html, script, `${id}#demo${demoId}`)
    const demoComponentName = `element-demo${demoId}`
    output.push(`<template slot="source"><${demoComponentName} /></template>`)
    componentsString += `${JSON.stringify(demoComponentName)}: ${demoComponentContent},\n`

    demoId++
    start = commentEnd + endTagLen
    commentStart = content.indexOf(startTag, start)
    commentEnd = content.indexOf(endTag, commentStart + startTagLen)
  }

  let pageScript = ''
  if (componentsString) {
    pageScript = `<script>
export default {
  name: 'element-doc-${slug}',
  components: {
    ${componentsString}
  }
}
</script>`
  } else if (content.trimStart().startsWith('<script>')) {
    const scriptStart = content.indexOf('<script>')
    const scriptEnd = content.indexOf('</script>') + '</script>'.length
    pageScript = content.slice(scriptStart, scriptEnd)
    start = scriptEnd
  }

  output.push(content.slice(start))

  return `<template>
  <section class="content element-doc">
    ${output.join('')}
  </section>
</template>
${pageScript}
`
}

export default function elementMdPlugin() {
  return {
    name: 'vite-plugin-element-md',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null
      if (!id.includes('element-docs')) return null
      return {
        code: transformMarkdownToVueSfc(code, id),
        map: null
      }
    }
  }
}
