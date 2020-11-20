import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddSurfaceTreatment from '../../Drawers/AddSurfaceTreatment';

function PackageCost(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState([])
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    //props.setSurfaceCost(gridData, props.index)
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
        const SurfaceTreatmentCost = WithLaboutCost + WithOutLabourCost;

        return {
          OperationId: el.OperationId,
          OperationName: el.OperationName,
          SurfaceArea: '',
          UOM: el.UnitOfMeasurement,
          RatePerUOM: el.Rate,
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          SurfaceTreatmentCost: 0,
          SurfaceTreatmentDetailsId: '',
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

  const handleSurfaceAreaChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {

      const SurfaceTreatmentCost = (checkForNull(event.target.value) * checkForNull(tempData.RatePerUOM)) + (checkForNull(tempData.LabourRate) * parseInt(tempData.LabourQuantity));
      tempData = { ...tempData, SurfaceArea: parseInt(event.target.value), SurfaceTreatmentCost: SurfaceTreatmentCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
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
                {'Surface Treatment Cost:'}
              </div>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD SURFACE TREATMENT</button>
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table" size="sm" >
                <thead>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Surface Area`}</th>
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
                            <td style={{ width: 200 }}>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${OperationGridFields}[${index}]SurfaceArea`}
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
                                  defaultValue={item.SurfaceArea}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleSurfaceAreaChange(e, index)
                                  }}
                                  errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].SurfaceArea : ''}
                                  disabled={false}
                                />
                              }
                            </td>
                            <td>
                              <button className="SaveIcon mt15 mr5" type={'button'} onClick={() => SaveItem(index)} />
                              <button className="CancelIcon mt15" type={'button'} onClick={() => CancelItem(index)} />
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td>{item.OperationName}</td>
                            <td>{item.OperationName}</td>
                            <td>
                              <button className="Edit mt15 mr5" type={'button'} onClick={() => editItem(index)} />
                              <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index, item.OperationId)} />
                            </td>
                          </tr>
                      )
                    })
                  }
                  {gridData.length === 0 &&
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

        </div>
      </div>
      {isDrawerOpen && <AddSurfaceTreatment
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

export default PackageCost;