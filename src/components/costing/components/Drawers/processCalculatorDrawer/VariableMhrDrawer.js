import React from 'react'
import { Row, Col, Container } from 'reactstrap'

import Drawer from '@material-ui/core/Drawer'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import Facing from './Facing'
import Drilling from './Drilling'
import Turning from './Turning'
import Chamfering from './Chamfering'
import FaceMilling from './FaceMilling'
import SideFaceMiling from './SideFaceMiling'
import SlotCutting from './SlotCutting'
import ChamferingMiller from './ChamferingMiller'
import EndMill from './EndMill'
import { useDispatch } from 'react-redux'
import { saveProcessCostCalculationData } from '../../../actions/ProcessCost'
import { toastr } from 'react-redux-toastr'
import SheetMetalBaicDrawer from './SheetMetalBaicDrawer'
import InjectionMoulding from './InjectionMoulding'

function VariableMhrDrawer(props) {
  const { technology, calculatorData } = props
  console.log(calculatorData, 'Process')
  const tonnage = calculatorData.Tonnage ? calculatorData.Tonnage : ''
  const dispatch = useDispatch()
  const calculateMachineTime = (time, formValue) => {
    console.log('Form Value in drawer', time)
    //   let obj={}
    //    obj.TurningDiameter = formValue.turningDiameter,
    //    obj.FinishDiameter = formValue.finishDiameter,
    //   obj.CutLength= formValue.cutLength,
    //   obj.RemovedMaterial= formValue.removedMaterial,
    //   obj.Rpm= formValue.rpm,
    //   obj.FeedRev= formValue.feedRev,
    //   obj.FeedMin= formValue.feedMin,
    //   obj.CutTime=formValue.cutTime,
    //   obj.NumberOfPasses=formValue.numberOfPasses,
    //   obj.ClampingPercentage= formValue.clampingPercentage,
    //   obj.ClampingValue=formValue.clampingValue,
    //   obj.CutterDiameter=formValue.cutterDiameter,
    //   obj.CutLengthOfArea=formValue.cutLengthOfArea,
    //   obj.AreaWidth=formValue.areaWidth,
    //   obj.SlotNo=formValue.slotNo,
    //   obj.CutLength=formValue.cutLength,
    //   obj.TurningLength=formValue.turningLength,
    //   obj.RemovedMaterial=formValue.removedMaterial,
    //   obj.Doc=formValue.doc,
    //   obj.CuttingSpeed=formValue.cuttingSpeed,
    //   obj.ToothFeed=formValue.toothFeed,

    // dispatch(
    //   saveProcessCostCalculationData(obj, () => {
    //     if (res.Data.result) {
    //       toastr.success('Calculation data saved successfully!')
    //     }
    //   }),
    // )
    toggleDrawer('', time, formValue)
  }
  /**
   * @method toggleDrawer
   * @description TOGGLE DRAWER
   */
  const toggleDrawer = (event, formValue = '0.00', weightData = {}) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', formValue, weightData)
  }
  const getProcessComponent = (process) => {
    console.log('Entered in switch case')
    if (technology === 'Machining') {
      switch (process) {
        case 'Facing':
          return (
            <Facing
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Drilling':
          return (
            <Drilling
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Turning':
          return (
            <Turning
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Chamfering':
          return (
            <Chamfering
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Face Milling':
          return (
            <FaceMilling
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Side face Miling':
          return (
            <SideFaceMiling
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Slot Cutting':
          return (
            <SlotCutting
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'Chamfering Miller':
          return (
            <ChamferingMiller
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        case 'End Mill':
          return (
            <EndMill
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        default:
          break;
      }
    } else if (technology === 'Sheet Metal') {
      switch (process) {
        case 'Facing':
          return (
            <Facing
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              calculatorData={calculatorData}
            />
          )
        default:
          return (
            <SheetMetalBaicDrawer
              calculateMachineTime={calculateMachineTime}
              tonnage={tonnage}
              calculatorData={calculatorData}
            />
          )
      }
    } else if (technology === 'Plastic') {
      switch (process) {
        case 'Injection Moulding':
          return (
            <InjectionMoulding calculateMachineTime={calculateMachineTime} calculatorData={calculatorData} />
          )
        default:
          break;
      }
    }
  }

  return (
    <div>
      <Drawer
        className="drawer-md calculator-drawer"
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <div className="container-fluid">
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Calculator'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            <Row>
              <Col md="12" className={'mt-2'}>
                <span className="d-inline-block mr-4 mb-3 pl-3">
                  <span className="cr-tbl-label d-block">Process Name:</span>
                  <span>{calculatorData.ProcessName}</span>
                </span>
                <span className="d-inline-block mr-4 mb-3">
                  <span className="cr-tbl-label d-block">
                    Process Description:
                  </span>
                  <span>{calculatorData.ProcessDescription}</span>
                </span>
                <span className="d-inline-block mr-4 mb-3">
                  <span className="cr-tbl-label d-block">Machine Name:</span>
                  <span>{calculatorData.MachineName}</span>
                </span>
                <span className="d-inline-block mr-4 mb-3">
                  <span className="cr-tbl-label d-block">Machine Rate:</span>
                  <span>{calculatorData.MachineRate}</span>
                </span>
                <span className="d-inline-block mr-4 mb-3 pr-3">
                  <span className="cr-tbl-label d-block">UOM:</span>
                  <span>{calculatorData.UOM}</span>
                </span>
              </Col>
              <div className="w-100">
                {getProcessComponent('Facing')}
              </div>
            </Row>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default VariableMhrDrawer
