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

import React from 'react'
import { Tab, getCurrentTab } from '@kui-shell/core'
import { TextWithIconWidget, ViewLevel } from '@kui-shell/plugin-client-common'
import RayIcon from './RayIcon'

interface Props {}

interface State {
  currentJob: string,
  viewLevel: ViewLevel,
  jobs: object,
  currentTab: Tab
}

export default class CurrentJob extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {
      currentJob: 'Loading...',
      viewLevel: 'normal',
      jobs: {},
      currentTab: undefined
    }
  }

  retrieveRunningJobs = async () => {
    const response = await fetch(`http://127.0.0.1:8265/api/jobs/`)
    const jobs = await response.json()
    this.setState({ jobs })
  }

  setDefaultRunningJob = () => {
    const jobs = this.state.jobs
    const currentJob = Object.keys(jobs).reverse()[0]
    this.setState({ currentJob })
  }

  async componentWillMount() {
    await this.retrieveRunningJobs()
    await this.setDefaultRunningJob()
    this.setState({ currentTab: getCurrentTab() })
    console.log(this.state)
  }

  public render() {
    const { currentJob, viewLevel } = this.state

    return (
      <TextWithIconWidget
        text={currentJob}
        viewLevel={viewLevel}
        textOnclick={`ray job info ${currentJob}`}>
          <RayIcon />
      </TextWithIconWidget>
    )
  }
}