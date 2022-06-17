---
layout:
    1: default
    2: default
    3: default
    4: default
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
tail -f $LOGDIR/resources/gpu.txt
```

---

# Job Logs

```shell
---
execute: now
maximize: true
outputOnly: true
---
tail -f $LOGDIR/logs/job.txt
```

---

# Kubernetes Events

```shell
---
execute: now
maximize: true
outputOnly: true
---
tail -f $LOGDIR/events/kubernetes.txt
```