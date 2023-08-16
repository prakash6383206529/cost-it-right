import React, { Fragment, useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useSelector } from 'react-redux'
import { CAPACITY, FEASIBILITY, FILE_URL, TIMELINE } from '../../../../config/constants'

function Attachament(props) {
  const { index, gridListing } = props
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const Data = gridListing ? index : viewCostingData[index]
  const [files, setFiles] = useState([]);
  const [filesFeasibility, setFilesFeasibility] = useState([]);
  const [filesCapacity, setFilesCapacity] = useState([]);
  const [filesTimeline, setFilesTimeline] = useState([]);

  useEffect(() => {
    let list = (Data.attachment || Data.Attachements)
    let attachmentList = filterAttachments(list, null)
    setFiles(attachmentList)
    let attachmentFeasibility = filterAttachments(list, FEASIBILITY)
    setFilesFeasibility(attachmentFeasibility)
    let attachmentCapacity = filterAttachments(list, CAPACITY)
    setFilesCapacity(attachmentCapacity)
    let attachmentTimeline = filterAttachments(list, TIMELINE)
    setFilesTimeline(attachmentTimeline)

  }, [Data])

  const filterAttachments = (list, value) => {
    let filteredList = list?.filter(element => element.AttachementCategory === value)
    return filteredList
  }


  /*
   * @method toggleDrawer
   * @description closing drawer
   */
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }
  return (
    <Fragment>
      <Drawer anchor={props.anchor} open={props.isOpen}       >
        <Container>
          <div className={'drawer-wrapper'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Attachments'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            <Row className="mx-0">
              {gridListing ? <Col md="12">

                {(Data.Attachments || Data.Attachements) &&
                  (Data.Attachments || Data.Attachements).map((f) => {
                    const withOutTild = f.FileURL
                      ? f.FileURL.replace('~', '')
                      : ''
                    const fileURL = `${FILE_URL}${withOutTild}`
                    return (
                      <div className={"attachment-row"}>
                        <a href={fileURL} target="_blank">
                          {f.OriginalFileName}
                        </a>
                      </div>
                    )
                  })}

              </Col> :
                <>
                  {props?.isRfqCosting ? <>
                    <Col md="12"> Attachament
                      {files && files.map((f) => {
                        const withOutTild = f.FileURL
                          ? f.FileURL.replace('~', '')
                          : ''
                        const fileURL = `${FILE_URL}${withOutTild}`
                        return (
                          <div className={"attachment-row"}>
                            <a href={fileURL} target="_blank" rel="noreferrer">
                              {f.OriginalFileName}
                            </a>
                          </div>
                        )
                      })}

                    </Col>


                    <Col md="12"> Feasibility
                      {filesFeasibility && filesFeasibility.map((f) => {
                        const withOutTild = f.FileURL
                          ? f.FileURL.replace('~', '')
                          : ''
                        const fileURL = `${FILE_URL}${withOutTild}`
                        return (
                          <div className={"attachment-row"}>
                            <a href={fileURL} target="_blank" rel="noreferrer">
                              {f.OriginalFileName}
                            </a>
                          </div>
                        )
                      })}

                    </Col>



                    <Col md="12"> Capacity
                      {filesCapacity && filesCapacity.map((f) => {
                        const withOutTild = f.FileURL
                          ? f.FileURL.replace('~', '')
                          : ''
                        const fileURL = `${FILE_URL}${withOutTild}`
                        return (
                          <div className={"attachment-row"}>
                            <a href={fileURL} target="_blank" rel="noreferrer">
                              {f.OriginalFileName}
                            </a>
                          </div>
                        )
                      })}

                    </Col>



                    <Col md="12"> Timeline
                      {filesTimeline && filesTimeline.map((f) => {
                        const withOutTild = f.FileURL
                          ? f.FileURL.replace('~', '')
                          : ''
                        const fileURL = `${FILE_URL}${withOutTild}`
                        return (
                          <div className={"attachment-row"}>
                            <a href={fileURL} target="_blank" rel="noreferrer">
                              {f.OriginalFileName}
                            </a>
                          </div>
                        )
                      })}

                    </Col>
                  </>
                    : <Col md="12">
                      {(Data.attachment || Data.Attachements) &&
                        (Data.attachment || Data.Attachements).map((f) => {
                          const withOutTild = f.FileURL
                            ? f.FileURL.replace('~', '')
                            : ''
                          const fileURL = `${FILE_URL}${withOutTild}`
                          return (
                            <div className={"attachment-row"}>
                              <a href={fileURL} target="_blank" rel="noreferrer">
                                {f.OriginalFileName}
                              </a>
                            </div>
                          )
                        })}

                    </Col>}
                </>}
            </Row>
          </div>
        </Container>
      </Drawer>
    </Fragment>
  )
}

export default React.memo(Attachament)
