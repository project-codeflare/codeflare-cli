---
layout:
    1:
        position: default
        maximized: true
    2:
        position: default
        maximized: true
        inverseColors: true
---

--8<-- "./dashboard-summary.md"
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

=== "Kubernetes Events"

    ```shell
    ---
    execute: now
    maximize: true
    outputOnly: true
    ---
    tail -f $LOGDIR/events/kubernetes.txt
    ```

--8<-- "./dashboard-source.md"
