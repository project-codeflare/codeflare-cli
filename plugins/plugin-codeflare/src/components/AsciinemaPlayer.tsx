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

import React, { useEffect, useRef } from "react"
import * as AsciinemaPlayerLibrary from "asciinema-player"

type AsciinemaPlayerProps = Partial<{
  src: string
  // START asciinemaOptions
  cols: number
  rows: number
  autoPlay: boolean
  preload: boolean
  loop: boolean | number
  startAt: number | string
  speed: number
  idleTimeLimit: number
  theme: string
  poster: string
  fit: string
  terminalFontSize: string
  terminalFontFamily: string
  // END asciinemaOptions
}>

const AsciinemaPlayer: React.FC<AsciinemaPlayerProps> = ({ src, ...asciinemaOptions }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current
    AsciinemaPlayerLibrary.create(src, currentRef, asciinemaOptions)
  }, [src])

  return <div ref={ref} className="flex-layout flex-align-center flex-fill" />
}

export default AsciinemaPlayer
