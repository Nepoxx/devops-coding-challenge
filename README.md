# Coveo DevOps Challenge
### The Challenge
Your challenge, should you choose to accept it, is to develop an AWS S3 storage analysis tool. To test your tool, you will have to create a free [Amazon](http://aws.amazon.com/en/free/) account (if you don't already have one).

### Specifications
The tool is a shell command line utility (could be either Windows, Mac or Linux) that returns informations over all [S3](https://aws.amazon.com/documentation/s3/) buckets in an Amazon account.

### Usage

`npm install` or `npm install --production` (will not download nor install dev dependencies)

`node app.js --help` for additional information

Run tests using `npm test`

This tool can be installed as a 'proper' command line tool by using `npm install -g`. `s3tool` becomes available in your shell.


### Why Node.js?
The main reason is quite simple: Node.js is the technology I'm using the most these days and therefore it was the fastest way to write this coding challeng even though Python is still the most used language to write such tools. I also happen to think that Node.js is an excellent choice for this kind of tool, here's a few other reasons why.

* Node.js is amazingly fast, a few order of magnitudes faster than Python, even when using a single thread (see [benchmarks](https://benchmarksgame.alioth.debian.org/u64q/compare.php?lang=node&lang2=python3)). When in cluster mode (using more cores), it even beats most common frameworks/languages such as Spring, Undertow, Go, PHP and more (see [techempower benchmarks](https://www.techempower.com/benchmarks/))
* NPM has more packages available than any other languages, it has more packages than PyPI, Maven Central and Nuget combined and is growing faster than all of them (sometimes causing JavaScript fatigue)
* Node has very good IDEs, debugging tools, documentation and language support (ES6 (which I use), FlowType, CoffeeScript, TypeScript, etc.)
* Node is present on most Unix systems by default, so no additional installations are (usually required). It is also mostly retro-compatible, so none of that Python 2/3 mess (Python 2.7 ftw!).

##### The tool returns the following informations:
- Bucket name
- Creation date (of the bucket)
- Number of files
- Total size of files
- Last modified date (most recent file of a bucket)
- [Estimated monthly cost (See below)](#Estimated-Monthly-Cost)

##### The following options are supported:
- Ability to get the size results in bytes, KB, MB, ... (-u, --unit)
- Organize the information by [storage type](https://docs.aws.amazon.com/AmazonS3/latest/dev/storage-class-intro.html) (Standard, IA, RR)
- Filter the results in a list of buckets (-f, --filter, regex are supported)
- Ability to group information by [regions](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) (-g, --group)

##### Estimated Monthly Cost
The estimated monthly cost of a bucket is a pessimistic and rough estimate. While Amazon does [provide an API to get current pricing info](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/), the returned JSON is about 50 megabytes and is overkill for this application, therefore the pricing is hardcoded and will therefore not update. 

Since S3's pricing also varies depending on storage (the cost of the first terabyte is not the same as the next 49 and so on), a pessimistic assumption was made and always uses highest price per GB.

The estimated cost only includes passive storage, transfer, api call, etc. are not factored in.

### Considerations

While I've tried to make the code somewhat production ready, I've taken a few shortcuts for simplicity and convenience's sake. TypeScript would be a good addition and in my opinion improve maintability. 

Additional tests such as E2E tests would be desireable. Test coverage reports would be awesome.

Refining the cost estimate would be another nice touch.

Linting would be a must.
