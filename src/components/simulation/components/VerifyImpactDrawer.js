import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import HeaderTitle from '../../common/HeaderTitle';
import { useDispatch, useSelector } from 'react-redux';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Fgwiseimactdata } from './FgWiseImactData'
import DayTime from '../../common/DayTimeWrapper'
import { getImpactedMasterData, getLastSimulationData } from '../actions/Simulation';
import AssemblyWiseImpact from './AssemblyWiseImpact';
import AssemblyWiseImpactSummary from './AssemblyWiseImpactSummary';


function VerifyImpactDrawer(props) {
  const { SimulationTechnologyIdState, simulationId, vendorIdState, EffectiveDate, amendmentDetails, dataForAssemblyImpactInVerifyImpact, assemblyImpactButtonTrue } = props
  const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
  const [impactedMasterDataListForImpactedMaster, setImpactedMasterDataListForImpactedMaster] = useState([])
  const [showAssemblyWise, setShowAssemblyWise] = useState(false)
  const [shown, setshown] = useState(impactedMasterDataListForImpactedMaster.length <= 0 ? true : false)
  const [fgWiseAcc, setFgWiseAcc] = useState(false)
  const lastSimulationData = useSelector(state => state.comman.lastSimulationData)
  const impactedMasterData = useSelector(state => state.comman.impactedMasterData)
  const [lastRevisionDataAccordial, setLastRevisionDataAccordial] = useState(impactedMasterDataListForLastRevisionData <= 0 ? true : false)
  const [masterIdForLastRevision, setMasterIdForLastRevision] = useState('')
  const headerName = ['Revision No.', 'Name', 'Old Cost/Pc', 'New Cost/Pc', 'Quantity', 'Impact/Pc', 'Volume/Year', 'Impact/Quarter', 'Impact/Year']
  const parentField = ['PartNumber', '-', 'PartName', '-', '-', '-', 'VariancePerPiece', 'VolumePerYear', 'ImpactPerQuarter', 'ImpactPerYear']
  const childField = ['PartNumber', 'ECNNumber', 'PartName', 'OldCost', 'NewCost', 'Quantity', 'VariancePerPiece', '-', '-', '-']

  const dispatch = useDispatch()

  const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)

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

    if (lastSimulationData) {
      setImpactedMasterDataListForLastRevisionData(lastSimulationData)
    }
    if (impactedMasterData) {
      setImpactedMasterDataListForImpactedMaster(impactedMasterData)
    }
  }, [lastSimulationData, impactedMasterData])

  useEffect(() => {
    if (vendorIdState && EffectiveDate && simulationId !== undefined) {
      dispatch(getLastSimulationData(vendorIdState, EffectiveDate, (res) => {
        setMasterIdForLastRevision(res?.data?.Data?.SimulationTechnologyId)
      }))
      dispatch(getImpactedMasterData(simulationId, () => { }))
    }

  }, [EffectiveDate, vendorIdState, simulationId])
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className="drawer-full-top"
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

              <Row >
                <Col md="12" className="mt-3">
                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Vendor :</span>
                    <span>{amendmentDetails.Vendor}</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Technology:</span>
                    <span>{amendmentDetails.Technology}</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Master:</span>
                    <span>{amendmentDetails.SimulationAppliedOn}</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Costing Head:</span>
                    <span>{amendmentDetails.CostingHead}</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Effective Date:</span>
                    <span>{DayTime(amendmentDetails.EffectiveDate).format('DD-MM-YYYY')}</span>
                  </span>

                </Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'Impacted Master Data:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setshown(!shown)} className={`${shown ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                  </div>
                </Col>
                {shown && <div className="accordian-content w-100 px-3 impacted-min-height">
                  <Impactedmasterdata data={impactedMasterDataListForImpactedMaster} masterId={SimulationTechnologyIdState} viewCostingAndPartNo={false} />
                </div>
                }
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'FG wise Impact:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setFgWiseAcc(!fgWiseAcc)} className={`${fgWiseAcc ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
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
                  />
                </Col>
              </Row>}

              {assemblyImpactButtonTrue &&
                <>
                  <Row className="mb-3 pr-0 mx-0">
                    <Col md="6"> <HeaderTitle title={'Assembly Wise Impact:'} /></Col>
                    <Col md="6">
                      <div className={'right-details'}>
                        <a onClick={() => setShowAssemblyWise(!showAssemblyWise)} className={`${showAssemblyWise ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                      </div>
                    </Col>
                    {showAssemblyWise && <div className="accordian-content w-100 px-3 impacted-min-height">
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

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'Last Revision Data:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setLastRevisionDataAccordial(!lastRevisionDataAccordial)} className={`${lastRevisionDataAccordial ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                  </div>
                </Col>
                <div className="accordian-content w-100 px-3 impacted-min-height">
                  {lastRevisionDataAccordial && <Impactedmasterdata data={impactedMasterDataListForLastRevisionData} masterId={masterIdForLastRevision} viewCostingAndPartNo={false} />}

                </div>
              </Row>


              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <button type={'button'} className="reset mr15 cancel-btn" onClick={toggleDrawer}>
                    <div className={"cancel-icon"}></div>{'Cancel'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(VerifyImpactDrawer)
