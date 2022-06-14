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

interface Props {
  jobid: string
}

interface State {
  jobid: string,
  jobInfo: object,
  logs: string
}

/** TODO. Probably follow the lead from here:
 * https://github.com/kubernetes-sigs/kui/blob/master/plugins/plugin-kubectl/src/lib/view/modes/Terminal.tsx
 */
export default class Logs extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {
      jobid: props.jobid,
      jobInfo: {},
      logs: ''
    }
  }

  public async componentWillMount() {
    this.getJobLogs()
  }

  async getJobLogs() {
    const response = await fetch(`http://127.0.0.1:8265/api/jobs/${this.state.jobid}/logs`)
    const { logs } = await response.json()
    this.setState({ logs })
  }

  formatLogs(logs: string) {
    if (!logs.length) {
      return 'No logs available'
    }
    return logs.split('\n').map((log, i) => {
      return <p style={{margin: 0, marginLeft: 10}} key={i}>{log}</p>
    })
  }

  public render() {
    const { jobid, logs } = this.state

    if (!jobid) {
      return <div>No job selected</div>
    }
    return this.formatLogs(logs)
  }
}
