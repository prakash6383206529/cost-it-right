import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import AddOperation from '../../Drawers/AddOperation';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';

function OperationCost(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState(props.data)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    props.setOperationCost(gridData, 0)
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {

      let rowArray = rowData && rowData.map(el => {
        const WithLaboutCost = checkForNull(el.Rate) * checkForNull(el.Quantity);
        const WithOutLabourCost = el.IsLabourRateExist ? checkForNull(el.LabourRate) * el.LabourQuantity : 0;
        const OperationCost = WithLaboutCost + WithOutLabourCost;

        return {
          OperationId: el.OperationId,
          OperationName: el.OperationName,
          OperationCode: el.OperationCode,
          UOM: el.UnitOfMeasurement,
          Rate: el.Rate,
          Quantity: el.Quantity,
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          OperationCost: OperationCost,
          IsChecked: el.IsChecked,
        }
      })

      let tempArr = [...gridData, ...rowArray]
      setGridData(tempArr)
      selectedIds(tempArr)
    }
    setDrawerOpen(false)
  }

  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {
    tempArr && tempArr.map(el => {
      if (Ids.includes(el.OperationId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.OperationId)
        setIds(selectedIds)
      }
      return null;
    })
  }

  const deleteItem = (index, OperationId) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setIds(Ids && Ids.filter(item => item !== OperationId))
    setGridData(tempArr)
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    if (editIndex !== '') {
      let tempArr = Object.assign([...gridData], { [editIndex]: rowObjData })
      setGridData(tempArr)
    }
    setEditIndex(index)
    setRowObjData(tempArr)
  }

  const SaveItem = (index) => {
    setEditIndex('')
  }

  const CancelItem = (index) => {
    let tempArr = Object.assign([...gridData], { [index]: rowObjData })
    setEditIndex('')
    setGridData(tempArr)
    setRowObjData({})
  }

  const handleQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {
      const WithLaboutCost = checkForNull(tempData.Rate) * parseInt(event.target.value);
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * parseInt(tempData.LabourQuantity) : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, Quantity: parseInt(event.target.value), OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  const handleLabourQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {
      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData.Quantity);
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * parseInt(event.target.value) : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, LabourQuantity: parseInt(event.target.value), OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  const netCost = (item) => {
    const cost = checkForNull(item.Rate * item.Quantity) + checkForNull(item.LabourRate * item.LabourQuantity);
    return checkForDecimalAndNull(cost, 2);
  }

  const OperationGridFields = 'OperationGridFields';

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row>
            <Col md="10">
              <div className="left-border">
                {'Operation Cost:'}
              </div>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD OPERATION</button>
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table" size="sm" >
                <thead>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Operation Code`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Rate`}</th>
                    <th style={{ width: 200 }}>{`Quantity`}</th>
                    <th>{`Labour Rate`}</th>
                    <th>{`Labour Quantity`}</th>
                    <th>{`Net Cost`}</th>
                    <th>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData &&
                    gridData.map((item, index) => {
                      return (
                        editIndex === index ?
                          <tr key={index}>
                            <td>{item.OperationName}</td>
                            <td>{item.OperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td style={{ width: 200 }}>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${OperationGridFields}[${index}]Quantity`}
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
                                  defaultValue={item.Quantity}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleQuantityChange(e, index)
                                  }}
                                  errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].Quantity : ''}
                                  disabled={false}
                                />
                              }
                            </td>
                            <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, 2) : '-'}</td>
                            <td style={{ width: 200 }}>
                              {
                                item.IsLabourRateExist ?
                                  <TextFieldHookForm
                                    label=""
                                    name={`${OperationGridFields}[${index}]LabourQuantity`}
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
                                    defaultValue={item.LabourQuantity}
                                    className=""
                                    customClassName={'withBorder'}
                                    handleChange={(e) => {
                                      e.preventDefault()
                                      handleLabourQuantityChange(e, index)
                                    }}
                                    errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].LabourQuantity : ''}
                                    disabled={false}
                                  />
                                  :
                                  '-'
                              }
                            </td>
                            <td>{netCost(item)}</td>
                            <td>
                              <button className="SaveIcon mt15 mr-2" type={'button'} onClick={() => SaveItem(index)} />
                              <button className="CancelIcon mt15" type={'button'} onClick={() => CancelItem(index)} />
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td>{item.OperationName}</td>
                            <td>{item.OperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td style={{ width: 200 }}>{item.Quantity}</td>
                            <td style={{ width: 200 }}>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, 2) : '-'}</td>
                            <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>
                            <td>{netCost(item)}</td>
                            <td>
                              <button className="Edit mt15 mr-2" type={'button'} onClick={() => editItem(index)} />
                              <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index, item.OperationId)} />
                            </td>
                          </tr>
                      )
                    })
                  }
                  {gridData.length === 0 &&
                    <tr>
                      <td colSpan={9}>
                        <NoContentFound title={CONSTANT.EMPTY_DATA} />
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

        </div>
      </div>
      {isDrawerOpen && <AddOperation
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        Ids={Ids}
      />}
    </ >
  );
}

export default OperationCost;