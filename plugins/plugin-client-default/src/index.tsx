/*
 * Copyright 2020 The Kubernetes Authors
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

import { Kui, KuiProps, ContextWidgets, GitHubIcon, MeterWidgets, SpaceFiller } from "@kui-shell/plugin-client-common"

// import { CurrentContext, CurrentNamespace } from "@kui-shell/plugin-kubectl/components"
// import { Search } from "@kui-shell/plugin-electron-components"

import { version } from "@kui-shell/client/package.json"
import { productTitle } from "@kui-shell/client/config.d/name.json"

import CodeFlareWidget from "./CodeFlareWidget"

/**
 * We will set this bit when the user dismisses the Welcome to Kui
 * tab, so as to avoid opening it again and bothering that user for
 * every new Kui window.
 *
 */
// const welcomeBit = 'plugin-client-default.welcome-was-dismissed'

// to replay a guidebook on startup, add this <Kui/> property
//      commandLine={
//        props.commandLine || [
//          'replay',
//          // '-r', // with this, AnimalApp opens showing only the animalapp.json notebook
//          '/kui/welcome.md'
//        ]
//      }

export default function renderMain(props: KuiProps) {
  //  toplevel={!Capabilities.inBrowser() && <Search />}
  return (
    <Kui
      noHelp
      version={version}
      productName={productTitle}
      lightweightTables
      noNewTabButton
      noNewSplitButton
      {...props}
      initialTabTitle="Dashboard"
      isPopup={false}
      quietExecCommand={false}
    >
      <ContextWidgets>
        <GitHubIcon />
        <CodeFlareWidget />
        {/* <CurrentContext />
       <CurrentNamespace /> */}
      </ContextWidgets>

      <SpaceFiller />
      <MeterWidgets></MeterWidgets>
    </Kui>
  )
}
