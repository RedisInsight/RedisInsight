import replaceSpaces from '../replaceSpaces'

describe('replaceSpaces test', () => {
  it('replaceSpaces should return text with replaced spaces', () => {
    const text1 = '10'
    const text2 = ' trala la '
    const text3 = 'tr    la    lo lu'
    const text4 = 'tralalala'
    const text5 = '       1233 123123  tral lalal '

    const expectedResponse1 = text1.replace(/\s\s/g, '\u00a0\u00a0')
    const expectedResponse2 = text2.replace(/\s\s/g, '\u00a0\u00a0')
    const expectedResponse3 = text3.replace(/\s\s/g, '\u00a0\u00a0')
    const expectedResponse4 = text4.replace(/\s\s/g, '\u00a0\u00a0')
    const expectedResponse5 = text5.replace(/\s\s/g, '\u00a0\u00a0')

    expect(replaceSpaces(text1)).toEqual(expectedResponse1)
    expect(replaceSpaces(text2)).toEqual(expectedResponse2)
    expect(replaceSpaces(text3)).toEqual(expectedResponse3)
    expect(replaceSpaces(text4)).toEqual(expectedResponse4)
    expect(replaceSpaces(text5)).toEqual(expectedResponse5)
  })
})
