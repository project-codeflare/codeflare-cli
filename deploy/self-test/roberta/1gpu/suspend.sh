#
# Suspends the `periodic` cronjob. This is useful if you want to sneak
# in a `once` run for debugging.
#

kubectl patch cronjobs codeflare-self-test-roberta-1gpu-periodic -p '{"spec" : {"suspend" : true }}'
