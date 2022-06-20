=== "Summary"

    ```json
    ---
    language: yaml
    exclude:
        - .source
        - .language
        - .runtimeEnv
    ---
    --8<-- "$LOGDIR/job.json"
    ```

=== "Environment"

    ```json
    ---
    language: yaml
    include: .runtimeEnv.env_vars
    ---
    --8<-- "$LOGDIR/job.json"
    ```

=== "Pip Dependencies"

    ```json
    ---
    language: yaml
    include: .runtimeEnv.pip
    ---
    --8<-- "$LOGDIR/job.json"
    ```
