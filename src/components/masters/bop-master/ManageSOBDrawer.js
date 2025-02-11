import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, Table, Container, } from 'reactstrap';
import { DatePickerHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, showBopLabel, } from '../../../helper';
import { getManageBOPSOBById, updateBOPSOBVendors } from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import DatePicker from "react-datepicker";

import DayTime from '../../common/DayTimeWrapper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import { useLabels } from '../../../helper/core';

function ManageSOBDrawer(props) {

  const { ID } = props;
  const GridFields = 'GridFields';
  const defaultValues = {
    //OuterDiameter: WeightCalculatorRequest && WeightCalculatorRequest.OuterDiameter !== undefined ? WeightCalculatorRequest.OuterDiameter : '',
  }

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });
  const { vendorLabel } = useLabels();
  const [Data, setData] = useState({});
  const [GridData, setGridData] = useState([]);
  const [GridDataOldArray, setGridDataOldArray] = useState([]);
  const [WeightedCost, setWeightedCost] = useState(0);
  const [isDisable, setIsDisable] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)


  const fieldValues = useWatch({
    control,
    name: ['GridFields'],
  });

  const dispatch = useDispatch()

  useEffect(() => {


    // setTimeout(() => {

    dispatch(getManageBOPSOBById(ID, (res) => {
      // setIsLoader(true)
      if (res && res.data && res.data.Result) {
        let Data = res.data.Data;

        setEffectiveDate(Data.Effectivedate)

        if (Data.BoughtOutPartVendorList.length === 1) {
          setIsDisable(true)
          setGridData(Data.BoughtOutPartVendorList)
          setGridDataOldArray(Data.BoughtOutPartVendorList)
        }
        if (Data.BoughtOutPartVendorList.length > 1) {
          let tempArray = [];
          let tempData = Data.BoughtOutPartVendorList[0];
          tempData = {
            ...tempData,
            ShareOfBusinessPercentage: Data.BoughtOutPartVendorList[0].ShareOfBusinessPercentage !== 0 ? Data.BoughtOutPartVendorList[0].ShareOfBusinessPercentage : 100

          }
          tempArray = Object.assign([...Data.BoughtOutPartVendorList], { 0: tempData })
          setGridData(tempArray)
          setGridDataOldArray(tempArray)


        }
        setData(Data)

      }
    }))
    // }, 500);
    // setIsLoader(false)

  }, []);

  // const VendorsBOPSOBData = useSelector(state => state.boughtOutparts.VendorsBOPSOBData)
  // if (VendorsBOPSOBData !== undefined) {
  //   
  // }

  useEffect(() => {

    calculateWeightedCost()
  }, [fieldValues, GridData]);

  /**
   * @method calculateWeightedCost
   * @description CALCULATE WEIGHTED COST
   */
  const calculateWeightedCost = () => {
    let WeightedCost = 0;
    WeightedCost = GridData && GridData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.WeightedCost);
    }, 0)
    setWeightedCost(WeightedCost);
  }

  /**
  * @method handleSOBChange
  * @description HANDLE SOB CHANGE
  */
  const handleSOBChange = (event, index) => {

    let tempArray = [];
    let tempData = GridData[index];

    if (!isNaN(event.target.value)) {

      tempData = {
        ...tempData,
        ShareOfBusinessPercentage: event.target.value,
        //ShareOfBusinessPercentage: a ? Number(event.target.value) : 0,
        //isSOBChanged: checkIsSOBChanged(event, index),
        WeightedCost: checkForDecimalAndNull(tempData.NetLandedCost * calculatePercentage(Number(event.target.value)), 2),
      }
      tempArray = Object.assign([...GridData], { [index]: tempData })

      // setTimeout(() => {
      //   if (event.target.value === false) {
      //     setValue(`${GridFields}[${index}]ShareOfBusinessPercentage`, 0)
      //   }
      //   return false;
      // }, 200);
      setGridData(tempArray)

    } else {
      //  warningMessageHandle('VALID_NUMBER_WARNING')
    }
  }
  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = (type) => {
    props.closeDrawer('', type)
  }
  const cancelHandler = () => {
    // setShowPopup(true)
    cancel('cancel')
  }
  const onPopupConfirm = () => {
    cancel('cancel')
    setShowPopup(false)
  }
  const closePopUp = () => {
    setShowPopup(false)
  }
  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {

    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('')
  };

  /**
    * @method onSubmit
    * @description Used to Submit the form
    */
  const onSubmit = (values) => {

    // CHECK WHETHER SUM OF ALL SOB PERCENT IS LESS TAHN 100 


    const sum = GridData.reduce((accummlator, el, currentIndex) => {

      return accummlator + checkForNull(el.ShareOfBusinessPercentage)
    }, 0)

    if (Number(sum) > 100) {
      Toaster.warning('Total SOB% should be up to 100%')
      return false
    }

    let data = {
      "BoughtOutPartNumber": ID,
      "LoggedInUserId": loggedInUserId(),
      "BoughtOutPartSOBDetailId": Data.BoughtOutPartSOBDetailId,
      "WeightedNetLandedCost": WeightedCost,
      "AveragShareOfBusinessPercentage": GridData.length !== 1 ? sum : 100,
      "BoughtOutPartVendorList": GridData,
      "EffectiveDate": DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    }
    reset()
    dispatch(updateBOPSOBVendors(data, (res) => {
      if (res && res.data && res.data.Result) {
        Toaster.success(`${showBopLabel()} Vendors SOB updated successfully.`)
        props.closeDrawer('a', 'submit')
      }
    }))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (

    <>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container className="sob-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>Update SOB (%)</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
              <Row className='pl-3'>
                <Col md="3">
                  <div className="inputbox date-section">
                    <label> Effective Date<span className="asterisk-required">*</span></label>
                    <DatePicker
                      name="EffectiveDate"
                      selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                      onChange={handleEffectiveDateChange}
                      Controller={Controller}
                      control={control}
                      register={register}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      dateFormat="dd/MM/yyyy"
                      mandatory={true}
                      rules={{ required: true }}
                      placeholderText="Select date"
                      className="withBorder"
                      autoComplete={"off"}
                      disabledKeyboardNavigation
                      onChangeRaw={(e) => e.preventDefault()}
                      disabled={isDisable ? true : false}
                      errors={errors.EffectiveDate}
                    />
                  </div>
                </Col>
              </Row>
              <Row className="pl-3">
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>{`${vendorLabel} (Code)`}</th>
                        <th style={{ width: '165px' }}>{`Net Cost/Unit`}</th>
                        <th style={{ width: '155px' }}>{`SOB (%)`}</th>
                        <th style={{ width: '150px' }} >{`Weighted Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        GridData &&
                        GridData.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.BoughtOutPartVendorName}</td>
                              <td>{item.NetLandedCost}</td>
                              <td className="cr-select-height pr-4">
                                <TextFieldHookForm
                                  label={''}
                                  name={`${GridFields}.${index}.ShareOfBusinessPercentage`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    //required: true,
                                    pattern: {
                                      value: /^\d*\.?\d*$/,
                                      message: 'Invalid Number.'
                                    },
                                    maxLength: {
                                      value: 10,
                                      message: 'Length should not be more than 10'
                                    },
                                    max: {
                                      value: 100,
                                      message: "Should not be greater than 100"
                                    },
                                  }}
                                  defaultValue={GridData.length === 1 ? 100 : item.ShareOfBusinessPercentage}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleSOBChange(e, index)
                                  }}
                                  errors={errors && errors.GridFields && errors.GridFields[index] !== undefined ? errors.GridFields[index].ShareOfBusinessPercentage : ''}
                                  disabled={isDisable ? true : false}
                                />
                              </td>
                              <td>{checkForDecimalAndNull(item.WeightedCost, initialConfiguration?.NoOfDecimalForPrice)}</td>

                            </tr>
                          )
                        })
                      }

                      {
                        GridData && <tr className="sob-background">
                          <td>{`${showBopLabel()} Cost`}</td>
                          <td>{''}</td>
                          <td>{`Net Cost (Weighted Average):`}</td>
                          <td>{`${checkForDecimalAndNull(WeightedCost, initialConfiguration?.NoOfDecimalForPrice)}`}</td>
                        </tr>
                      }

                      {GridData.length === 0 &&
                        <tr>
                          <td colSpan={5}>
                            <NoContentFound title={EMPTY_DATA} />
                          </td>
                        </tr>
                      }
                    </tbody>
                  </Table>
                </Col>

              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between mt-1 mx-0">
                <div className="col-sm-12 text-right">
                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={cancelHandler} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type={'submit'}
                    className="submit-button save-btn">
                    <div className={"save-icon"}></div>
                    {'Update'}
                  </button>
                </div>
              </Row>

            </form>

          </div >
        </Container>
      </Drawer>
      {
        showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
      }
    </ >
  );
}

export default ManageSOBDrawer;