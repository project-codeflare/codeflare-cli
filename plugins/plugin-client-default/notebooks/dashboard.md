---
title: Dashboard
layout:
    1:
        position: default
        maximized: true
        inverseColors: true
    2:
        position: default
        maximized: true
    3:
        position: default
        maximized: true
    4:
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
    outputOnly: true
    maximize: true
    ---
    codeflare tailf "$LOGDIR/logs/job.txt"
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

=== "Utilization Charts"
    ```shell
    ---
    execute: now
    maximize: true
    outputOnly: true
    ---
    chart all "${LOGDIR}"
    ```

---

=== "Events"
    ```shell
    ---
    execute: now
    outputOnly: true
    ---
    chart events "${LOGDIR}"
    ```
