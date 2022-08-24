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
import { doMadwizard } from "@kui-shell/plugin-madwizard"

/** Extra environment variables for the madwizard run */
function env() {
  return {
    // sync/pin log aggregator version to our version
    LOG_AGGREGATOR_TAG: version,
  }
}

/**
 * Our catch-all command handler: send to madwizard.
 */
export default doMadwizard(true, "guide", true, undefined, env)
