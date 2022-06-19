---
layout:
    1:
        position: default
        maximized: true
        inverseColors: true
    2:
        position: default
        maximized: true
---

=== "Summary"

    ```json
    ---
    language: yaml
    exclude:
        - source
        - language
        - runtimeEnv
    ---
    --8<-- "$LOGDIR/job.json"
    ```

=== "Environment"

    ```json
    ---
    language: yaml
    include: runtimeEnv
    ---
    --8<-- "$LOGDIR/job.json"
    ```

---

=== "Application Logs"

    ```ansi
    --8<-- "$LOGDIR/logs/job.txt"
    ```

=== "GPU Utilization"

    ```ansi
    --8<-- "$LOGDIR/resources/gpu.txt"
    ```

=== "Application Source"

    ```json
    ---
    include: source
    languageFrom: language
    ---
    --8<-- "$LOGDIR/job.json"
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
