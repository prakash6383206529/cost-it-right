import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from "react-hook-form";
import Drawer from '@material-ui/core/Drawer'
import { TextFieldHookForm } from '../../../layout/HookFormInputs'
//import Pipe from '../WeightCalculatorDrawer/Pipe';
import WeightCalculator from '../WeightCalculatorDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { getRawMaterialCalculationByTechnology } from '../../actions/CostWorking';
import { toastr } from 'react-redux-toastr';


function ViewRM(props) {

  const { viewRMData } = props
  /*
  * @method toggleDrawer
  * @description closing drawer
  */
  const { register, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',

  });
  const [viewRM, setViewRM] = useState({})
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  useEffect(() => {
    const [rm] = viewRMData
    setViewRM(rm)
  }, [])

  const dispatch = useDispatch()

  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  //WeightCalculatorRequest

  const getWeightData = () => {
    if (viewRM.WeightCalculationId === '00000000-0000-0000-0000-000000000000') {
      toastr.warning('Data is not avaliabe for calculator')
      return false
    }
    const tempData = viewCostingData[props.index]

    dispatch(getRawMaterialCalculationByTechnology(tempData.CostingId, tempData.netRMCostView[0].RawMaterialId, tempData.netRMCostView[0].WeightCalculationId, tempData.technologyId, res => {
      if (res && res.data && res.data.Data) {
        const data = res.data.Data
        setViewRM(prevState => ({ ...prevState, WeightCalculatorRequest: data }))
        setWeightCalculatorDrawer(true)
        // tempData = { ...tempData, WeightCalculatorRequest: data, }
        // tempArr = Object.assign([...gridData], { [index]: tempData })
        // setTimeout(() => {
        //   setGridData(tempArr)
        //   setWeightDrawerOpen(true)
        // }, 100)
      }
    }))

  }

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }
  /**
   * @method closeWeightDrawer
   * @description CLOSING WEIGHT DRAWER
  */
  const closeWeightDrawer = (e = "") => {
    setWeightCalculatorDrawer(false)
  }
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"RM:"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>
            <form>
              <Row className="pl-3">
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="RM Name"
                    name={"rmName"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    //defaultValue={`${viewRM[0].RMName}`}
                    defaultValue={viewRM && viewRM.RMName !== undefined ? viewRM.RMName : '-'}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="RM Rate"
                    name={"rmRate"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={viewRM && viewRM.RMRate !== undefined ? viewRM.RMRate : '-'}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
                {
                  viewRM && viewRM.WeightCalculationId !== '00000000-0000-0000-0000-000000000000' &&

                  <div className="input-group form-group col-md-12 input-withouticon">
                    <h5>
                      Calculator
                      <br />
                      <button
                        className="CalculatorIcon cr-cl-icon mt15"
                        type={"button"}
                        onClick={() => { getWeightData() }}
                      />
                    </h5>
                  </div>
                }
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="Gross Weight(Kg)"
                    name={"grossweight"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={viewRM && viewRM.GrossWeight !== undefined ? viewRM.GrossWeight : ""}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="Finish Weight(Kg)"
                    name={"finishWeight"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={viewRM && viewRM.FinishWeight !== undefined ? viewRM.FinishWeight : ""}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="Net RM Cost"
                    name={"netRMCost"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={viewRM && viewRM.NetLandedCost !== undefined ? viewRM.NetLandedCost : "-"}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
              </Row>
            </form>
            {weightCalculatorDrawer && (
              <WeightCalculator
                rmRowData={viewRM !== undefined ? viewRM : {}}
                anchor={`right`}
                isEditFlag={false}
                isOpen={weightCalculatorDrawer}
                closeDrawer={closeWeightDrawer}
                technology={props.technologyId}
              />
            )}
          </div>
        </Container>
      </Drawer>
    </>
  );
}

export default React.memo(ViewRM)
