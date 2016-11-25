#!/usr/bin/env node

'use strict';

const packageInfo = require('./package.json');

const program = require('commander');
const bluebird = require('bluebird');
const AWS = require('aws-sdk');
const table = require('table').table;
const colors = require('colors');

const s3utils = require('./utils/s3');
const unitsUtil = require('./utils/units');
const regexUtil = require('./utils/regex');

// -- Argument/options parsing ------
program
  .version(packageInfo.version || '0.0.1')
  .option('-u, --unit <unit>', 'Use the specified binary (not SI) unit size (byte, kB, MB, GB, TB)', /^(byte|kB|MB|GB|TB)$/i, 'byte')
  .option('-f, --filter <filter>', 'Filter the resulting list of buckets for which the name matches. Regex supported.')
  .option('-g, --group', 'U')
  .option('-a, --aws-access-key [accessKey]', 'AWS access key id. Takes precedence over AWS_ACCESS_KEY_ID')
  .option('-s, --aws-secret [secretAccessKey]', 'AWS secret access key id. Takes precedence over AWS_SECRET_ACCESS_KEY (not recommended)')
  .option('-v, --verbose')
  .parse(process.argv);

// -- Debug information

const awsAccessKey = program.awsAccessKey || process.env.AWS_ACCESS_KEY_ID;
const awsSecret = program.awsSecret || process.env.AWS_SECRET_ACCESS_KEY;

if (!awsAccessKey || !awsSecret) {
  console.error('An AWS access key id amd AWS secret access key are required.');
  process.exit(1);
}

if (program.verbose) {
  console.log(`Selected unit: ${program.unit}`);
  console.log(`Filter: ${program.filter}`);
  console.log(`Grouped by region: ${!!program.group}`);
  console.log(`AWS access key: ${program.awsAccessKey || process.env.AWS_ACCESS_KEY_ID}`);
  console.log(`AWS secret: ${awsSecret.replace(/./g, '*')}`);
}


// -- AWS SDK Setup ------

const creds = new AWS.Credentials(awsAccessKey, awsSecret);

AWS.config = new AWS.Config({ credentials: creds });
AWS.config.setPromisesDependency(bluebird);

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// -- Functions ------

const unitToProperCase = {
  byte: 'byte',
  kb: 'kB',
  gb: 'GB',
  tb: 'TB'
}

// -- Init ------

const tableHeader = [
  'Name'.bold,
  'Creation Date'.bold,
  'Region'.bold,
  `Total Size (${unitToProperCase[program.unit.toLowerCase()]})`.bold,
  'Latest Modification'.bold,
  'File Count'.bold,
  'Storage Types'.bold,
  'Est. Monthly Cost ($)'.bold
];

s3
  .listBuckets()
  .promise()
  .then(response => {
    let buckets = response.Buckets;

    if (program.filter) {
      const regex = regexUtil.convertStringToRegex(program.filter);
      buckets = buckets.filter(bucket => regex.test(bucket.Name));
    }

    let highestCost = 0;
    let costliestBucketIndex = -1;

    return bluebird.map(buckets, (bucket, index) => {
      return s3utils
        .getBucketInfo(s3, bucket.Name)
        .then(bucketInfo => {
          if (bucketInfo.estimatedPrice > highestCost) {
            highestCost = bucketInfo.estimatedPrice;
            costliestBucketIndex = index;
          }
          return [
            bucket.Name,
            bucket.CreationDate,
            bucketInfo.region,
            unitsUtil.convertBytesToUnit(bucketInfo.totalSizeInBytes, program.unit),
            bucketInfo.latestModification,
            bucketInfo.fileCount,
            bucketInfo.storageTypes,
            bucketInfo.estimatedPrice,
          ];
        })
    }, { concurrency: 10 });
  })
  .then(buckets => {
    if (program.group) {
      const entriesByRegion = {};

      buckets.forEach(bucket => {
        const region = bucket[2]; // I dislike magic numbers as much as the next guy, but this prevents converting objects to arrays needlessly (the 'table' library only supports arrays, not objects)
        if (!entriesByRegion[region]) entriesByRegion[region] = [];
        entriesByRegion[region].push(bucket);
      })

      Object.keys(entriesByRegion).forEach(region => {
        console.log(`Region: ${region}`);
        const tableData = [tableHeader].concat(entriesByRegion[region]);
        console.log(table(tableData));
      })

    } else {
      const tableData = [tableHeader].concat(buckets);
      console.log(table(tableData));
    }
  })
  .catch(err => {
    console.log(err ? err.stack : 'Unknown error');
  })