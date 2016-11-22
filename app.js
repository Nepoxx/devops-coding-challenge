const package = require('./package.json');

const program = require('commander');
const bluebird = require('bluebird');
const AWS = require('aws-sdk');
const table = require('table/dist/table');
const colors = require('colors');

// -- Argument/options parsing ------
program
  .version(package.version || '0.0.1')
  .option('-u, --unit <unit>', 'Use the specified storage size unit (byte, kB, MB, GB, TB)', /^(byte|kB|MB|GB|TB)$/i, 'byte')
  .option('-f, --filter <filter>', 'Filter the resulting list of buckets for which the name matches. Regex supported.')
  .option('-g, --group', 'Group buckets by region')
  .option('-a, --aws-access-key [accessKey]', 'AWS access key id. Takes precedence over AWS_ACCESS_KEY_ID')
  .option('-s, --aws-secret [secretAccessKey]', 'AWS secret access key id. Takes precedence over AWS_SECRET_ACCESS_KEY (not recommended)')
  .parse(process.argv);

// -- Debug information

console.log(`Selected unit: ${program.unit}`);
console.log(`Filter: ${program.filter}`);
console.log(`Grouped by region: ${program.group}`);
console.log(`AWS access key: ${program.awsAccessKey || process.env.AWS_ACCESS_KEY_ID}`);
if (program.awsSecret) {
  console.log(`AWS secret: ${program.awsSecret ? program.awsSecret.replace(/./g, '*') : undefined}`);
} else {
  console.log(`AWS secret: ${process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.replace(/./g, '*') : undefined}`);
}

// -- AWS SDK Setup ------

const creds = new AWS.Credentials(program.awsAccessKey || process.env.AWS_ACCESS_KEY_ID, program.awsSecret || process.env.AWS_SECRET_ACCESS_KEY);

AWS.config = new AWS.Config({ credentials: creds });
AWS.config.setPromisesDependency(bluebird);

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// -- Functions ------

// Using binary units 
const bytesConversion = {
  byte: 1,
  kb: 1000,
  mb: 1000 * 1000,
  gb: 1000 * 1000 * 1000,
  tb: 1000 * 1000 * 1000 * 1000
}

function convertBytesToUnit(bytes, unit) {
  return Math.round(bytes / bytesConversion[unit.toLowerCase()] * 100) / 100;
}

const unitProperCase = {
  byte: 'byte',
  kb: 'kB',
  gb: 'GB',
  tb: 'TB'
}

function getBucketFileInfo(s3, bucketName) {
  return s3
    .listObjectsV2({ Bucket: bucketName })
    .promise()
    .then(listObjectsResponse => {
      if (listObjectsResponse.IsTruncated) {
        // TODO
      }

      let lastModifiedFile = null;

      return bluebird
        .reduce(listObjectsResponse.Contents, (accumulator, object, index, length) => {
          if (!accumulator.lastModified || object.LastModified < accumulator.lastModified) {
            accumulator.lastModified = object.LastModified;
          }
          accumulator.storageTypeMap[object.StorageClass] = true;
          accumulator.sizeInBytes += object.Size;
          return accumulator;
        }, { sizeInBytes: 0, storageTypeMap: {} })
        .then(bucketFileInfo => {
          return {
            totalSize: convertBytesToUnit(bucketFileInfo.sizeInBytes, program.unit),
            latestModification: bucketFileInfo.lastModified,
            fileCount: listObjectsResponse.Contents.length,
            storageTypes: Object.keys(bucketFileInfo.storageTypeMap).sort()
          };
        })
    })
}

function convertStringToRegex(string) {
  const flags = string.replace(/.*\/([gimy]*)$/, '$1');
  const pattern = string.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
  try {
    const regex = new RegExp(pattern, flags);
    return regex;
  } catch (e) {
    // Invalid regex, treat as fuzzy literal
    return new RegExp(string);
  }
}

// -- Init ------

const tableHeader = [
  'Name'.bold,
  'Creation Date'.bold,
  'Region'.bold,
  `Total Size (${unitProperCase[program.unit.toLowerCase()]})`.bold,
  'Latest Modification'.bold,
  'File Count'.bold,
  'Storage Types'.bold
];

s3
  .listBuckets()
  .promise()
  .then(response => {
    let buckets = response.Buckets;

    if(program.filter) {
      const regex = convertStringToRegex(program.filter);
      buckets = buckets.filter(bucket => regex.test(bucket.Name));      
    }
    return bluebird.map(buckets, bucket => {
      return bluebird.join(
        s3.getBucketLocation({ Bucket: bucket.Name }).promise(),
        getBucketFileInfo(s3, bucket.Name),
        (bucketLocationResponse, bucketFileInfo) => {
          return [
            bucket.Name,
            bucket.CreationDate,
            bucketLocationResponse.LocationConstraint,
            bucketFileInfo.totalSize,
            bucketFileInfo.latestModification,
            bucketFileInfo.fileCount,
            bucketFileInfo.storageTypes
          ];
        })
    }, { concurrency: 100 })
  })
  .then(buckets => {
    const tableData = [tableHeader].concat(buckets);
    console.log(table(tableData))
  })
  .catch(err => {
    console.log(err);
  })