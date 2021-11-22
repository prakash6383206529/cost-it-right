import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import Drawer from '@material-ui/core/Drawer'
import { TextFieldHookForm } from '../../../layout/HookFormInputs'
import WeightCalculator from '../WeightCalculatorDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { getRawMaterialCalculationByTechnology } from '../../actions/CostWorking';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull } from '../../../../helper';
import { Container, Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import { EMPTY_GUID } from '../../../../config/constants';

function ViewRM(props) {

  const { viewRMData, rmMBDetail } = props
  /*
  * @method toggleDrawer
  * @description closing drawer
  */
  const { register, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',

  });
  const [viewRM, setViewRM] = useState(viewRMData)
  const [index, setIndex] = useState('')
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  const [calciData, setCalciData] = useState({})

  useEffect(() => {

    setViewRM(viewRMData)
  }, [])

  const dispatch = useDispatch()

  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const getWeightData = (index) => {
    setIndex(index)
    if (viewRM[index].WeightCalculationId === '00000000-0000-0000-0000-000000000000') {
      toastr.warning('Data is not avaliabe for calculator')
      return false
    }
    const tempData = viewCostingData[props.index]

    dispatch(getRawMaterialCalculationByTechnology(tempData.CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].WeightCalculationId, tempData.technologyId, res => {
      if (res && res.data && res.data.Data) {
        const data = res.data.Data
        setCalciData({ ...viewRM[index], WeightCalculatorRequest: data })
        // setViewRM(prevState => ({ ...prevState, WeightCalculatorRequest: data }))
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
          <div className={"drawer-wrapper drawer-1500px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"View RM Cost:"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>
            <Col>
              <Table className="table cr-brdr-main" size="sm">
                <thead>
                  <tr>
                    <th>{`Part No`}</th>
                    <th>{`RM Name -Grade`}</th>
                    <th>{`RM Rate`}</th>
                    <th>{`Scrap Rate`}</th>
                    <th>{`Scrap Recovery %`}</th>
                    <th>{`Gross Weight (Kg)`}</th>
                    <th>{`Finish Weight (Kg)`}</th>
                    <th>{`Calculator`}</th>
                    <th>{`Freight Cost`}</th>
                    <th>{`Shearing Cost`}</th>
                    <th>{`Burning Loss Weight`}</th>
                    <th className="costing-border-right">{`Net RM Cost`}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRM && viewRM.length > 0 && viewRM.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{'-'}</td>
                        <td>{item.RMName}</td>
                        <td>{item.RMRate}</td>
                        <td>{item.ScrapRate}</td>
                        <td>{item.ScrapRecoveryPercentage}</td>
                        <td>{item.GrossWeight}</td>
                        <td>{item.FinishWeight}</td>
                        <td><button
                          className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                          type={"button"}
                          disabled={item.WeightCalculationId === EMPTY_GUID}
                          onClick={() => { getWeightData(index) }}
                        /></td>
                        <td>{item.FreightCost ? item.FreightCost : '-'}</td>
                        <td>{item.ShearingCost ? item.ShearingCost : '-'}</td>
                        <td>{item.BurningLossWeight ? item.BurningLossWeight : '-'}</td>
                        <td>{checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice)}</td>

                      </tr>
                    )
                  })}
                  {viewRM.length === 0 && (
                    <tr>
                      <td colSpan={9}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
            {/* <form>
              <Row className="pl-3">
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="RM Name -Grade"
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
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextFieldHookForm
                    label="Scrap Rate"
                    name={"scrapRate"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={viewRM && viewRM.ScrapRate !== undefined ? viewRM.ScrapRate : '-'}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
                {
                  viewRM && viewRM.WeightCalculationId !== '00000000-0000-0000-0000-000000000000' &&

                  <div className="input-group form-group col-md-12 input-withouticon">
                    <label>Calculator</label>
                    <button
                      className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                      type={"button"}
                      onClick={() => { getWeightData() }}
                    />
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
                    defaultValue={viewRM && viewRM.GrossWeight !== undefined ? checkForDecimalAndNull(viewRM.GrossWeight, initialConfiguration.NoOfDecimalForInputOutput) : ""}
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
                    defaultValue={viewRM && viewRM.FinishWeight !== undefined ? checkForDecimalAndNull(viewRM.FinishWeight, initialConfiguration.NoOfDecimalForInputOutput) : 0}
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
                    defaultValue={viewRM && viewRM.NetLandedCost !== undefined ? checkForDecimalAndNull(viewRM.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                    className=""
                    customClassName={"withBorder"}
                    //errors={errors.ECNNumber}
                    disabled={true}
                  />
                </div>
              </Row>
            </form> */}
            {weightCalculatorDrawer && (
              <WeightCalculator
                rmRowData={viewRM !== undefined ? calciData : {}}
                anchor={`right`}
                isEditFlag={false}
                isOpen={weightCalculatorDrawer}
                closeDrawer={closeWeightDrawer}
                technology={props.technologyId}
                isSummary={true}
                rmMBDetail={rmMBDetail} // MASTER BATCH DETAIL
                CostingViewMode={true}   // THIS KEY WILL BE USE TO OPEN CALCI IN VIEW MODE
              />
            )}
          </div>
        </Container>
      </Drawer>
    </>
  );
}

export default React.memo(ViewRM)
