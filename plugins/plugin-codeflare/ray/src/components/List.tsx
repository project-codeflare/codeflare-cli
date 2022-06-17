import React from "react"

interface Props {
  handleJobsData: () => ({
    header: object,
    body: object
  })
}

interface State {
  header: object,
  body: object
}

export default class List extends React.PureComponent<Props, State>{
  public constructor(props: Props) {
    super(props)
    this.state = {
      header: {},
      body: {}
    }
  }

  async componentWillMount() {
    const response = await fetch(`http://127.0.0.1:8265/api/jobs/`)
    const jobList = await response.json()

    const jobsMap = new Map()
    Object.keys(jobList).forEach((item, idx) => jobsMap.set(item, Object.values(jobList)[idx]))
    const jobsArray = Array.from(jobsMap)

    const header = {
      name: 'ID',
      attributes: [
        { value: 'STATUS' },
        { value: 'AGE' },
      ]
    }

    const body = jobsArray.map(job => ({
      name: job[0],
      attributes: [
        { value: job[1].status },
        { value: job[1].start_time },
      ]
    }))

    this.setState({ header, body })
  }

  public render() {
    const { header, body } = this.state
    return (
      <div>
        <pre>{ JSON.stringify(header, null, 2) }</pre>
        <pre>{ JSON.stringify(body, null, 2) }</pre>
      </div>
    )
  }
}
