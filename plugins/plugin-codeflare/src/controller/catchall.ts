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

import { version } from "@kui-shell/client/package.json"
import { doMadwizard, MadWizardOptions } from "@kui-shell/plugin-madwizard"

import comIBMResearchFM from "../teams/com/ibm/research/fm"
import comIBMResearchNASA from "../teams/com/ibm/research/nasa"
import test1 from "../teams/org/project-codeflare/codeflare-cli/tests/1"

/** Extra environment variables for the madwizard run */
function envFn() {
  return {
    // sync/pin log aggregator version to our version
    LOG_AGGREGATOR_TAG: version,
  }
}

/**
 * Assert answers to certain questions? This is currently done on a
 * per-"team" basis, via the --team/-t command line option. These
 * allow us to fix the answer to certain questions.
 */
function assertionsFn({ team }: Pick<MadWizardOptions, "team">): Record<string, string> {
  if (team) {
    switch (team) {
      case "test1":
        return test1
      case "com.ibm.research.fm":
      case "fm":
      case "FM":
        return comIBMResearchFM
      case "com.ibm.research.nasa":
      case "cftest":
        return comIBMResearchNASA
      // intentional fallthrough
    }
  }

  return {}
}

/**
 * Our catch-all command handler: send to madwizard.
 */
export default doMadwizard({
  task: "guide",
  envFn,
  assertionsFn,
})
