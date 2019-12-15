module.exports = {
  name: 'jsonStream',
  desc: 'parses streams of JSON objects (not arrays!) and drops all characters in between.',
  func: ({verbose}) => (data, linesOffset) => {
    const tokens = []
    const lines  = []
    const err    = []
  
    let text     = data
    let len      = text.length
  
    let at       = -1
    let lastLine = linesOffset
    
    let escaped  = false
    let string   = false
    let inObj    = false
  
    let obj      = false
    let brackets = 0
  
    let done     = false
    let from     = 0
    let ch
    
    do {
      at++
      ch = text.charAt(at)
  
      if (verbose && ch === '\n') lastLine++
  
      if (string) {
        if (escaped) escaped = false
        else {
          if (ch === '"') string = false
          else if (ch === '\\') escaped = true
        }
      } else {
        if (ch === '"') string = true
        else if (ch === '{') {
          if (brackets === 0) from = at
          inObj = true
          brackets++
        } else if (inObj && ch === '}') {
          brackets--
          if (brackets === 0) {
            inObj = false
            obj = true
          }
        }
      }
  
      if (at === len) done = true
  
      if (obj) {
        obj = false
        const token = text.slice(from, at + 1)
        tokens.push(token)
        if (verbose) lines.push(lastLine)
  
        text = text.slice(at + 1, len)
        len  = text.length
        at   = -1
      }
    } while (!done)
  
    return {err, tokens, lines, lastLine, rest: text}
  }
}