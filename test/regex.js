const expect = require('chai').expect;
const regexUtil = require('../utils/regex');

describe('Units', () => {
  describe('#convertBytesToUnit()', () => {
    it('should convert a user input string to a fuzzy literal regex', () => {
      const input = 'my string';
      const output = regexUtil.convertStringToRegex(input);
      expect(output).to.be.a('RegExp');
      expect(output.test(input)).to.equal(true);
      expect(output.test(input + 'abcdef')).to.equal(true);
      expect(output.test('abcdef' + input)).to.equal(true);
      expect(output.test('abcdef' + input + 'abcdef')).to.equal(true);
      expect(output.test('this string does not match')).to.equal(false);
    });

    it('should convert a user input string to true regex and conserve flags', () => {
      const input = '/abc/i';
      const output = regexUtil.convertStringToRegex(input);
      expect(output.test('aBC')).to.equal(true);
    });
  })
})