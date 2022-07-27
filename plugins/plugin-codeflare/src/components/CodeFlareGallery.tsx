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
import { Gallery, GalleryItem } from "@patternfly/react-core"

export default class CodeFlareGallery extends React.PureComponent {
  public render() {
    return (
      <Gallery className="hello__use-cases" hasGutter>
        <GalleryItem>
          <a href="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ" target="_blank">
            <img src="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ.svg" />
          </a>
        </GalleryItem>
        <GalleryItem>
          <a href="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ" target="_blank">
            <img src="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ.svg" />
          </a>
        </GalleryItem>
        <GalleryItem>
          <a href="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ" target="_blank">
            <img src="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ.svg" />
          </a>
        </GalleryItem>
        <GalleryItem>
          <a href="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ" target="_blank">
            <img src="https://asciinema.org/a/kYps2jg978lUwvyLfQXKrBsUZ.svg" />
          </a>
        </GalleryItem>
      </Gallery>
    )
  }
}
