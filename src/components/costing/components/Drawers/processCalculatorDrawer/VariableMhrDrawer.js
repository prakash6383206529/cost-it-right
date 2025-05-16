import React from 'react'
import { Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import Facing from './Facing'
import UomTimeProcessDefaultCalculator from './UomTimeProcessDefaultCalculator'
import SheetMetalBaicDrawer from './SheetMetalBaicDrawer'
import { SHEETMETAL, PLASTIC, MACHINING, Non_Ferrous_HPDC, BROACHING } from '../../../../../config/masterData'
import { TIME } from '../../../../../config/constants'
import Broaching from './Broaching'


function VariableMhrDrawer(props) {
  const { technology, calculatorData, item } = props

  const tonnage = calculatorData.Tonnage ? calculatorData.Tonnage : ''
  const calculateMachineTime = (time, formValue) => {

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
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    props.closeDrawer('', formValue, weightData)
  }

  const getProcessComponent = (process) => {
    if (technology === MACHINING) {
      if (calculatorData.UOMType === TIME) {
        if (process.toLowerCase().includes('extrusion')) {
          return (
            <SheetMetalBaicDrawer
              CostingViewMode={props.CostingViewMode}
              calculateMachineTime={calculateMachineTime}
              tonnage={tonnage}
              item={item}
              rmFinishWeight={props?.calculatorData?.Quantity || ''} // Pass Gross Weight instead of Net Weight.
              calculatorData={calculatorData}
            />
          );
        }
        switch (process) {

          case BROACHING:
            return (
              <Broaching
                CostingViewMode={props.CostingViewMode}
                calculateMachineTime={calculateMachineTime}
                item={item}
                technology={technology}
                calculatorData={calculatorData}
              />
            )
          default:
            return (
              <UomTimeProcessDefaultCalculator
                CostingViewMode={props.CostingViewMode}
                calculateMachineTime={calculateMachineTime}
                tonnage={tonnage}
                item={item}
                rmFinishWeight={props.rmFinishWeight}
                calculatorData={calculatorData}
              />
            )
        }
      } else {
        return (
          <SheetMetalBaicDrawer
            CostingViewMode={props.CostingViewMode}
            calculateMachineTime={calculateMachineTime}
            tonnage={tonnage}
            item={item}
            rmFinishWeight={props?.calculatorData?.Quantity || ''} // Pass Gross Weight instead of Net Weight.
            calculatorData={calculatorData}
          />
        )
      }
    } else if (technology === SHEETMETAL) {

      switch (process) {
        case 'Facing':
          return (
            <Facing
              CostingViewMode={props.CostingViewMode}
              calculateMachineTime={calculateMachineTime}
              technology={technology}
              item={item}
              calculatorData={calculatorData}
            />
          )
        default:
          return (
            <SheetMetalBaicDrawer
              CostingViewMode={props.CostingViewMode}
              calculateMachineTime={calculateMachineTime}
              tonnage={tonnage}
              item={item}
              rmFinishWeight={props?.calculatorData?.Quantity || ''} // Pass Gross Weight instead of Net Weight.
              calculatorData={calculatorData}
            />
          )
      }
    } else if (technology === PLASTIC) {
      switch (process) {
        // case 'Injection Moulding':
        // return (
        //   <InjectionMoulding calculateMachineTime={calculateMachineTime} calculatorData={calculatorData} />
        // )
        // break;
        default:
          return (
            <SheetMetalBaicDrawer
              CostingViewMode={props.CostingViewMode}
              calculateMachineTime={calculateMachineTime}
              tonnage={tonnage}
              item={item}
              rmFinishWeight={props?.calculatorData?.Quantity || ''} // Pass Gross Weight instead of Net Weight.
              calculatorData={calculatorData}
            />
          )

      }
    } else {
      return (
        <SheetMetalBaicDrawer
          CostingViewMode={props.CostingViewMode}
          calculateMachineTime={calculateMachineTime}
          tonnage={tonnage}
          item={item}
          rmFinishWeight={props?.calculatorData?.Quantity || ''} // Pass Gross Weight instead of Net Weight.
          calculatorData={calculatorData}
        />
      )
    }
  }


  return (
    <div>
      <Drawer
        className="drawer-md calculator-drawer"
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <div className="container-fluid">
          <div className={'drawer-wrapper drawer-md'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Process Calculator'}</h3>
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
                  <span className="cr-tbl-label d-block">Machine Name:</span>
                  <span>{calculatorData.MachineName ? calculatorData.MachineName : '-'}</span>
                </span>
                <span className="d-inline-block mr-4 mb-3">
                  <span className="cr-tbl-label d-block">Machine Rate:</span>
                  <span>{calculatorData.MHR}</span>
                </span>
                <span className="d-inline-block mr-4 mb-3 pr-3">
                  <span className="cr-tbl-label d-block">UOM:</span>
                  <span>{calculatorData.UOM}</span>
                </span>
              </Col>
              <div className="w-100 px-3">
                {getProcessComponent(calculatorData.ProcessName)}
              </div>
            </Row>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default VariableMhrDrawer
