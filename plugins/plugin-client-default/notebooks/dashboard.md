---
layout:
    1:
        position: default
        maximized: true
    2:
        position: default
        maximized: true
    3:
        position: default
        maximized: true
---

--8<-- "./dashboard-summary.md"

---

=== "Application Logs"

    ```ansi
    --8<-- "$LOGDIR/logs/job.txt"
    ```

--8<-- "./dashboard-source.md"
--8<-- "./dashboard-envvars.md"
--8<-- "./dashboard-dependencies.md"

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

        --8<-- "./dashboard-choices.md"

---

=== "GPU Metrics"
    ```shell
    ---
    execute: now
    outputOnly: true
    ---
    chart gpu "$LOGDIR/resources/gpu.txt"
    ```

=== "Node Metrics"
    ```shell
    ---
    execute: now
    outputOnly: true
    ---
    chart vmstat "$LOGDIR/resources/pod-vmstat.txt"
    ```
