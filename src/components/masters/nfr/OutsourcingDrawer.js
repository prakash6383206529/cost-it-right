import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { NumberFieldHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { EMPTY_DATA } from '../../../config/constants';
import { checkForDecimalAndNull, checkWhiteSpaces, number, decimalNumberLimit6, loggedInUserId } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import Toaster from '../../common/Toaster';
import { getNFRCostingOutsourcingDetails, saveOutsourcingData } from './actions/nfr';

function OutsourcingDrawer(props) {

  const { register, handleSubmit, formState: { errors }, control, getValues, setValue } = useForm();

  const { viewMode } = props
  const [description, setDescription] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [gridData, setgridData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const dispatch = useDispatch()

  const dataDescription = [
    { label: 'Coating', value: 'Coating' },
    { label: 'Plating', value: 'Plating' },
    { label: 'Anodizing', value: 'Anodizing' },
    { label: 'Polishing', value: 'Polishing' },
    { label: 'Cleaning', value: 'Cleaning' },
    { label: 'Treatment', value: 'Treatment' },
    { label: 'Etching', value: 'Etching' },
    { label: 'Texturing', value: 'Texturing' },
  ]

  useEffect(() => {
    if (props?.CostingId || props?.outsourcingCostingData?.NfrRawMaterialAndBoughtOutPartDetailId) {
      dispatch(getNFRCostingOutsourcingDetails(props?.CostingId, props?.outsourcingCostingData?.NfrRawMaterialAndBoughtOutPartDetailId, (res) => {
        if (res?.data?.Data > 0 || res?.status === 200) {
          let data = res?.data?.Data
          const mappedArray = data.NFRCostingOutsourcingDetails.map(detail => ({
            Description: {
              label: detail.OutsourcingName,
              value: detail.OutsourcingName
            },
            Cost: detail.OutsourcingRate
          }));
          setTotalCost(data?.OutsourcingCost)
          setgridData(mappedArray)
        }
      }))
    }
  }, []);

  /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
  const renderListing = (label) => {
    const temp = [];

    if (label === 'Description') {
      dataDescription && dataDescription.map(item => {
        temp.push({ label: item.label, value: item.value })
        return null;
      });
      return temp;
    }
  }

  /**
  * @method handlePlantChange
  * @description  USED TO HANDLE PLANT CHANGE
  */
  const handleDescriptionChange = (newValue) => {
    if (newValue && newValue !== '') {
      setDescription(newValue)
    } else {
      setDescription([])
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer('cancel')
  }

  const onSubmit = data => {
    let list = [...gridData]
    if (list?.length === 0) {
      Toaster.warning("Please enter at least one record.")
      return false
    }
    let datalist = mapGrid(list)
    let req = {
      BaseCostingId: props?.CostingId ? props?.CostingId : null,
      LoggedInUserId: loggedInUserId(),
      OutsourcingCost: totalCost,
      NfrRawMaterialAndBoughtOutPartDetailId: props?.outsourcingCostingData?.NfrRawMaterialAndBoughtOutPartDetailId,
      NFRCostingOutsourcingDetails: datalist,
    }
    dispatch(saveOutsourcingData(req, (res) => {
      props.closeDrawer('submit')
    }))
  }

  const resetValues = () => {
    setValue("Description", '')
    setValue("Cost", '')
    setDescription('')
  }

  const calculateSumOfValues = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Number(data[i].Cost);
    }
    return sum;
  }

  const addRow = () => {
    if (description === '' || getValues("Cost") === '') {
      Toaster.warning("Please enter all details")
      return false
    }
    let list = [...gridData]
    if (list?.length === 6) {
      Toaster.warning("Maximum 5 rows can be added")
      return false
    }
    let obj = {}
    obj.Description = description
    obj.Cost = Number(getValues("Cost"))
    if (list?.length > 0) {

      const label_to_check = obj.Description.label;

      let is_present = false;
      for (let i = 0; i < list.length; i++) {
        const obj = list[i];
        if (obj.Description.label === label_to_check) {
          is_present = true;
          break;
        }
      }

      if (is_present) {
        Toaster.warning("Data already exists")
        return false
      }
    }
    list.push(obj)
    setTotalCost(calculateSumOfValues(list))
    setgridData(list)
    resetValues()
  }

  const updateRow = () => {
    let list = [...gridData]
    let editIndex = list?.findIndex(ele => ele?.Description === description)
    let obj = { ...list[editIndex] }
    obj.Cost = Number(getValues("Cost"))
    let dataList = Object.assign([...list], { [editIndex]: obj })
    let totalCost = calculateSumOfValues(dataList)
    setTotalCost(totalCost)

    setIsEdit(false)
    setgridData(dataList)
    resetValues()
  }

  const mapGrid = (grid) => {
    const outputArray = grid.map(obj => {
      return {
        OutsourcingName: obj.Description.label,
        OutsourcingRate: obj.Cost
      };
    });
    return outputArray
  }

  const editItemDetails = (index) => {
    let obj = gridData[index]
    setIsEdit(true)
    setDescription(obj.Description)
    setValue("Description", obj.Description)
    setValue("Cost", obj.Cost)
  }

  const deleteItem = (index) => {
    let list = [...gridData]
    list.splice(index, 1)
    let totalCost = calculateSumOfValues(list)
    setTotalCost(totalCost)
    setgridData(list)
    resetValues()
  }

  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper layout-min-width-640px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"Outsourcing"}</h3>
                </div>
                <div
                  onClick={() => props.closeDrawer('cancel')}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="pl-3">
                <Col md="4">
                  <SearchableSelectHookForm
                    label={"Description"}
                    name={"Description"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    defaultValue={description.length !== 0 ? description : ""}
                    options={renderListing("Description")}
                    mandatory={true}
                    handleChange={handleDescriptionChange}
                    errors={errors.Plant}
                    disabled={viewMode}
                  />
                </Col>
                <Col md="4">
                  <NumberFieldHookForm
                    label={`Cost`}
                    name={'Cost'}
                    placeholder=""
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}

                    rules={{
                      required: false,
                      validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                      pattern: {
                        value: /^\d{0,8}(\.\d{0,7})?$/i,
                      },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Cost}
                    disabled={viewMode}
                  />
                </Col>

                <Col md="4" className='pt-1 pr-0'>
                  {isEdit ? (
                    <>
                      <button
                        type="button"
                        className={"btn btn-primary mt30 pull-left mr5"}
                        onClick={updateRow}
                        disabled={viewMode}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className={"ml-1 mt30 add-cancel-btn cancel-btn"}
                        onClick={() => resetValues()}
                        disabled={viewMode}
                      >
                        <div className={"cancel-icon"}></div>Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={"user-btn mt30 pull-left"}
                        disabled={viewMode}
                        onClick={addRow}
                      >
                        <div className={"plus"}></div>ADD
                      </button>
                      <button
                        type="button"
                        className={" ml-1 mt30 reset-btn"}
                        disabled={viewMode}
                        onClick={() => resetValues()}
                      >
                        Reset
                      </button>
                    </>
                  )}
                </Col>


                <Col md="12">
                  <Table className="table border out-sourcing-table" size="sm">
                    <thead>
                      <tr>
                        <th>{`Description`}</th>
                        <th>{`Cost`}</th>
                        <th className='text-right'>{`Action`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gridData && gridData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item?.Description?.label}</td>
                            <td>{checkForDecimalAndNull(item?.Cost, initialConfiguration?.NoOfDecimalForPrice)}</td>

                            <td className='text-right'>
                              <button
                                className="Edit mr-2"
                                title='Edit'
                                type={"button"}
                                disabled={viewMode}
                                onClick={() =>
                                  editItemDetails(index)
                                }
                              />
                              <button
                                className="Delete"
                                title='Delete'
                                type={"button"}
                                disabled={viewMode}
                                onClick={() =>
                                  deleteItem(index)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}

                      {gridData.length === 0 ? <tr>
                        <td colSpan={"4"}> <NoContentFound title={EMPTY_DATA} /></td>
                      </tr> : <tr className='table-footer'>
                        <td>
                          Total
                        </td>
                        <td colSpan={"2"}>
                          <div className="total-cost">{checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice)}</div>
                        </td>
                      </tr>
                      }
                    </tbody>
                  </Table>
                </Col>


              </Row>

              <Row className="justify-content-between row">
                <div className="col-sm-12 text-right">
                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={cancel}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>

                  <button
                    type="submit"
                    className="submit-button save-btn"
                    disabled={viewMode}
                  >
                    <div class="save-icon"></div>
                    {"Save"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(OutsourcingDrawer);