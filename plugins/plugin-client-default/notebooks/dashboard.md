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

    ```ansi
    --8<-- "$LOGDIR/logs/job.txt"
    ```

=== "GPU Utilization"

    ```ansi
    --8<-- "$LOGDIR/resources/gpu.txt"
    ```

=== "Kubernetes Events"

    ```json
    ---
    language: shell
    ---
    --8<-- "$LOGDIR/events/kubernetes.txt"
    ```

--8<-- "./dashboard-source.md"
