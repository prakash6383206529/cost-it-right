import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';
import { setComponentToolItemData } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';

function Tool(props) {

  const { IsApplicableProcessWise, data } = props;
  const dispatch = useDispatch();

  const ObjectForOverAllApplicability = data.CostingPartDetails && data.CostingPartDetails.CostingToolCostResponse && data.CostingPartDetails.CostingToolCostResponse[0];

  // BELOW CODE NEED TO BE USED WHEN OVERALL APPLICABILITY TREATED INSIDE GRID.
  const defaultValues = {
    ToolMaintenanceCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenanceCost !== undefined ? ObjectForOverAllApplicability.ToolMaintenanceCost : '',
    ToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCost !== undefined ? ObjectForOverAllApplicability.ToolCost : '',
    Life: ObjectForOverAllApplicability && ObjectForOverAllApplicability.Life !== undefined ? ObjectForOverAllApplicability.Life : '',
    NetToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.NetToolCost !== undefined ? ObjectForOverAllApplicability.NetToolCost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: (IsApplicableProcessWise === false || IsApplicableProcessWise === null) ? defaultValues : {},
  });

  const [gridData, setGridData] = useState(data && data.CostingPartDetails.CostingToolCostResponse.length > 0 ? data.CostingPartDetails.CostingToolCostResponse : [])
  const [OldGridData, setOldGridData] = useState(data && data.CostingPartDetails.CostingToolCostResponse.length > 0 ? data.CostingPartDetails.CostingToolCostResponse : [])
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  useEffect(() => {
    props.setToolCost(gridData, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)
  }, [gridData]);

  useEffect(() => {
    dispatch(setComponentToolItemData(data, () => { }))
  }, [data && data.CostingPartDetails.CostingToolCostResponse])

  /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let rowArray = {
        ToolOperationId: rowData.ToolOperationId,
        ProcessOrOperation: rowData.ProcessOrOperation,
        ToolCategory: rowData.ToolCategory,
        ToolName: rowData.ToolName,
        Quantity: rowData.Quantity,
        ToolCost: rowData.ToolCost,
        Life: rowData.Life,
        TotalToolCost: rowData.TotalToolCost,
      }
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowArray })
        setGridData(tempArr)
      } else {
        let tempArr = [...gridData, rowArray]
        setGridData(tempArr)
      }
    }
    setDrawerOpen(false)
  }

  const deleteItem = (index) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    setEditIndex(index)
    setIsEditFlag(true)
    setRowObjData(tempArr)
    setDrawerOpen(true)
  }

  /**
  * @method handleToolMaintanenceChange
  * @description HANDLE TOOL MAINTANENCE CHANGE
  */
  const handleToolMaintanenceChange = (event) => {

    if (!isNaN(event.target.value)) {
      setValue('ToolMaintenanceCost', event.target.value)

      const ToolMaintenanceCost = checkForNull(event.target.value)
      const ToolCost = checkForNull(getValues('ToolCost'));
      const Life = checkForNull(getValues('Life'))

      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice),
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCost,
        "IsCostForPerAssembly": null
      }

      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setTimeout(() => {
        setGridData(tempArr)
      }, 200)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
  * @method handleToolCostChange
  * @description HANDLE TOOL COST CHANGE
  */
  const handleToolCostChange = (event) => {

    if (!isNaN(event.target.value)) {

      setValue('ToolCost', event.target.value)

      const ToolMaintenanceCost = checkForNull(getValues('ToolMaintenanceCost'))
      const ToolCost = checkForNull(event.target.value);
      const Life = checkForNull(getValues('Life'))

      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice),
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCost,
        "IsCostForPerAssembly": null
      }
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
    * @method handleToolLifeChange
    * @description HANDLE TOOL LIFE CHANGE
    */
  const handleToolLifeChange = (event) => {

    if (!isNaN(event.target.value)) {

      setValue('Life', event.target.value)
      const ToolMaintenanceCost = checkForNull(getValues('ToolMaintenanceCost'))
      const ToolCost = checkForNull(getValues('ToolCost'));
      const Life = checkForNull(event.target.value)
      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice),
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCost,
        "IsCostForPerAssembly": null
      }
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    props.saveCosting(values)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>

          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>

              {/* BELOW CONDITION RENDER WHEN APPLICABILITY IS PROCESS WISE */}
              {IsApplicableProcessWise &&
                <Col md="12">
                  <Table className="table" size="sm" >
                    <thead>
                      <tr>
                        <th>{`Process/Operation`}</th>
                        <th>{`Tool Category`}</th>
                        <th>{`Name`}</th>
                        <th style={{ width: 200 }}>{`Quantity`}</th>
                        <th>{`Tool Cost`}</th>
                        <th>{`Life`}</th>
                        <th>{`Net Tool Cost`}</th>
                        <th>{`Action`}</th>
                      </tr>
                    </thead>
                    <tbody >

                      {
                        gridData && gridData.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.ProcessOrOperation}</td>
                              <td>{item.ToolCategory}</td>
                              <td>{item.ToolName}</td>
                              <td style={{ width: 200 }}>{item.Quantity}</td>
                              <td>{item.ToolCost}</td>
                              <td>{item.Life}</td>
                              <td>{item.TotalToolCost ? checkForDecimalAndNull(item.TotalToolCost, 2) : 0}</td>
                              <td>
                                <button className="Edit mt15 mr-2" type={'button'} onClick={() => editItem(index)} />
                                <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                              </td>
                            </tr>
                          )
                        })
                      }

                      {gridData && gridData.length === 0 &&
                        <tr>
                          <td colSpan={8}>
                            <NoContentFound title={CONSTANT.EMPTY_DATA} />
                          </td>
                        </tr>
                      }

                    </tbody>
                  </Table>
                </Col>}


              {/* BELOW CONDITION RENDER WHEN APPLICABILITY IS OVERALL */}
              {!IsApplicableProcessWise &&
                <>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Tool Maintanence Cost"
                      name={`ToolMaintenanceCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolMaintanenceChange(e)
                      }}
                      errors={errors && errors.ToolMaintenanceCost}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Tool Cost"
                      name={`ToolCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolCostChange(e)
                      }}
                      errors={errors && errors.ToolCost}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Amortization Quantity(Tool Life)"
                      name={`Life`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolLifeChange(e)
                      }}
                      errors={errors && errors.Life}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Net Tool Cost"
                      name={`NetToolCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        //handleRateChange(e)
                      }}
                      errors={errors && errors.NetToolCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between mt25 tab-tool-cost-footer">
              <div className="col-sm-12 text-right bluefooter-butn">

                {!CostingViewMode && <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'Save'}
                </button>}
              </div>
            </Row>
          </form>
        </div>
      </div >

      {isDrawerOpen && <AddTool
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={isEditFlag}
        ID={''}
        editIndex={editIndex}
        rowObjData={rowObjData}
        anchor={'right'}
      />}

    </ >
  );
}

export default Tool;