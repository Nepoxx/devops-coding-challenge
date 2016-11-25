const expect = require('chai').expect;
const units = require('../utils/units');

describe('Units', () => {
  describe('#convertBytesToUnit()', () => {
    it('should return same value when passing bytes', () => {
      const input = 12345;
      const expectedOutput = 12345;
      const output = units.convertBytesToUnit(input, 'byte');
      expect(output).to.equal(expectedOutput);
    });

    it('should convert bytes to kb', () => {
      const input = 1024;
      const expectedOutput = 1;
      const output = units.convertBytesToUnit(input, 'kb');
      expect(output).to.equal(expectedOutput);
    });

    it('should convert bytes to mb', () => {
      const input = 1024 * 1024;
      const expectedOutput = 1;
      const output = units.convertBytesToUnit(input, 'mb');
      expect(output).to.equal(expectedOutput);
    });

    it('should convert bytes to mb', () => {
      const input = 1024 * 1024;
      const expectedOutput = 1;
      const output = units.convertBytesToUnit(input, 'mb');
      expect(output).to.equal(expectedOutput);
    });

    it('should convert bytes to gb', () => {
      const input = 1024 * 1024 * 1024;
      const expectedOutput = 1;
      const output = units.convertBytesToUnit(input, 'gb');
      expect(output).to.equal(expectedOutput);
    });

    it('should convert bytes to tb', () => {
      const input = 1024 * 1024 * 1024 * 1024;
      const expectedOutput = 1;
      const output = units.convertBytesToUnit(input, 'tb');
      expect(output).to.equal(expectedOutput);
    });

    it('should convert bytes to tb', () => {
      const input = 1024 * 1024 * 1024 * 1024;
      const expectedOutput = 1;
      const output = units.convertBytesToUnit(input, 'tb');
      expect(output).to.equal(expectedOutput);
    });

    it('should throw an error on unsupported units', () => {
      const input = 0;
      expect(units.convertBytesToUnit.bind(units, input, 'coveo')).to.throw('Unsupported storage unit');
    });

    it('should be case insensitive (byte)', () => {
      const input = 12345;
      expect(units.convertBytesToUnit(input, 'byte')).to.equal(units.convertBytesToUnit(input, 'BYTE'));
    });

    it('should be case insensitive (kb)', () => {
      const input = 12345;
      expect(units.convertBytesToUnit(input, 'kb')).to.equal(units.convertBytesToUnit(input, 'KB'));
    });

    it('should be case insensitive (mb)', () => {
      const input = 123456789;
      expect(units.convertBytesToUnit(input, 'mb')).to.equal(units.convertBytesToUnit(input, 'MB'));
    });

    it('should be case insensitive (gb)', () => {
      const input = 123456789;
      expect(units.convertBytesToUnit(input, 'gb')).to.equal(units.convertBytesToUnit(input, 'GB'));
    });

    it('should be case insensitive (tb)', () => {
      const input = 123456789;
      expect(units.convertBytesToUnit(input, 'tb')).to.equal(units.convertBytesToUnit(input, 'TB'));
    });
  })
})