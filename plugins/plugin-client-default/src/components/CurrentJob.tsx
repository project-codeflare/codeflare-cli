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

  // handleCurrentJobClick() {
  //   // const {
  //   //   currentTab: { REPL: repl }
  //   // } = this.state
  //   // const response = await repl.qexec(`ray job logs ${this.state.currentJob}`)
  //   console.log('handleCurrentJobClick')
  //   console.log(this.state)
  // }

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