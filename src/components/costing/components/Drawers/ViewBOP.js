import React, { useState, useEffect, Fragment } from 'react'
import { checkForDecimalAndNull, checkTechnologyIdAndRfq, getChangeHighlightClass, getConfigurationKey, showBopLabel } from '../../../../../src/helper'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA, TOOLING } from '../../../../config/constants'
import { useSelector } from 'react-redux'
import { reactLocalStorage } from 'reactjs-localstorage'
import DayTime from '../../../common/DayTimeWrapper'

function ViewBOP(props) {
  const { viewBOPData, isPDFShow } = props
 const { BOPData, bopPHandlingCharges, bopHandlingPercentage, bopHandlingChargeType, childPartBOPHandlingCharges, IsAssemblyCosting, partType } = viewBOPData || {}
  const [viewBOPCost, setviewBOPCost] = useState([])
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)

  useEffect(() => {
    if (BOPData) {
      setviewBOPCost(BOPData)
    }
  }, [BOPData])
  /**
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
  const bopDataTable = () => {
    return <>
      <Row>
        <Col md="12">
          <Row>
            <Col md="12">
              <div className="left-border">{`${showBopLabel()}:`}</div>
            </Col>
          </Row>
          <Table className="table cr-brdr-main" size="sm">
            <thead>
              <tr>
                {IsAssemblyCosting && <th>{`Part No.`}</th>}
                <th>{`${showBopLabel()} Part No.`}</th>
                <th>{`${showBopLabel()} Part Name`}</th>
                {checkTechnologyIdAndRfq(viewCostingData) && <th>{`${showBopLabel()} Updated Part Name`}</th>}

                <th>{`Landed Cost `}</th>
                <th>{`Quantity`}</th>
                <th >{`Net ${showBopLabel()} Cost`}</th>
                {initialConfiguration?.IsShowCRMHead && <th className="costing-border-right">{`CRM Head`}</th>}
                <th>{`Effective Date`}</th>
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {viewBOPCost &&
                viewBOPCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {IsAssemblyCosting && <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</span></td>}
                      <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span></td>
                      <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                      {checkTechnologyIdAndRfq(viewCostingData) && <td><div className={getChangeHighlightClass(item?.BOPPartName, item?.UpdatedBoughtOutPartPartName)}><span title={item?.UpdatedBoughtOutPartPartName}>{item?.UpdatedBoughtOutPartPartName}</span></div></td>}
                      <td>
                        {checkForDecimalAndNull(item.LandedCostINR, initialConfiguration?.NoOfDecimalForPrice)}
                      </td>
                      <td> {checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                      <td>
                        {checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice)}
                      </td>
                      {initialConfiguration?.IsShowCRMHead && <td>{item.BoughtOutPartCRMHead}</td>}
                      <td>{item.EffectiveDate ? DayTime(item?.EffectiveDate).format('DD/MM/YYYY') : '-'}</td>
                      <td>{item?.Remark}</td>
                    </tr>
                  )
                })}
              {viewBOPCost?.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  }
  const handlingChargeTableData = () => {
    return <>
      <Row>
        <Col md="12" className='mb-1'>
          <Row>
            <Col md="12">
              <div className="left-border">{IsAssemblyCosting ? `Assembly's ${showBopLabel()} Handling Charge:` : `${showBopLabel()} Handling Charge:`}</div>
            </Col>
          </Row>
          <Table className="table cr-brdr-main mb-0" size="sm">
            <thead>
              <tr>
                <th>{`${showBopLabel()} Handling Type`}</th>
                <th>{`Percentage`}</th>
                <th className="costing-border-right">{`Handling Charges`}</th>
              </tr>
            </thead>
            <tbody>
              {
                bopPHandlingCharges ?
                  <tr>
                    <td>{bopHandlingChargeType}</td>
                    <td>{bopHandlingChargeType === 'Fixed' ? '-' : bopHandlingPercentage ?? 0}</td>
                    <td>{checkForDecimalAndNull(bopPHandlingCharges, initialConfiguration?.NoOfDecimalForPrice)}</td>
                  </tr> :

                  <tr>
                    <td colSpan={7}>
                      {isPDFShow ? <div className='text-center'>0</div> : <NoContentFound title={EMPTY_DATA} />}
                    </td>
                  </tr>
              }

            </tbody>
          </Table>
        </Col>
      </Row>

      {
        IsAssemblyCosting && !partType &&
        <Row className="mx-0">
          <Col md="12" className='px-0 mb-1'>
            <br />
            <Row>
              <Col md="12">
                <div className="left-border">{`Part's ${showBopLabel()} Handling Charge:`}</div>
              </Col>
            </Row>
            <Table className="table cr-brdr-main mb-0" size="sm">
              <thead>
                <tr>
                  {IsAssemblyCosting && <th>{`Part No.`}</th>}
                  <th>{`${showBopLabel()} Handling Type`}</th>
                  <th>{`Percentage`}</th>
                  <th className="costing-border-right">{`Handling Charges`}</th>
                </tr>
              </thead>
              <tbody>
                {childPartBOPHandlingCharges &&
                  childPartBOPHandlingCharges.map((item, index) => {
                    return (
                      <tr key={index}>
                        {IsAssemblyCosting && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                        <td>{item.BOPHandlingChargeType}</td>
                        <td>{checkForDecimalAndNull(item?.BOPHandlingChargeType === 'Fixed' ? '-' : item?.BOPHandlingPercentage, initialConfiguration?.NoOfDecimalForPrice)}</td>
                        <td>{checkForDecimalAndNull(item.BOPHandlingCharges, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      </tr>
                    )
                  })}
                {childPartBOPHandlingCharges && childPartBOPHandlingCharges.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>}
    </>
  }
  return (
    <Fragment>
      {!isPDFShow ?
        <Drawer
          anchor={props.anchor}
          open={props.isOpen}
        // onClose={(e) => toggleDrawer(e)}
        >
          <Container>
            <div className={'drawer-wrapper drawer-1500px'}>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`View ${showBopLabel()} Cost:`}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>
              {bopDataTable()}
              <div>
                {handlingChargeTableData()}
              </div>

            </div>
          </Container>
        </Drawer> : <div className='mt-2'>
          {viewBOPCost.length !== 0 && bopDataTable()}
          {(childPartBOPHandlingCharges && (childPartBOPHandlingCharges.length !== 0 || bopHandlingPercentage !== 0 || bopPHandlingCharges !== 0) && handlingChargeTableData())}</div>}
    </Fragment>
  )
}

export default React.memo(ViewBOP)
