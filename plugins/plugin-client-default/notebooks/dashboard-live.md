---
layout:
    1:
        position: left
        maximized: true
    2:
        position: default
        maximized: true
---

=== "Summary"

    ```json
    --8<-- "$LOGDIR/job.json"
    ```

---

=== "Application Logs"

    ```shell
    ---
    execute: now
    maximize: true
    outputOnly: true
    ---
    tail -f $LOGDIR/logs/job.txt
    ```

=== "GPU Utilization"

    ```shell
    ---
    execute: now
    maximize: true
    outputOnly: true
    ---
    tail -f $LOGDIR/resources/gpu.txt
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
