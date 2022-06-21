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
--8<-- "./dashboard-choices.md"
--8<-- "./dashboard-source.md"

---

=== "Application Logs"

    ```ansi
    --8<-- "$LOGDIR/logs/job.txt"
    ```

=== "GPU Utilization"

    ```shell
    ---
    execute: now
    outputOnly: true
    ---
    chart "$LOGDIR/resources/gpu.txt"
    ```

=== "Advanced"
    === "Node Utilization"

        ```ansi
        --8<-- "$LOGDIR/resources/node-stats.txt"
        ```

    === "Pod Utilization"

        ```ansi
        --8<-- "$LOGDIR/resources/pod-stats.txt"
        ```

    === "Kubernetes Events"

        ```json
        ---
        language: shell
        ---
        --8<-- "$LOGDIR/events/kubernetes.txt"
        ```

