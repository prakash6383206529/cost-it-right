import React, { useEffect, useState, useContext } from 'react'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import HeaderTitle from '../../common/HeaderTitle';
import { useDispatch, useSelector } from 'react-redux';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Fgwiseimactdata } from './FgWiseImactData'
import DayTime from '../../common/DayTimeWrapper'
import { getImpactedMasterData, getLastSimulationData } from '../actions/Simulation';
import AssemblyWiseImpactSummary from './AssemblyWiseImpactSummary';
import Toaster from '../../common/Toaster';
import NoContentFound from '../../common/NoContentFound';
import { ErrorMessage } from '../SimulationUtils';
import { VBC, VBCTypeId, CBCTypeId } from '../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';
import { simulationContext } from '.';
import { useLabels } from '../../../helper/core';


function VerifyImpactDrawer(props) {
  const { showEditMaster, costingDrawerPage, showverifyPage, handleEditMasterPage } = useContext(simulationContext) || {};
  const { vendorLabel } = useLabels()
  const { SimulationTechnologyIdState, simulationId, vendorIdState, EffectiveDate, CostingTypeId, amendmentDetails, dataForAssemblyImpactInVerifyImpact, assemblyImpactButtonTrue, costingDrawer, costingIdArray, approvalSummaryTrue, isSimulationWithCosting } = props

  const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
  const [impactedMasterDataListForImpactedMaster, setImpactedMasterDataListForImpactedMaster] = useState([])
  const [showAssemblyWise, setShowAssemblyWise] = useState(false)
  const [shown, setshown] = useState(impactedMasterDataListForImpactedMaster.length <= 0 ? true : false)
  const [fgWiseAcc, setFgWiseAcc] = useState(false)
  const lastSimulationData = useSelector(state => state.comman.lastSimulationData)
  const impactedMasterData = useSelector(state => state.comman.impactedMasterData)
  const [lastRevisionDataAcc, setLastRevisionDataAcc] = useState(false)
  const [masterIdForLastRevision, setMasterIdForLastRevision] = useState('')
  const [editWarning, setEditWarning] = useState(false)
  const [accDisable, setAccDisable] = useState(false)
  const headerName = ['Revision No.', 'Name', 'Existing Cost/Pc', 'Revised Cost/Pc', 'Quantity', 'Impact/Pc', 'Volume/Year', 'Impact/Quarter', 'Impact/Year']
  const parentField = ['PartNumber', '-', 'PartName', '-', '-', '-', 'VariancePerPiece', 'VolumePerYear', 'ImpactPerQuarter', 'ImpactPerYear']
  const childField = ['PartNumber', 'ECNNumber', 'PartName', 'ExistingCost', 'RevisedCost', 'Quantity', 'VariancePerPiece', '-', '-', '-']

  const dispatch = useDispatch()

  const toggleDrawer = (event, type = 'cancel') => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', type)
  }
  useEffect(() => {
    if (handleEditMasterPage) {

      handleEditMasterPage(showEditMaster, showverifyPage, props?.costingPage)

    }
  }, [handleEditMasterPage])
  useEffect(() => {
    let check = impactedMasterDataListForLastRevisionData?.RawMaterialImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.OperationImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.ExchangeRateImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.BoughtOutPartImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.SurfaceTreatmentImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.MachineProcessImpactedMasterDataList?.length <= 0
      && impactedMasterDataListForLastRevisionData?.CombinedProcessImpactedMasterDataList?.length <= 0
    if (lastRevisionDataAcc && check) {
      Toaster.warning('There is no data for the Last Revision.')
      setEditWarning(true)
    } else {
      setEditWarning(false)
    }
  }, [lastRevisionDataAcc, impactedMasterDataListForLastRevisionData])

  useEffect(() => {

    if (lastSimulationData) {
      setImpactedMasterDataListForLastRevisionData(lastSimulationData)
    }
    if (impactedMasterData) {
      setImpactedMasterDataListForImpactedMaster(impactedMasterData)
    }
  }, [lastSimulationData, impactedMasterData])

  useEffect(() => {
    if (vendorIdState && EffectiveDate && (CostingTypeId === VBCTypeId)) {
      dispatch(getLastSimulationData(vendorIdState, EffectiveDate, (res) => {
        setMasterIdForLastRevision(res?.data?.Data?.SimulationTechnologyId)
      }))
      if (simulationId !== undefined) {
        dispatch(getImpactedMasterData(simulationId, () => { }))
      }
    }

  }, [EffectiveDate, vendorIdState, simulationId])

  // WHEN FGWISE API IS PENDING THEN THIS CODE WILL MOUNT FOR DISABLED FGWISE ACCORDION
  const fgWiseAccDisable = (data) => {
    setAccDisable(data)
  }
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className="drawer-full-top "
      //onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            <form>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`Impact`}</h3>
                  </div>
                  <div onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>
              {
                !costingDrawer && <Row >
                  <Col md="12">
                    <Table responsive className="border impact-drawer-table sub-table">
                      <tbody>
                        <tr>
                          {CostingTypeId === CBCTypeId ? <th>Customer (Code):</th> : <th>{vendorLabel} (Code):</th>}
                          {isSimulationWithCosting ? <th>Technology:</th> : <th>Association:</th>}
                          <th>Master:</th>
                          <th>Costing Head:</th>
                          <th>Effective Date:</th>
                          <th>Impact/Quarter (w.r.t. Existing):</th>
                          <th>Impact/Quarter (w.r.t. Budgeted Price):</th>
                        </tr>
                      </tbody>
                      <tbody>
                        <tr>
                          {CostingTypeId === CBCTypeId ? <td>{amendmentDetails.CustomerName}</td> : <td>{amendmentDetails.Vendor}</td>}
                          {isSimulationWithCosting ? <td>{amendmentDetails?.Technology}</td> : <td>{'Non Associated'}</td>}
                          <td>{amendmentDetails?.SimulationAppliedOn}</td>
                          <td>{amendmentDetails?.CostingHead}</td>
                          <td>{amendmentDetails?.EffectiveDate === '' ? '-' : DayTime(amendmentDetails?.EffectiveDate).format('DD-MM-YYYY')}</td>
                          <td>{impactedMasterData?.TotalImpactPerQuarter === '' ? '-' : checkForDecimalAndNull(impactedMasterData?.TotalImpactPerQuarter, getConfigurationKey().NoOfDecimalForPrice)}</td>
                          <td>{impactedMasterData?.TotalBudgetedPriceImpactPerQuarter === '' ? '-' : checkForDecimalAndNull(impactedMasterData?.TotalBudgetedPriceImpactPerQuarter, getConfigurationKey().NoOfDecimalForPrice)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              }

              {
                !costingDrawer && <Row className="mb-3 pr-0 mx-0">
                  <Col md="6"> <HeaderTitle title={'Impacted Master Data:'} /></Col>
                  <Col md="6">
                    <div className={'right-details'}>
                      <button className="btn btn-small-primary-circle ml-1 float-right" type="button" onClick={() => { setshown(!shown) }}>
                        {shown ? (
                          <i className="fa fa-minus"></i>
                        ) : (
                          <i className="fa fa-plus"></i>
                        )}
                      </button>
                    </div>
                  </Col>
                  {shown && <div className="accordian-content w-100 px-3 impacted-min-height">
                    <Impactedmasterdata data={impactedMasterDataListForImpactedMaster} masterId={SimulationTechnologyIdState} viewCostingAndPartNo={false} lastRevision={false} />
                  </div>
                  }
                </Row>
              }
              <Row className="mb-3 pr-0 mx-0">
                <Col md="12">
                  {fgWiseAcc && <ErrorMessage isGreen={true} />}
                </Col>

                <Col md="6"> <HeaderTitle title={'FG wise Impact:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <button className="btn btn-small-primary-circle ml-1 float-right" disabled={accDisable} type="button" onClick={() => { setFgWiseAcc(!fgWiseAcc) }}>
                      {fgWiseAcc ? (
                        <i className="fa fa-minus"></i>
                      ) : (
                        <i className="fa fa-plus"></i>
                      )}
                    </button>
                  </div>
                </Col>
              </Row>

              {
                fgWiseAcc && <Row className="mb-3 pr-0 mx-0">
                  <Col md="12">
                    <Fgwiseimactdata
                      SimulationId={simulationId}
                      costingIdArray={costingIdArray}
                      approvalSummaryTrue={approvalSummaryTrue}
                      isVerifyImpactDrawer={true}
                      fgWiseAccDisable={fgWiseAccDisable}
                      tooltipEffectiveDate={DayTime(amendmentDetails.EffectiveDate).format('DD-MM-YYYY')}
                      isSimulation={props?.isSimulation}
                      isCosting={props?.isCosting}
                    />
                  </Col>
                </Row>
              }

              {
                assemblyImpactButtonTrue &&
                <>
                  <Row className="mb-3 pr-0 mx-0">
                    <Col md="6"> <HeaderTitle title={'Assembly Wise Impact:'} /></Col>
                    <Col md="6">
                      <div className={'right-details'}>
                        <button className="btn btn-small-primary-circle ml-1 float-right" type="button" onClick={() => { setShowAssemblyWise(!showAssemblyWise) }}>
                          {showAssemblyWise ? (
                            <i className="fa fa-minus"></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </div>
                    </Col>
                    {showAssemblyWise && <div className="accordian-content w-100 px-3">
                      <AssemblyWiseImpactSummary
                        dataForAssemblyImpact={dataForAssemblyImpactInVerifyImpact}
                        impactType={'AssemblySummary'}
                        isPartImpactAssembly={false}
                        customClass="verify-drawer"
                        isImpactDrawer={true}
                      />
                    </div>
                    }
                  </Row>
                </>
              }
              {
                (CostingTypeId === VBCTypeId) && <>
                  <Row className="mb-3 pr-0 mx-0">
                    <Col md="6"> <HeaderTitle title={'Last Revision Data:'} /></Col>
                    <Col md="6">
                      <div className={'right-details'}>
                        <button className="btn btn-small-primary-circle ml-1 float-right" type="button" onClick={() => { setLastRevisionDataAcc(!lastRevisionDataAcc) }}>
                          {lastRevisionDataAcc ? (
                            <i className="fa fa-minus"></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </div>
                    </Col>
                    <div className="accordian-content w-100 px-3 impacted-min-height">
                      {lastRevisionDataAcc && <Impactedmasterdata data={impactedMasterDataListForLastRevisionData} masterId={masterIdForLastRevision} viewCostingAndPartNo={false} lastRevision={true} />}
                      <div align="center">
                        {editWarning && <NoContentFound title={"There is no data for the Last Revision."} />}
                      </div>
                      {/* {costingDrawer && lastRevisionDataAcc && <div align="center">
                    <NoContentFound title={"There is no data for the Last Revision."} />
                  </div>} */}
                    </div>
                  </Row>
                </>
              }
            </form >
          </div >
        </Container >
      </Drawer >
    </>
  )
}

export default React.memo(VerifyImpactDrawer)
