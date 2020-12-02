import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import AddBOP from '../../Drawers/AddBOP';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';

function Tool(props) {

  const { IsApplicableProcessWise, data } = props;

  const { register, handleSubmit, control, setValue, getValues, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState(data && data.CostingToolCost && data.CostingToolCost.CostingToolsCostResponse)
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    //props.setBOPCost(gridData, props.index)
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
  const handleToolMaintanenceChange = (event, index) => {
    // let tempArr = [];
    // let tempData = gridData[index];

    if (!isNaN(event.target.value)) {

      setValue('ToolMaintanenceCost', event.target.value)

      const ToolCost = getValues('ToolCost')
      const AmortizationQuantity = getValues('AmortizationQuantity')
      const NetToolCost = getValues('NetToolCost')

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
  * @method handleToolCostChange
  * @description HANDLE TOOL COST CHANGE
  */
  const handleToolCostChange = (event, index) => {
    // let tempArr = [];
    // let tempData = gridData[index];

    if (!isNaN(event.target.value)) {

      setValue('ToolMaintanenceCost', event.target.value)

      const ToolCost = getValues('ToolCost')
      const AmortizationQuantity = getValues('AmortizationQuantity')
      const NetToolCost = getValues('NetToolCost')

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
    * @method handleToolLifeChange
    * @description HANDLE TOOL LIFE CHANGE
    */
  const handleToolLifeChange = (event) => {
    // let tempArr = [];
    // let tempData = gridData[index];

    if (!isNaN(event.target.value)) {

      setValue('ToolMaintanenceCost', event.target.value)

      const ToolCost = getValues('ToolCost')
      const AmortizationQuantity = getValues('AmortizationQuantity')
      const NetToolCost = getValues('NetToolCost')

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    console.log('values >>>', values);
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
                        gridData &&
                        gridData.map((item, index) => {
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
                      name={`ToolMaintanenceCost`}
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
                      errors={errors && errors.ToolMaintanenceCost}
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
                      name={`AmortizationQuantity`}
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
                      errors={errors && errors.AmortizationQuantity}
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
                        //handleRateChange(e)
                      }}
                      errors={errors && errors.NetToolCost}
                      disabled={false}
                    />
                  </Col>
                </>
              }

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