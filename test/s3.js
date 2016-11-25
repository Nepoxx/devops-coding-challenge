const chai = require('chai');
const bluebird = require('bluebird');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const s3 = require('../utils/s3');

// utility function
function check(done, func) {
  try {
    func();
    done();
  } catch (err) {
    done(err);
  }
}

describe('s3', () => {
  describe('#getBucketInfo()', () => {
    it('should return a promise failure if s3.getBucketLocation() fails', (done) => {
      const fakeError = new Error('Some error');
      const s3stub = {
        getBucketLocation: () => ({ promise: () => bluebird.reject(fakeError) })
      }
      s3.getBucketInfo(s3stub, '')
        .then(() => {
          done(new Error('expect promise to be rejected'));
        })
        .catch(err => {
          check(done, () => {
            expect(err).to.equal(fakeError);
          })
        })
    });
  });
});
