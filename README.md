# Pulumi first look

This repository is complimentary to an [article](https://exanubes.com/blog/introduction-to-pulumi) on getting
started with [Pulumi](https://pulumi.com).

The infrastructure code sets up a public bucket in `eu-central-1` region – by the use of a custom provider – and uploads
an `index.html` file to it. A policy is attached to the bucket to make the object public and a link is generated and
returned as programme's output for easy access.