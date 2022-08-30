#
# Resumes the `periodic` cronjob.
#

kubectl patch cronjobs codeflare-self-test-roberta-1gpu-periodic -p '{"spec" : {"suspend" : false }}'
