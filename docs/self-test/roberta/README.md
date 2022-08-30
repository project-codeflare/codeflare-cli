# Run a RoBERTa Self-test

You are here because you want to run RoBERTa in your cluster in an
automated fashion. There is currently support for periodic runs, using
a Kubernetes
[CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/). For
testing purposes, you may also choose to do a one-off run, as well.

## How it Works

The CronJob launches a Kubernetes
[Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/),
which in turn spawns one or more Kubernetes
[Pods](https://kubernetes.io/docs/concepts/workloads/pods/). This pod
wakes up and launches the CodeFlare CLI against a given _profile_
(e.g. one that runs RoBERTa using 1 GPU, 8Gi of worker memory, using a
certain branch of the code base, etc.).

## How to Deploy the Automation

### Create a `github` secret, if needed

If your RoBERTa branch is private, you will need to provide a GitHub
username and token, by creating a Kubernetes
[Secret](https://kubernetes.io/docs/concepts/configuration/secret/). This
secret must be named `github`, and must have two data fields `GITHUB_USER` and `GITHUB_TOKEN`.

```shell
export GITHUB_USER=myusername
```

```shell
export GITHUB_TOKEN=mygithubtoken
```

```shell
kubectl create secret generic github \
    --from-literal=GITHUB_USER=$(echo -n $GITHUB_USER | base64) \
    --from-literal=GITHUB_TOKEN=$(echo -n $GITHUB_TOKEN | base64)
```

## Create a `slack` secret, if desired

If you wish to post to a Slack channel, create a Kubernetes secret named `codeflare-self-test-slack` with the following data fields:

```shell
export SLACK_TEAMID=myteamid
```

```shell
export SLACK_CHANNELID=mychannelid
```

```shell
export SLACK_TOKEN=mytoken
```

```shell
kubectl create secret generic codeflare-self-test-slack \
    --from-literal=TEAMID=$(echo -n $SLACK_TEAMID | base64) \
    --from-literal=CHANNELID=$(echo -n $SLACK_CHANNELID | base64) \
    --from-literal=TOKEN=$(echo -n $SLACK_TOKEN | base64)
```

### Deploy the automation

```shell
kubectl apply -f https://raw.githubusercontent.com/project-codeflare/codeflare-cli/main/deploy/self-test/roberta/1gpu/periodic.yaml
```

Use `delete` in place of `apply` if you wish to tear down the
automation. Replace `periodic.yaml` with `once.yaml` if you want a
one-off run.

## TODO

- [ ] Implement and document how to point to a specific branch of the
      RoBERTa code base. This will probably require the use of a
      configmap.

- [ ] Add Slack integration to inform a team of self-test failures.
