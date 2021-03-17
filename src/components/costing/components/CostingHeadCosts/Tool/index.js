import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';

function Tool(props) {

  const { IsApplicableProcessWise, data } = props;

  // const OverAllApplicability = data.OverAllApplicability;
  const ObjectForOverAllApplicability = data.CostingPartDetails && data.CostingPartDetails.CostingToolCostResponse && data.CostingPartDetails.CostingToolCostResponse[0];

  // BELOW CODE NEED TO BE USED WHEN SEPERATE OBJECT NEED FOR OVERALL APPLICABILITY
  // const defaultValues = {
  //   ToolMaintenanceCost: OverAllApplicability && OverAllApplicability.ToolMaintenanceCost !== undefined ? OverAllApplicability.ToolMaintenanceCost : '',
  //   ToolCost: OverAllApplicability && OverAllApplicability.ToolCost !== undefined ? OverAllApplicability.ToolCost : '',
  //   Life: OverAllApplicability && OverAllApplicability.Life !== undefined ? OverAllApplicability.Life : '',
  //   NetToolCost: OverAllApplicability && OverAllApplicability.NetToolCost !== undefined ? OverAllApplicability.NetToolCost : '',
  // }

  // BELOW CODE NEED TO BE USED WHEN OVERALL APPLICABILITY TREATED INSIDE GRID.
  const defaultValues = {
    ToolMaintenanceCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenanceCost !== undefined ? ObjectForOverAllApplicability.ToolMaintenanceCost : '',
    ToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCost !== undefined ? ObjectForOverAllApplicability.ToolCost : '',
    Life: ObjectForOverAllApplicability && ObjectForOverAllApplicability.Life !== undefined ? ObjectForOverAllApplicability.Life : '',
    NetToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.NetToolCost !== undefined ? ObjectForOverAllApplicability.NetToolCost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: IsApplicableProcessWise === false ? defaultValues : {},
  });

  const [gridData, setGridData] = useState(data && data.CostingPartDetails.CostingToolCostResponse)
  console.log(gridData, "GD");
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    props.setToolCost(gridData)
  }, [gridData]);

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

      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + ToolCost) / Life, 2))

      // const OverAllApplicability = {
      //   ToolMaintenanceCost: checkForNull(event.target.value),
      //   ToolCost: ToolCost,
      //   Life: Life,
      //   NetToolCost: checkForDecimalAndNull((ToolMaintenanceCost + ToolCost) / Life, 2),
      // }

      // props.setOverAllApplicabilityCost(OverAllApplicability, props.index)
      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForDecimalAndNull((ToolMaintenanceCost + ToolCost) / Life, 2),
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCost,
        "IsCostForPerAssembly": null
      }
      //if (editIndex !== '' && isEditFlag) {
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setGridData(tempArr)
      // } else {
      //   let tempArr = [...gridData, rowArray]
      //   setGridData(tempArr)
      // }

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

      setValue('NetToolCost', checkForDecimalAndNull(((ToolMaintenanceCost + ToolCost) / Life), 2))

      // const OverAllApplicability = {
      //   ToolMaintenanceCost: checkForNull(ToolMaintenanceCost),
      //   ToolCost: ToolCost,
      //   Life: Life,
      //   NetToolCost: checkForDecimalAndNull(((ToolMaintenanceCost + ToolCost) / Life), 2),
      // }
      // props.setOverAllApplicabilityCost(OverAllApplicability, props.index)

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForDecimalAndNull((ToolMaintenanceCost + ToolCost) / Life, 2),
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
      setValue('NetToolCost', checkForDecimalAndNull(((ToolMaintenanceCost + ToolCost) / Life), 2))

      // const OverAllApplicability = {
      //   ToolMaintenanceCost: checkForNull(ToolMaintenanceCost),
      //   ToolCost: ToolCost,
      //   Life: checkForNull(event.target.value),
      //   NetToolCost: checkForDecimalAndNull(((ToolMaintenanceCost + ToolCost) / Life), 2),
      // }
      // props.setOverAllApplicabilityCost(OverAllApplicability, props.index)

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForDecimalAndNull((ToolMaintenanceCost + ToolCost) / Life, 2),
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
                        //required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          //value: /^[0-9]\d*(\.\d+)?$/i,
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
                      disabled={false}
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
                        //required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          //value: /^[0-9]\d*(\.\d+)?$/i,
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
                      disabled={false}
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
                        //required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          //value: /^[0-9]\d*(\.\d+)?$/i,
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
                      disabled={false}
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

                <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'Save'}
                </button>
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