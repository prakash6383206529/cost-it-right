import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { EMPTY_DATA, ZBC } from '../../../config/constants';
import { checkForDecimalAndNull, checkWhiteSpaces, number, decimalNumberLimit6, loggedInUserId } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import Toaster from '../../common/Toaster';
import { getNFRCostingOutsourcingDetails, saveOutsourcingData } from './actions/nfr';

function OutsourcingDrawer(props) {

  const { register, handleSubmit, formState: { errors }, control, reset, getValues, setValue } = useForm();
  // const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
  //   mode: 'onChange',
  //   reValidateMode: 'onChange',
  // });

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
    if (props?.CostingId) {
      dispatch(getNFRCostingOutsourcingDetails(props?.CostingId, (res) => {
        let data = res?.data?.Data
        const mappedArray = data.NFRCostingOutsourcingDetails.map(detail => ({
          Description: {
            label: detail.OutsourcingName,
            value: detail.OutsourcingName
          },
          Cost: detail.OutsourcingRate
        }));

        const totalCost = {
          Description: {
            label: "Total",
            value: "Total"
          },
          Cost: data.OutsourcingCost
        };

        mappedArray.push(totalCost);
        setgridData(mappedArray)
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
    list.pop()
    let datalist = mapGrid(list)
    let req = {
      BaseCostingId: props?.CostingId,
      LoggedInUserId: loggedInUserId(),
      OutsourcingCost: totalCost,
      NFRCostingOutsourcingDetails: datalist
    }
    dispatch(saveOutsourcingData(req, (res) => {

    }))
    props.closeDrawer('submit')
  }

  const resetValues = () => {
    setValue("Description", '')
    setValue("Cost", '')
    setDescription('')
  }

  const calculateSumOfValues = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += parseInt(data[i].Cost);
    }
    return sum;
  }

  const addRow = () => {
    if (description === '' || getValues("Cost") === '') {
      Toaster.warning("Please enter all details")
      return false
    }
    let list = [...gridData]
    list.pop();
    let obj = {}
    obj.Description = description
    obj.Cost = getValues("Cost")
    list.push(obj)
    let total = {
      Description: { label: "Total", value: "Total" },
      Cost: calculateSumOfValues(list)
    }
    setTotalCost(calculateSumOfValues(list))
    list.push(total)
    setgridData(list)
    resetValues()
  }

  const updateRow = (index) => {
    let list = [...gridData]
    let obj = {}
    obj.Description = description
    obj.Cost = getValues("Cost")
    list.push(obj)
    setgridData(list)
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
    setIsEdit(true)
    setDescription(gridData[index].Description.label)
    setValue("Cost", gridData[index].Cost)

  }
  const deleteItem = (index) => {
    let list = [...gridData]
    list.splice(index, 1)
    setgridData(list)
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
                    mandatory={false}
                    handleChange={handleDescriptionChange}
                    errors={errors.Plant}
                  />
                </Col>
                <Col md="4">
                  <TextFieldHookForm
                    label={`Cost`}
                    name={'Cost'}
                    placeholder="-"
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Cost}
                    disabled={false}
                  />
                </Col>

                <Col md="4" className='pt-1'>
                  {isEdit ? (
                    <>
                      <button type="button" className={"btn btn-primary mt30 pull-left mr5"} onClick={updateRow}>Update</button>
                      <button
                        type="button"
                        className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                        disabled={false}
                        onClick={() => resetValues()}
                      >
                        <div className={"cancel-icon"}></div>Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={"user-btn mt30 pull-left"}
                        disabled={false}
                        onClick={addRow}
                      >
                        <div className={"plus"}></div>ADD
                      </button>
                      <button
                        type="button"
                        className={"mr15 ml-1 mt30 reset-btn"}
                        disabled={false}
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
                          <tr key={index} className={item.Description.label === "Total" ? "table-footer" : ""}>
                            <td>{item?.Description?.label}</td>
                            <td>{checkForDecimalAndNull(item?.Cost, initialConfiguration.NoOfDecimalForPrice)}</td>

                            <td className='text-right'>
                              <button
                                className="Edit mr-2"
                                title='Edit'
                                type={"button"}
                                disabled={false}
                                onClick={() =>
                                  editItemDetails(index)
                                }
                              />
                              <button
                                className="Delete"
                                title='Delete'
                                type={"button"}
                                disabled={false}
                                onClick={() =>
                                  deleteItem(index)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {gridData.length === 0 && (
                      <tbody className='border'>
                        <tr>
                          <td colSpan={"4"}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr>
                      </tbody>
                    )}
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

                  <button type="submit" className="submit-button save-btn">
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