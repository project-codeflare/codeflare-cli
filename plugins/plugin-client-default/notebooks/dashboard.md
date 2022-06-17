---
layout:
    1: default
    2: default
    3: default
---

# Job Description

```shell
---
execute: now
maximize: true
outputOnly: true
---
cat $LOGDIR/job.json
```


---

# GPU Utilization

```shell
---
execute: now
maximize: true
outputOnly: true
---
$TAIL $LOGDIR/resources/gpu.txt
```

---

# Job Logs

```shell
---
execute: now
maximize: true
outputOnly: true
---
$TAIL $LOGDIR/logs/job.txt
```

<!--
---

# Kubernetes Events

```shell
---
execute: now
maximize: true
outputOnly: true
---
$TAIL $LOGDIR/events/kubernetes.txt
```
-->
