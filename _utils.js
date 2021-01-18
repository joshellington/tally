const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.KEY,
  secretAccessKey: process.env.SECRET,
});

async function createIfMissing(id) {
  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${id}.txt`
  }

  try {
    return await s3.getObject(params).promise();
  } catch(e) {
    let uploadParams = Object.assign(params, {Body: "0"});
    return await s3.upload(uploadParams).promise();
  }
    
}

module.exports.get = async (id) => {
  await createIfMissing(id);

  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${id}.txt`
  }

  return (await s3.getObject(params).promise()).Body.toString();
}

module.exports.add = async (id) => {
  await createIfMissing(id);

  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${id}.txt`
  }

  let count = parseInt((await s3.getObject(params).promise()).Body.toString());
  let newCount = (count + 1).toString();

  console.log(count, newCount);
  
  let uploadParams = Object.assign(params, {Body: newCount});
  await s3.upload(uploadParams).promise();

  return newCount;
}

module.exports.remove = async (id) => {
  await createIfMissing(id);

  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${id}.txt`
  }

  let count = parseInt((await s3.getObject(params).promise()).Body.toString());
  let newCount = (count > 0 ? count - 1 : 0).toString();
  
  let uploadParams = Object.assign(params, {Body: newCount.toString()});
  await s3.upload(uploadParams).promise();

  return newCount;
}