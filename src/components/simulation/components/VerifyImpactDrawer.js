import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import HeaderTitle from '../../common/HeaderTitle';
import { useDispatch, useSelector } from 'react-redux';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Fgwiseimactdata } from './FgWiseImactData'
import DayTime from '../../common/DayTimeWrapper'
import {  getImpactedMasterData, getLastSimulationData } from '../actions/Simulation';


function VerifyImpactDrawer(props) {
  const { SimulationTechnologyIdState, simulationId, vendorIdState, EffectiveDate, amendmentDetails } = props
  const [shown, setshown] = useState(false)
  const [id, setId] = useState('')
  const [compareCostingObj, setCompareCostingObj] = useState([])
  const [simulationTechnologyIdOfRevisionData, setSimulationTechnologyIdOfRevisionData] = useState("")
  const [lastRevisionData, SetLastRevisionData] = useState([])
  const [lastRevisionDataAccordial, setLastRevisionDataAccordial] = useState(false)
  const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
  const [impactedMasterDataListForImpactedMaster, setImpactedMasterDataListForImpactedMaster] = useState([])
  const lastSimulationData = useSelector(state => state.comman.lastSimulationData)
  const impactedMasterData = useSelector(state => state.comman.impactedMasterData)

  const dispatch = useDispatch()


  const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)
  useEffect(() => {
    // dispatch(getFgWiseImpactData(simulationId, () => { }))

  }, [])


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
      dispatch(getLastSimulationData(vendorIdState, EffectiveDate, res => {
        const masterId = res.data.Data.SimulationTechnologyId;

        if (res) {
          setSimulationTechnologyIdOfRevisionData(masterId)
          SetLastRevisionData(res.data.Data.ImpactedMasterDataList)
        }

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

              <Row className="pr-0 mx-0">
                <Col md="12"> <HeaderTitle title={'FG wise Impact:'} /></Col>
              </Row>
              <Row className="mb-3 pr-0 mx-0">
                <Col md="12">
                  <Fgwiseimactdata SimulationId={simulationId} />
                </Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'Last Revision Data:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setLastRevisionDataAccordial(!lastRevisionDataAccordial)} className={`${lastRevisionDataAccordial ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                  </div>
                </Col>
                <div className="accordian-content w-100 px-3 impacted-min-height">
                  {lastRevisionDataAccordial && <Impactedmasterdata data={impactedMasterDataListForLastRevisionData} masterId={simulationTechnologyIdOfRevisionData} viewCostingAndPartNo={false} />}

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
