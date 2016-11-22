const bluebird = require('bluebird');

const units = require('./units');

const storageClassPricing = {
  STANDARD: 1,
  REDUCED_REDUNDANCY: 2,
  GLACIER: 3
}

const pricingPerRegionPerGigabyte = {
  'us-east-1': {
    STANDARD: 0.03,
    REDUCED_REDUNDANCY: 0.024,
    GLACIER: 0.007
  },
  'us-east-2': {
    STANDARD: 0.03,
    REDUCED_REDUNDANCY: 0.024,
    GLACIER: 0.007
  },
  'us-west-1': {
    STANDARD: 0.033,
    REDUCED_REDUNDANCY: 0.0264,
    GLACIER: 0.011
  },
  'us-west-2': {
    STANDARD: 0.03,
    REDUCED_REDUNDANCY: 0.0240,
    GLACIER: 0.007
  },
  'ap-south-1': {
    STANDARD: 0.03,
    REDUCED_REDUNDANCY: 0.024,
    GLACIER: 0.01
  },
  'ap-northeast-2': {
    STANDARD: 0.0314,
    REDUCED_REDUNDANCY: 0.0251,
    GLACIER: 0.0108
  },
  'ap-southeast-1': {
    STANDARD: 0.03,
    REDUCED_REDUNDANCY: 0.024,
    GLACIER: 0
  },
  'ap-southeast-2': {
    STANDARD: 0.033,
    REDUCED_REDUNDANCY: 0.0264,
    GLACIER: 0.012
  },
  'ap-northeast-1': {
    STANDARD: 0.033,
    REDUCED_REDUNDANCY: 0.0264,
    GLACIER: 0.0114
  },
  'eu-central-1': {
    STANDARD: 0.0324,
    REDUCED_REDUNDANCY: 0.026,
    GLACIER: 0.0120
  },
  'eu-west-1': {
    STANDARD: 0.03,
    REDUCED_REDUNDANCY: 0.024,
    GLACIER: 0.007
  },
  'sa-east-1': {
    STANDARD: 0.0408,
    REDUCED_REDUNDANCY: 0.0326,
    GLACIER: 0
  }
}

function getEstimatedMonthlyCost(sizeInBytes, storageClass, region) {
  const sizeInGb = units.convertBytesToUnit(sizeInBytes, 'GB');
  if (pricingPerRegionPerGigabyte[region] && pricingPerRegionPerGigabyte[region][storageClass]) {
    return sizeInGb * pricingPerRegionPerGigabyte[region][storageClass];
  }
  return 0;
}

function getPaginatedBucketFileInfo(s3, bucketName, region, accumulator, continuationToken) {
  function bucketObjectReducer(accumulator, object, index, length) {
    if (!accumulator.lastModified || object.LastModified < accumulator.lastModified) {
      accumulator.lastModified = object.LastModified;
    }
    accumulator.storageTypeMap[object.StorageClass] = true;
    accumulator.sizeInBytes += object.Size;
    accumulator.estimatedPrice += getEstimatedMonthlyCost(object.Size, object.StorageClass, region);
    return accumulator;
  }

  if (!accumulator) accumulator = { sizeInBytes: 0, storageTypeMap: {}, fileCount: 0, estimatedPrice: 0 };

  return s3
    .listObjectsV2({ Bucket: bucketName, ContinuationToken: continuationToken })
    .promise()
    .then(listObjectsResponse => {
      return bluebird
        .reduce(listObjectsResponse.Contents, bucketObjectReducer, accumulator)
        .then(paginatedBucketFileInfo => {
          paginatedBucketFileInfo.fileCount += listObjectsResponse.Contents.length;
          if (listObjectsResponse.IsTruncated) {
            return getPaginatedBucketFileInfo(s3, bucketName, region, paginatedBucketFileInfo, listObjectsResponse.NextContinuationToken);
          }
          return paginatedBucketFileInfo;
        })
    })
}

function getBucketInfo(s3, bucketName) {
  return s3.getBucketLocation({ Bucket: bucketName }).promise()
    .then(BucketLocationResponse => {
      const region = BucketLocationResponse.LocationConstraint || 'us-east-1';
      return getPaginatedBucketFileInfo(s3, bucketName, region)
        .then(bucketFileInfo => {
          return {
            totalSizeInBytes: bucketFileInfo.sizeInBytes,
            latestModification: bucketFileInfo.lastModified,
            fileCount: bucketFileInfo.fileCount,
            storageTypes: Object.keys(bucketFileInfo.storageTypeMap).sort(),
            region: region,
            estimatedPrice: bucketFileInfo.estimatedPrice.toFixed(2)
          };
        });
    });
}

module.exports = {
  getBucketInfo
}
