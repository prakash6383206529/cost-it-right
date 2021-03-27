import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import AddBOP from '../../Drawers/AddBOP';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';

function BOPCost(props) {

  const { register, handleSubmit, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState(props.data)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const CostingViewMode = useContext(ViewCostingContext);

  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      props.setBOPCost(gridData, Params)
    }, 100)
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
        return {
          BoughtOutPartId: el.BoughtOutPartId,
          BOPPartNumber: el.BoughtOutPartNumber,
          BOPPartName: el.BoughtOutPartName,
          Currency: el.Currency,
          LandedCostINR: el.NetLandedCost,
          Quantity: '',
          NetBoughtOutPartCost: '',
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
      if (Ids.includes(el.BoughtOutPartId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.BoughtOutPartId)
        setIds(selectedIds)
      }
      return null;
    })
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
      const NetBoughtOutPartCost = tempData.LandedCostINR * parseInt(event.target.value);
      tempData = { ...tempData, Quantity: parseInt(event.target.value), NetBoughtOutPartCost: NetBoughtOutPartCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  const bopGridFields = 'bopGridFields';

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
          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">
                {'BOP Cost:'}
              </div>
            </Col>
            <Col md={'2'}>
              {!CostingViewMode && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD BOP</button>}
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>
              {/*BOP COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-bop-cost-section" size="sm" >
                  <thead>
                    <tr>
                      <th>{`BOP Part No.`}</th>
                      <th>{`BOP Part Name`}</th>
                      <th style={{ width: "220px" }}>{`Currency`}</th>
                      <th style={{ width: "220px" }} >{`Landed Cost(INR)`}</th>
                      <th style={{ width: "220px" }} >{`Quantity`}</th>
                      <th style={{ width: "220px" }} >{`Net BOP Cost`}</th>
                      <th style={{ width: "145px" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      gridData &&
                      gridData.map((item, index) => {
                        return (
                          editIndex === index ?
                            <tr key={index}>
                              <td>{item.BOPPartNumber}</td>
                              <td>{item.BOPPartName}</td>
                              <td>{item.Currency}</td>
                              <td>{checkForDecimalAndNull(item.LandedCostINR, 2)}</td>
                              <td style={{ width: 200 }}>
                                {
                                  <TextFieldHookForm
                                    label=""
                                    name={`${bopGridFields}[${index}]Quantity`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      //required: true,
                                      pattern: {
                                        value: /^[0-9]*$/i,
                                        //value: /^[1-9]\d*(\.\d+)?$/i,
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
                                    errors={errors && errors.bopGridFields && errors.bopGridFields[index] !== undefined ? errors.bopGridFields[index].Quantity : ''}
                                    disabled={CostingViewMode ? true : false}
                                  />
                                }
                              </td>
                              <td>{item.NetBoughtOutPartCost !== undefined ? checkForDecimalAndNull(item.NetBoughtOutPartCost, 2) : 0}</td>
                              <td>
                                {!CostingViewMode && <button className="SaveIcon mr-2" type={'button'} onClick={() => SaveItem(index)} />}
                                {!CostingViewMode && <button className="CancelIcon " type={'button'} onClick={() => CancelItem(index)} />}
                              </td>
                            </tr>
                            :
                            <tr key={index}>
                              <td>{item.BOPPartNumber}</td>
                              <td>{item.BOPPartName}</td>
                              <td>{item.Currency}</td>
                              <td>{item.LandedCostINR ? checkForDecimalAndNull(item.LandedCostINR, 2) : ''}</td>
                              <td style={{ width: 200 }}>{item.Quantity}</td>
                              <td>{item.NetBoughtOutPartCost ? checkForDecimalAndNull(item.NetBoughtOutPartCost, 2) : 0}</td>
                              <td>
                                {!CostingViewMode && <button className="Edit mr-2" type={'button'} onClick={() => editItem(index)} />}
                                {!CostingViewMode && <button className="Delete " type={'button'} onClick={() => deleteItem(index)} />}
                              </td>
                            </tr>

                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={7}>
                          <NoContentFound title={CONSTANT.EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </form>
        </div>
      </div >
      {isDrawerOpen && <AddBOP
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

export default BOPCost;