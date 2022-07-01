/*
 * Copyright 2022 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"
import { ITheme, Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Events } from "@kui-shell/core"

interface Props {
  initialContent?: string
  on?(eventType: "line", cb: (data: any) => void): void
  unwatch?(): void
}

export default class XTerm extends React.PureComponent<Props> {
  private terminal: Terminal = new Terminal({
    scrollback: 5000,
  })

  private readonly cleaners: (() => void)[] = []
  private readonly container = React.createRef<HTMLDivElement>()

  public componentDidMount() {
    this.mountTerminal()

    if (this.props.initialContent) {
      // @starpit i don't know why we have to split the newlines...
      this.props.initialContent.split(/\n/).forEach(this.writeln)
      //this.terminal.write(this.props.initialContent)
    }
    if (this.props.on) {
      this.props.on("line", this.writeln)
    }
  }

  public componentWillUnmount() {
    this.unmountTerminal()
    this.cleaners.forEach((cleaner) => cleaner())

    if (this.props.unwatch) {
      this.props.unwatch()
    }
  }

  private writeln = (data: any) => {
    if (typeof data === "string") {
      this.terminal.writeln(data)
    }
  }

  private unmountTerminal() {
    if (this.terminal) {
      this.terminal.dispose()
    }
  }

  private mountTerminal() {
    const xtermContainer = this.container.current
    if (!xtermContainer) {
      return
    }

    const fitAddon = new FitAddon()
    this.terminal.loadAddon(fitAddon)

    const inject = () => this.injectTheme(this.terminal, xtermContainer)
    inject()
    Events.eventChannelUnsafe.on("/theme/change", inject)
    this.cleaners.push(() => Events.eventChannelUnsafe.on("/theme/change", inject))

    this.terminal.open(xtermContainer)

    const doResize = () => {
      try {
        fitAddon.fit()
      } catch (err) {
        // this is due to not being in focus, so it isn't critical
        console.error(err)
      }
    }

    const observer = new ResizeObserver(function observer(observed) {
      // re: the if guard, see https://github.com/IBM/kui/issues/6585
      if (observed.every((_) => _.contentRect.width > 0 && _.contentRect.height > 0)) {
        setTimeout(doResize)
      }
    })
    observer.observe(xtermContainer)
  }

  /**
   * Take a hex color string and return the corresponding RGBA with the given alpha
   *
   */
  private alpha(hex: string, alpha: number): string {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      const red = parseInt(hex.slice(1, 3), 16)
      const green = parseInt(hex.slice(3, 5), 16)
      const blue = parseInt(hex.slice(5, 7), 16)

      return `rgba(${red},${green},${blue},${alpha})`
    } else {
      return hex
    }
  }

  /**
   * Convert the current theme to an xterm.js ITheme
   *
   */
  private injectTheme(xterm: Terminal, dom: HTMLElement): void {
    const theme = getComputedStyle(dom)
    // debug('kui theme for xterm', theme)

    /** helper to extract a kui theme color */
    const val = (key: string, kind = "color"): string => theme.getPropertyValue(`--${kind}-${key}`).trim()

    const itheme: ITheme = {
      foreground: val("text-01"),
      background: val("sidecar-background-01"),
      cursor: val("support-01"),
      selection: this.alpha(val("selection-background"), 0.3),

      black: val("black"),
      red: val("red"),
      green: val("green"),
      yellow: val("yellow"),
      blue: val("blue"),
      magenta: val("magenta"),
      cyan: val("cyan"),
      white: val("white"),

      brightBlack: val("black"),
      brightRed: val("red"),
      brightGreen: val("green"),
      brightYellow: val("yellow"),
      brightBlue: val("blue"),
      brightMagenta: val("magenta"),
      brightCyan: val("cyan"),
      brightWhite: val("white"),
    }

    // debug('itheme for xterm', itheme)
    xterm.setOption("theme", itheme)
    xterm.setOption("fontFamily", val("monospace", "font"))

    try {
      const standIn = document.querySelector("body .repl .repl-input input")
      if (standIn) {
        const fontTheme = getComputedStyle(standIn)
        xterm.setOption("fontSize", parseInt(fontTheme.fontSize.replace(/px$/, ""), 10))
        // terminal.setOption('lineHeight', )//parseInt(fontTheme.lineHeight.replace(/px$/, ''), 10))

        // FIXME. not tied to theme
        xterm.setOption("fontWeight", 400)
        xterm.setOption("fontWeightBold", 600)
      }
    } catch (err) {
      console.error("Error setting terminal font size", err)
    }
  }

  private onKeyUp(evt: React.KeyboardEvent) {
    if (evt.key === "Escape") {
      // swallow escape key presses against the xterm container,
      // e.g. we don't want hitting escape in vi to propagate to other
      // kui elements
      evt.stopPropagation()
    }
  }

  public render() {
    return <div ref={this.container} className="xterm-container" onKeyUp={this.onKeyUp} />
  }
}
