import * as aws from "@pulumi/aws";
import * as pulumi from '@pulumi/pulumi'
const config = new pulumi.Config()

// const provider = new aws.Provider('', {
// })

// aws.getRegion()

config.get('aws:region');
config.requireSecret("api_key")

const bucket = new aws.s3.Bucket(
    "my-bucket",
    {
        forceDestroy: true,
    },
    {
        additionalSecretOutputs: ["bucket"]
    }
);

export const bucket_name = bucket.bucket
