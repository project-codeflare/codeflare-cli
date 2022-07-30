---
title: Hello
className: codeflare--welcome-guidebook
layout:
    1: default
    2:
        position: default
        maximized: true
    3:
        position: default
        maximized: true
---

<img alt="CodeFlare Icon" src="@kui-shell/client/icons/svg/codeflare.svg" width="128" height="128" align="left" />

[CodeFlare](https://codeflare.dev) simplifies the
integration, scaling and acceleration of complex multi-step analytics
and machine learning pipelines on the cloud.

> ### Getting Started
>
> - Use the `codeflare` command in your
> terminal, or the one embedded here :material-transfer-right:
> - This CLI guides you through running a job, using a series of
> questions. 
> - The answers to your questions are stored as a *profile*.

---

=== "Your Profiles"
    ```shell
    ---
    execute: now
    outputOnly: true
    ---
    codeflare get profile
    ```
---

=== "Use the CodeFlare CLI"
    ```shell
    ---
    execute: now
    outputOnly: true
    maximize: true
    ---
    codeflare terminal codeflare -p ${SELECTED_PROFILE}
    ```

=== "Gallery"
    === "CodeFlare CLI"
        ```shell
        ---
        execute: now
        outputOnly: true
        maximize: true
        ---
        codeflare gallery
        ```

    === "CodeFlare Dashboard"
        ```shell
        ---
        execute: now
        outputOnly: true
        maximize: true
        ---
        codeflare dashboard-gallery
        ```

=== "Terminal"
    ```shell
    ---
    execute: now
    outputOnly: true
    maximize: true
    ---
    codeflare terminal $SHELL -l
    ```

