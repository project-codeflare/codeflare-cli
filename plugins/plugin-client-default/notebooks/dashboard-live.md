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
--8<-- "./dashboard-source.md"

---

=== "Application Logs"

    ```shell
    ---
    execute: now
    maximize: true
    outputOnly: true
    ---
    tail -n 500 -f $LOGDIR/logs/job.txt
    ```

=== "GPU Utilization"

    ```shell
    ---
    execute: now
    maximize: true
    outputOnly: true
    ---
    tail -n 500 -f $LOGDIR/resources/gpu.txt
    ```

=== "Advanced"
    === "Node Utilization"

        ```shell
        ---
        execute: now
        maximize: true
        outputOnly: true
        ---
        tail -n 500 -f $LOGDIR/resources/node-stats.txt
        ```

    === "Pod Utilization"

        ```shell
        ---
        execute: now
        maximize: true
        outputOnly: true
        ---
        tail -n 500 -f $LOGDIR/resources/pod-stats.txt
        ```

    === "Kubernetes Events"

        ```shell
        ---
        execute: now
        maximize: true
        outputOnly: true
        ---
        tail -n 500 -f $LOGDIR/events/kubernetes.txt
        ```

