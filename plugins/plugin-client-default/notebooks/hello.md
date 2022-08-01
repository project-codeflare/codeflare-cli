---
title: Hello
className: codeflare--welcome-guidebook
layout:
    1:
        position: default
        maximized: true
    2:
        position: default
        maximized: true
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

