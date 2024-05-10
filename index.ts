import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

const stackReference = new pulumi.StackReference(
  "account_name/project_name/stack_name",
);

const region = aws.getRegion();

const filePath = "./app/index.html";

const provider = new aws.Provider("custom-provider", {
  region: "eu-central-1",
});

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket(
  "my-bucket",
  {
    forceDestroy: true,
  },
  { provider, parent: provider },
);

const publicAccess = new aws.s3.BucketPublicAccessBlock(
  "bucket-access",
  {
    bucket: bucket.id,
    restrictPublicBuckets: false,
    blockPublicAcls: false,
    ignorePublicAcls: false,
    blockPublicPolicy: false,
  },
  { provider },
);

// Upload index.html file
const object = new aws.s3.BucketObject(
  "index-file",
  {
    bucket: bucket.bucket,
    content: fs.readFileSync(filePath, { encoding: "utf-8" }),
    key: path.basename(filePath),
    contentType: "text/html",
  },
  { provider },
);

const bucketPolicy = new aws.s3.BucketPolicy(
  "bucket-policy",
  {
    bucket: bucket.id.apply((id) => id),
    policy: bucket.arn.apply((arn) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `${arn}/*`,
          },
        ],
      }),
    ),
  },
  { dependsOn: [publicAccess], parent: bucket, protect: false },
);

// Export the name of the bucket
export const bucket_name = bucket.id;

export const object_url = pulumi
  .all([bucket.bucket, object.key, provider.region])
  .apply(
    ([bucket, key, region]) =>
      `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  );

// uses default provider's region
// export const object_url = pulumi
//     .all([bucket.bucket, object.key, region])
//     .apply(([bucket, key, region]) =>
//         `https://${bucket}.s3.${region}.amazonaws.com/${key}`
//     )

export const interpolate = pulumi.interpolate`
https://${bucket.bucket}.s3.${provider.region}.amazonaws.com/${object.key}
`;

// uses default provider's region
// export const interpolate = pulumi.interpolate`
// https://${bucket.bucket}.s3.${region.then(region=>region.name)}.amazonaws.com/${object.key}
// `

export const otherStackValue = stackReference.getOutputValue("bucketName");
