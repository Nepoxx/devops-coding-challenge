# Coveo DevOps Challenge
### The Challenge
Your challenge, should you choose to accept it, is to develop an AWS S3 storage analysis tool. To test your tool, you will have to create a free [Amazon](http://aws.amazon.com/en/free/) account (if you don't already have one).
### TODO
- -g option
- tests
- moar documentation
### Specifications
The tool is a shell command line utility (could be either Windows, Mac or Linux) that returns informations over all [S3](https://aws.amazon.com/documentation/s3/) buckets in an Amazon account.
##### The tool returns the following informations:
- Bucket name
- Creation date (of the bucket)
- Number of files
- Total size of files
- Last modified date (most recent file of a bucket)
- [Estimated monthly cost](#Estimated-Monthly-Cost)

##### The following options are supported:
- Ability to get the size results in bytes, KB, MB, ... (-u, --unit)
- Organize the information by [storage type](https://docs.aws.amazon.com/AmazonS3/latest/dev/storage-class-intro.html) (Standard, IA, RR)
- Filter the results in a list of buckets (-f, --filter, regex are supported)
- Ability to group information by [regions](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) (-g, --group)

##### Estimated Monthly Cost
The estimated monthly cost of a bucket is a pessimistic and rough estimate. While Amazon does [provide an API to get current pricing info](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/), the returned JSON is about 50 megabytes and is overkill for this application, therefore the pricing is hardcoded and will therefore not update. 

Since S3's pricing also varies depending on storage (the cost of the first terabyte is not the same as the next 49 and so on), a pessimistic assumption was made and always uses highest price per GB.

The estimated cost only includes passive storage, transfer, api call, etc. are not factored in.