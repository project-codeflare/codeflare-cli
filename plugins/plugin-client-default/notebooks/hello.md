---
title: Hello
className: codeflare--welcome-guidebook
layout:
    1:
        position: default
    2:
        position: default
        maximized: true
---

<img alt="CodeFlare Icon" src="@kui-shell/client/icons/svg/codeflare.svg" width="225" height="225" align="left" />

[CodeFlare](https://codeflare.dev) is a framework to simplify the
integration, scaling and acceleration of complex multi-step analytics
and machine learning pipelines on the cloud.

> ### Next Steps
>
> - To start running jobs against the Cloud, from your terminal, try `codeflare` .

---

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

=== "Your Profiles"
    ```shell
    ---
    execute: now
    outputOnly: true
    ---
    codeflare get profile
    ```

=== "Use the CodeFlare CLI"
    ```shell
    ---
    execute: now
    outputOnly: true
    maximize: true
    ---
    codeflare terminal codeflare
    ```

=== "Terminal"
    ```shell
    ---
    execute: now
    outputOnly: true
    maximize: true
    ---
    codeflare terminal $SHELL
    ```
