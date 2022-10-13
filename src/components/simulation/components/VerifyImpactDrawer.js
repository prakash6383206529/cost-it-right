import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
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
import { VBC, VBCTypeId } from '../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';


function VerifyImpactDrawer(props) {
  const { SimulationTechnologyIdState, simulationId, vendorIdState, EffectiveDate, amendmentDetails, dataForAssemblyImpactInVerifyImpact, assemblyImpactButtonTrue, costingDrawer, TypeOfCosting } = props
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
  const headerName = ['Revision No.', 'Name', 'Old Cost/Pc', 'New Cost/Pc', 'Quantity', 'Impact/Pc', 'Volume/Year', 'Impact/Quarter', 'Impact/Year']
  const parentField = ['PartNumber', '-', 'PartName', '-', '-', '-', 'VariancePerPiece', 'VolumePerYear', 'ImpactPerQuarter', 'ImpactPerYear']
  const childField = ['PartNumber', 'ECNNumber', 'PartName', 'OldCost', 'NewCost', 'Quantity', 'VariancePerPiece', '-', '-', '-']

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
    let check = impactedMasterDataListForLastRevisionData?.RawMaterialImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.OperationImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.ExchangeRateImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.BoughtOutPartImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.MachineProcessImpactedMasterDataList <= 0
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
    if (vendorIdState && EffectiveDate && (TypeOfCosting === VBCTypeId || TypeOfCosting === 1)) {
      dispatch(getLastSimulationData(vendorIdState, EffectiveDate, (res) => {
        setMasterIdForLastRevision(res?.data?.Data?.SimulationTechnologyId)
      }))
      if (simulationId !== undefined) {
        dispatch(getImpactedMasterData(simulationId, () => { }))
      }
    }

  }, [EffectiveDate, vendorIdState, simulationId])
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

              {!costingDrawer && <Row >
                <Col md="12">
                  <div className="border impact-drawer-header">
                    <span class=" mr-2">
                      <span class="grey-text d-block">Vendor :</span>
                      <span>{amendmentDetails.Vendor}</span>
                    </span>

                    <span class=" mr-2 pl-3">
                      <span class="grey-text d-block">Technology:</span>
                      <span>{amendmentDetails.Technology}</span>
                    </span>

                    <span class=" mr-2 pl-3">
                      <span class="grey-text d-block">Master:</span>
                      <span>{amendmentDetails.SimulationAppliedOn}</span>
                    </span>

                    <span class=" mr-2 pl-3">
                      <span class="grey-text d-block">Costing Head:</span>
                      <span>{amendmentDetails.CostingHead}</span>
                    </span>

                    <span class=" mr-2 pl-3">
                      <span class="grey-text d-block">Effective Date:</span>
                      <span>{amendmentDetails.EffectiveDate === '' ? '-' : DayTime(amendmentDetails.EffectiveDate).format('DD-MM-YYYY')}</span>
                    </span>

                    <span class=" mr-2 pl-3">
                      <span class="grey-text d-block">Impact for Quarter(INR):</span>
                      <span>{amendmentDetails.TotalImpactPerQuarter === '' ? '-' : checkForDecimalAndNull(amendmentDetails.TotalImpactPerQuarter, getConfigurationKey().NoOfDecimalForPrice)}</span>
                    </span>

                  </div>
                </Col>
              </Row>}

              {!costingDrawer && <Row className="mb-3 pr-0 mx-0">
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
              </Row>}

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'FG wise Impact:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <button className="btn btn-small-primary-circle ml-1 float-right" type="button" onClick={() => { setFgWiseAcc(!fgWiseAcc) }}>
                      {fgWiseAcc ? (
                        <i className="fa fa-minus"></i>
                      ) : (
                        <i className="fa fa-plus"></i>
                      )}
                    </button>
                  </div>
                </Col>
              </Row>

              {fgWiseAcc && <Row className="mb-3 pr-0 mx-0">
                <Col md="12">
                  <Fgwiseimactdata
                    // DisplayCompareCosting={DisplayCompareCosting}
                    // SimulationId={simulationDetail.SimulationId}
                    headerName={headerName}
                    parentField={parentField}
                    childField={childField}
                    impactType={'FgWise'}
                    tooltipEffectiveDate={DayTime(amendmentDetails.EffectiveDate).format('DD-MM-YYYY')}
                  />
                </Col>
              </Row>}

              {assemblyImpactButtonTrue &&
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
              {(TypeOfCosting === VBC || TypeOfCosting === 1) && <>
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
              </>}
            </form>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(VerifyImpactDrawer)
