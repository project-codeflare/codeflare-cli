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
import * as AsciinemaPlayer from "asciinema-player"
import { Gallery, GalleryItem } from "@patternfly/react-core"
import "asciinema-player/dist/bundle/asciinema-player.css"
import demoCast from "@kui-shell/client/casts/demo-1.svg"

export default class CodeFlareGallery extends React.PureComponent {
  private readonly demo1Ref = React.createRef<HTMLDivElement>()
  private readonly demo2Ref = React.createRef<HTMLDivElement>()
  private readonly demo3Ref = React.createRef<HTMLDivElement>()
  private readonly demo4Ref = React.createRef<HTMLDivElement>()

  private createPlayer(castFilePath: string, elementId: string): void {
    AsciinemaPlayer.create(castFilePath, document.getElementById(elementId))
  }

  componentDidMount() {
    this.createPlayer(demoCast, "codeflare--gallery-demo-1")
    this.createPlayer(demoCast, "codeflare--gallery-demo-2")
    this.createPlayer(demoCast, "codeflare--gallery-demo-3")
    this.createPlayer(demoCast, "codeflare--gallery-demo-4")
  }

  public render() {
    return (
      <Gallery hasGutter>
        <GalleryItem>
          <div ref={this.demo1Ref} id="codeflare--gallery-demo-1"></div>
        </GalleryItem>
        <GalleryItem>
          <div ref={this.demo2Ref} id="codeflare--gallery-demo-2"></div>
        </GalleryItem>
        <GalleryItem>
          <div ref={this.demo3Ref} id="codeflare--gallery-demo-3"></div>
        </GalleryItem>
        <GalleryItem>
          <div ref={this.demo4Ref} id="codeflare--gallery-demo-4"></div>
        </GalleryItem>
      </Gallery>
    )
  }
}
