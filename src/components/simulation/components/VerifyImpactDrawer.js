import React, { useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import HeaderTitle from '../../common/HeaderTitle';
import { toastr } from 'react-redux-toastr';
import { checkForNull, loggedInUserId } from '../../../helper';
import { runVerifySimulation } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Fgwiseimactdata } from './FgWiseImactData'


function VerifyImpactDrawer(props) {
  const { list, technology, master, SimulationTechnologyIdState } = props
  const [token, setToken] = useState('')
  const [showverifyPage, setShowVerifyPage] = useState(false)
  const [shown, setshown] = useState(false)
  const [acc3, setAcc3] = useState(false)

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

  const verifySimulation = () => {
    let basicRateCount = 0
    let basicScrapCount = 0

    list && list.map((li) => {
      if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

        basicRateCount = basicRateCount + 1
      }
      if (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined) {
        basicScrapCount = basicScrapCount + 1
      }
      return null;
    })

    if (basicRateCount === list.length && basicScrapCount === list.length) {
      toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
      return false
    }

    // setShowVerifyPage(true)
    /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
    let obj = {}
    obj.Technology = technology
    obj.SimulationTechnologyId = selectedTechnologyForSimulation.value
    obj.Vendor = list[0].VendorName
    obj.Masters = master
    obj.LoggedInUserId = loggedInUserId()

    let tempArr = []
    list && list.map(item => {
      let tempObj = {}
      tempObj.CostingHead = item.CostingHead
      tempObj.RawMaterialName = item.RawMaterial
      tempObj.MaterialType = item.MaterialType
      tempObj.RawMaterialGrade = item.RMGrade
      tempObj.RawMaterialSpecification = item.RMSpec
      tempObj.RawMaterialCategory = item.Category
      tempObj.UOM = item.UOM
      tempObj.OldBasicRate = item.BasicRate
      tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.BasicRate
      tempObj.OldScrapRate = item.ScrapRate
      tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
      tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
      tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
      tempObj.OldNetLandedCost = item.NetLandedCost
      tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
      tempObj.EffectiveDate = item.EffectiveDate
      tempArr.push(tempObj)
      return null
    })
    obj.SimulationRawMaterials = tempArr

    dispatch(runVerifySimulation(obj, res => {

      if (res.data.Result) {
        setToken(res.data.Identity)
        setShowVerifyPage(true)
      }
    }))
  }

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
                    <span class="cr-tbl-label d-block">Vendor Name:</span>
                    <span>M/S Vendor</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Vendor Code:</span>
                    <span>12001</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Technology:</span>
                    <span>SheetMetal</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Parts Supplied:</span>
                    <span>120</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Parts Amended:</span>
                    <span>120</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Master:</span>
                    <span>RM domestic</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Costing Head:</span>
                    <span>VBC</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Effective Date:</span>
                    <span>21-06-21</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Impact for Annum(INR):</span>
                    <span>5000</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Impact for the Quarter(INR):</span>
                    <span>12500</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Reason:</span>
                    <span>Test</span>
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
                  <Impactedmasterdata data={[]} masterId={SimulationTechnologyIdState} viewCostingAndPartNo={false} />
                </div>
                }
              </Row>

              <Row className="pr-0 mx-0">
                <Col md="12"> <HeaderTitle title={'FG wise Impact:'} /></Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="12">
                  <Fgwiseimactdata />
                </Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'Last Revision Data:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setAcc3(!acc3)} className={`${acc3 ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                  </div>
                </Col>
                <div className="accordian-content w-100 px-3 impacted-min-height">
                  {acc3 && <Impactedmasterdata data={[]} masterId={SimulationTechnologyIdState} viewCostingAndPartNo={true} />}

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
