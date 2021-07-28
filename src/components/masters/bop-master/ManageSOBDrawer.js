import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, Table, Container, } from 'reactstrap';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, checkPercentageValue, getConfigurationKey, loggedInUserId, } from '../../../helper';
import { getManageBOPSOBById, updateBOPSOBVendors } from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { required } from "../../../helper/validation";

import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import LoaderCustom from '../../common/LoaderCustom';

function ManageSOBDrawer(props) {

  const { ID, isEditFlag } = props;
  const GridFields = 'GridFields';
  const defaultValues = {
    //OuterDiameter: WeightCalculatorRequest && WeightCalculatorRequest.OuterDiameter !== undefined ? WeightCalculatorRequest.OuterDiameter : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const [Data, setData] = useState({});
  const [GridData, setGridData] = useState([]);
  const [GridDataOldArray, setGridDataOldArray] = useState([]);
  const [WeightedCost, setWeightedCost] = useState(0);
  const [isDisable, setIsDisable] = useState(false)
  const [dropdownChanged, setDropDownChanged] = useState(true)
  const [isLoader, setIsLoader] = useState(false)

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
          tempArray = Object.assign([...Data.BoughtOutPartVendorList], { [0]: tempData })
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
    setDropDownChanged(false)
  }

  /**
  * @method checkIsSOBChanged
  * @description HANDLE SOB CHANGE
  */
  const checkIsSOBChanged = (event, index) => {
    let tempOldObj = GridDataOldArray[index];

    if (index > GridDataOldArray.length - 1) {
      return false;
    } else if (parseInt(event.target.value) === tempOldObj.ShareOfBusinessPercentage) {
      return false;
    } else if (parseInt(event.target.value) !== tempOldObj.ShareOfBusinessPercentage) {
      return true;
    }

  }

  /**
  * @method warningMessageHandle
  * @description VIEW COSTING DETAILS IN READ ONLY MODE
  */
  const warningMessageHandle = (warningType) => {
    switch (warningType) {
      case 'SOB_WARNING':
        toastr.warning('SOB Should not be greater than 100.');
        break;
      case 'VALID_NUMBER_WARNING':
        toastr.warning('Please enter a valid number.');
        break;
      case 'ERROR_WARNING':
        toastr.warning('Please enter a valid number.');
        break;
      default:
        break;
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer('')
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

    if (dropdownChanged) {
      toggleDrawer('')
      return false
    }

    const sum = GridData.reduce((accummlator, el, currentIndex) => {

      return accummlator + checkForNull(el.ShareOfBusinessPercentage)
    }, 0)

    if (Number(sum) > 100) {
      toastr.warning('Total SOB% should be up to 100%')
      return false
    }

    let data = {
      "BoughtOutPartNumber": ID,
      "LoggedInUserId": loggedInUserId(),
      "BoughtOutPartSOBDetailId": Data.BoughtOutPartSOBDetailId,
      "WeightedNetLandedCost": WeightedCost,
      "AveragShareOfBusinessPercentage": GridData.length !== 1 ? sum : 100,
      "BoughtOutPartVendorList": GridData
    }
    reset()
    dispatch(updateBOPSOBVendors(data, (res) => {
      if (res && res.data && res.data.Result) {
        toastr.success('BOP Vendors SOB has been updated.')
        props.closeDrawer('')
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
        {isLoader && <LoaderCustom />}
        <Container className="sob-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>Update SOB %</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

              <Row className="pl-3">
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>{`Vendor Name`}</th>
                        <th style={{ width: '165px' }}>{`Net Cost/Unit`}</th>
                        <th style={{ width: '155px' }}>{`SOB%`}</th>
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
                              <td className="cr-select-height">
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
                              <td>{checkForDecimalAndNull(item.WeightedCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                            </tr>
                          )
                        })
                      }

                      {
                        GridData && <tr className="sob-background">
                          <td>{'BOP Cost'}</td>
                          <td>{''}</td>
                          <td>{`Net Cost(Weighted Average)`}</td>
                          <td>{`:${checkForDecimalAndNull(WeightedCost, initialConfiguration.NoOfDecimalForPrice)}`}</td>
                        </tr>
                      }

                      {GridData.length === 0 &&
                        <tr>
                          <td colSpan={5}>
                            <NoContentFound title={CONSTANT.EMPTY_DATA} />
                          </td>
                        </tr>
                      }
                    </tbody>
                  </Table>
                </Col>

              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between mt25 mx-0">
                <div className="col-sm-12 text-right">

                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type={'submit'}
                    className="submit-button mr5 save-btn">
                    <div className={"save-icon"}></div>
                    {'Update'}
                  </button>
                </div>
              </Row>

            </form>

          </div >
        </Container>
      </Drawer>
    </ >
  );
}

export default ManageSOBDrawer;