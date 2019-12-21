const {anything, array, assert, constant, integer, unicodeJson, unicodeJsonObject, property} = require('fast-check')
const {func: parser} = require('./single')

test('parses each json element individually, even if it is formatted over several lines', () => {
  const err         = []
  const argv        = anything().chain(verbose => constant({verbose}))
  const lines       = anything()
  const jsonsTokens = integer().chain(spaces => 
    array(unicodeJsonObject()).chain(jsons => 
      constant({
        jsons,
        tokens: jsons.map(json => JSON.stringify(json, null, spaces))
      })  
    )
  )

  assert(
    property(argv, lines, jsonsTokens, (argv, lines, {jsons, tokens}) =>
      expect(
        parser(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

test('parsing text that is not json throws one of a list of errors, not using lines since verbose is 0', () => {
  const argv                     = {verbose: 0}
  const lines                    = anything()
  const potentiallyInvalidTokens = array(unicodeJson().map(str => str.slice(1)))
  const msgs                     = [
    'SyntaxError: Unexpected end of',
    'SyntaxError: Unexpected token ',
    'SyntaxError: Unexpected number'
  ]

  assert(
    property(lines, potentiallyInvalidTokens, (lines, tokens) =>
      parser(argv)(tokens, lines)
      .err
      .map(e => e.slice(0, 30))
      .reduce(
        (bool, err) => bool && msgs.indexOf(err) > -1,
        true
      )
    )
  )
})