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

import { Registrar } from '@kui-shell/core'
import { setTabReadonly } from './util'

/** Register Kui Commands */
export default function registerMadwizardCommands(registrar: Registrar) {
  registrar.listen('/guide', async ({ tab, argvNoOptions }) => {
    const filepath = argvNoOptions[1]
    setTabReadonly({ tab })
    return {
      react: await import('./components/PlanAndGuide').then(_ => _.planAndGuide(filepath, { tab }))
    }
  }, { outputOnly: true })

  registrar.listen('/wizard', async ({ tab, argvNoOptions }) => {
    const filepath = argvNoOptions[1]
    setTabReadonly({ tab })
    return {
      react: await import('./components/Guide').then(_ => _.guide(filepath, {
        tab
      }))
    }
  })
  
  registrar.listen('/plan', async ({ tab, argvNoOptions }) => {
    const filepath = argvNoOptions[1]
    setTabReadonly({ tab })
    return {
      react: await import('./components/Plan').then(_ => _.plan(filepath))
    }
  })
}
