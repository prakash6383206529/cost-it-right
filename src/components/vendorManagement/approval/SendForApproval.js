import React, { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { Controller, useForm } from 'react-hook-form';
import { AllApprovalField, SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReasonAPI } from '../../masters/actions/ReasonMaster';
import { useHistory } from 'react-router-dom';
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId, userDetails, userTechnologyLevelDetailsWithoutCostingToApproval } from '../../../helper';
import { sendForUnblocking } from '../Action';
import { getAllMasterApprovalDepartment, getAllMasterApprovalUserByDepartment } from '../../masters/actions/Material';
import { transformApprovalItem } from '../../common/CommonFunctions';
import { CLASSIFICATIONAPPROVALTYPEID, EMPTY_GUID, LPSAPPROVALTYPEID, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, RELEASESTRATEGYTYPEID6 } from '../../../config/constants';
import WarningMessage from '../../common/WarningMessage';
import Toaster from '../../common/Toaster';
import { debounce } from 'lodash';
import { getAllDivisionListAssociatedWithDepartment, getUsersOnboardingLevelAPI } from '../../../actions/auth/AuthActions';
import LoaderCustom from '../../common/LoaderCustom';
import { REMARKMAXLENGTH } from '../../../config/masterData';
import { checkFinalUser } from '../../costing/actions/Costing';


const SendForApproval = (props) => {
  const [isLoader, setIsLoader] = useState(false)

  const dispatch = useDispatch()
  const { register, control, setValue, handleSubmit, reset, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [reasonOption, setReasonOption] = useState([])
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [disableRS, setDisableRS] = useState(false);
  const userData = userDetails()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const [showValidation, setShowValidation] = useState(false)
  const { deptList } = useSelector((state) => state.material)
  const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')
  const [selectedApprover, setSelectedApprover] = useState('')
  const [approver, setApprover] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [approvalType, setApprovalType] = useState({});
  const [approverIdList, setApproverIdList] = useState([])
  const [lpsApprovalDropDown, setLPSApprovalDropDown] = useState([])
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [classificationApprovalDropDown, setClassificationApprovalDropDown] = useState([])
  const [lpsApproverIdList, setLPSApproverIdList] = useState([]) // [loggedInUserId(), setLPSApproverIdList]
  const [classificationApproverIdList, setClassificationApproverIdList] = useState([])
  const [noApprovalExistMessage, setNoApprovalExistMessage] = useState('')
  const [levelDetails, setLevelDetails] = useState('');
  const [isShowDivision, setIsShowDivision] = useState(false)
  const [divisionList, setDivisionList] = useState([])

  const [division, setDivision] = useState('')

  const [isFinalApprover, setIsFinalApprover] = useState(false)
  const [isFinalApproverLps, setIsFinalApproverLps] = useState(false)


  const [department, setDepartment] = useState('')
  const [isDisableDept, setDisableDept] = useState(false)
  const [departmentDropdown, setDepartmentDropdown] = useState([])
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)
  const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)

  const {
    isOpen,
    isLpsRating, isClassification, viewApprovalData,
    deviationData,
    // onSubmit,
    isDisable,
    isDisableSubmit,


  } = props;

  useEffect(() => {
    setIsLoader(true)
    dispatch(getAllMasterApprovalDepartment((res) => {

      setIsLoader(false)
      const Data = res?.data?.SelectList;


      const departObj = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
      const updateList = Data && Data.filter(item => departObj.includes(item.Text))

      let department = []
      updateList &&
        updateList.map((item) => {
          if (item?.Value === '0') return false
          department?.push({ label: item?.Text, value: item?.Value })
          return null
        })
      setDepartmentDropdown(department)



      if (department?.length === 1) {
        const selectedDept = { label: department[0].label, value: department[0].value };

        setValue('dept', selectedDept)
        setValue('dept1', selectedDept)
        setDisableDept(true)
        setDepartment(selectedDept)
        if (getConfigurationKey().IsDivisionAllowedForDepartment) {

          fetchDivisionList(department[0].value, dispatch, (divisionArray, showDivision) => {
            setIsShowDivision(showDivision);
            setDivisionList(divisionArray);
            if (!showDivision) {
              if (isLpsRating && isClassification) {
                callCheckFinalUserApi(department[0].value, LPSAPPROVALTYPEID, null, 'dept1');
                callCheckFinalUserApi(department[0].value, CLASSIFICATIONAPPROVALTYPEID, null, 'dept');
              } else if (isLpsRating) {
                callCheckFinalUserApi(department[0].value, LPSAPPROVALTYPEID, null, 'dept1');
              } else if (isClassification) {
                callCheckFinalUserApi(department?.value, CLASSIFICATIONAPPROVALTYPEID, null, 'dept');
              }
            }
          });
        }
        else {
          setTimeout(() => {
            setValue('dept', { label: department[0].label, value: department[0].value })
            setValue('dept1', { label: department[0].label, value: department[0].value })
            setDisableDept(true)
          }, 100);

          let obj = {
            LoggedInUserId: loggedInUserId(),
            DepartmentId: userDetails().DepartmentId,
            MasterId: 0,
            ReasonId: 0,
            PlantId: deviationData?.PlantId ?? EMPTY_GUID,
            OnboardingMasterId: 1
          };

          const handleApiResponse = (res, deptKey, approverKey) => {
            let approverIdListTemp = [];
            const Data = res.data.DataList[1] || {};
            const isLPSApprovalType = Data.ApprovalTypeId === LPSAPPROVALTYPEID;
            if (Data.length !== 0) {
              setTimeout(() => {
                setValue(deptKey, { label: Data.DepartmentName, value: Data.DepartmentId });
                setValue(approverKey, {
                  label: Data.Text || '',
                  value: Data.Value || '',
                  levelId: Data.LevelId || '',
                  levelName: Data.LevelName || ''
                });
              }, 100);

              let tempDropdownList = [];
              res.data.DataList && res.data.DataList.forEach((item) => {

                if (item?.Value !== '0') {
                  tempDropdownList.push({
                    label: item?.Text,
                    value: item?.Value,
                    levelId: item?.LevelId,
                    levelName: item?.LevelName
                  });
                  approverIdListTemp.push(item?.Value);
                }
              });
              setTimeout(() => {
                if (isLPSApprovalType) {
                  // Update LPS related states
                  setLPSApprovalDropDown(tempDropdownList);
                  setLPSApproverIdList(approverIdListTemp);
                } else {
                  // Update Classification related states
                  setClassificationApprovalDropDown(tempDropdownList);
                  setClassificationApproverIdList(approverIdListTemp);
                }
              }, 100);
            }
          };

          if (isLpsRating && isClassification) {
            const lpsObj = { ...obj, ApprovalTypeId: LPSAPPROVALTYPEID };
            const classificationObj = { ...obj, ApprovalTypeId: CLASSIFICATIONAPPROVALTYPEID };
            dispatch(getAllMasterApprovalUserByDepartment(classificationObj, (classificationRes) => {

              handleApiResponse(classificationRes, 'dept', 'approver');
              // After handling the response for Classification, make API call for LPS
              dispatch(getAllMasterApprovalUserByDepartment(lpsObj, (lpsRes) => {


                handleApiResponse(lpsRes, 'dept1', 'approver1');
              }));
            }));
          } else {
            // Handle single scenario
            const apiObj = {
              ...obj,
              ApprovalTypeId: isLpsRating ? LPSAPPROVALTYPEID : CLASSIFICATIONAPPROVALTYPEID
            };


            // Make API call for single type
            dispatch(getAllMasterApprovalUserByDepartment(apiObj, (res) => {
              isClassification ?
                handleApiResponse(res, 'dept', 'approver') : handleApiResponse(res, 'dept1', 'approver1');
            }));
          }
        }
      }
    }));
  }, [isOpen]);

  useEffect(() => {
    dispatch(getUsersOnboardingLevelAPI(loggedInUserId(), (res) => {

      userTechnology(isLpsRating ? LPSAPPROVALTYPEID : CLASSIFICATIONAPPROVALTYPEID, res.data.Data)

    }))
  }, [isOpen])
  const userTechnology = (approvalTypeId, levelsList) => {

    let levelDetailsTemp = ''
    levelDetailsTemp = userTechnologyLevelDetailsWithoutCostingToApproval(approvalTypeId, levelsList?.OnboardingApprovalLevels)
    setLevelDetails(levelDetailsTemp)
  }






  const onSubmit = debounce(
    handleSubmit(() => {
      const dept = isClassification ? getValues('dept') : getValues('dept1');
      const approver = isClassification ? getValues('approver') : getValues('approver1');
      const month = isClassification ? getValues('month') : getValues('month1');

      if (initialConfiguration?.IsDivisionAllowedForDepartment && isFinalApprover) {
        Toaster.warning("User does not have permission for unblocking because it is the final level approver")

      }
      else {
        if (initialConfiguration.IsMultipleUserAllowForApproval && !dept?.label) {
          Toaster.warning('There is no highest approver defined for this user. Please connect with the IT team.');
          return false;
        }

        const senderObj = {

          IsFinalApproved: false,
          // DepartmentId: dept?.value || '',
          // DepartmentName: dept?.label || '',
          ApproverLevelId: approver?.levelId || '',
          // ApproverDepartmentId: dept?.value || '',
          ApproverLevel: approver?.levelName || '',
          // ApproverDepartmentName: dept?.label || '',
          ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval
            ? approverIdList
            : [approver?.value || ''],
          SenderLevelId: levelDetails?.LevelId,
          SenderId: loggedInUserId(),
          SenderLevel: levelDetails?.Level,
          // SenderRemark: isClassification ? getValues('remarks') : getValues('remarks1'),
          LoggedInUserId: loggedInUserId(),
          PurchasingGroup: '',
          MaterialGroup: '',
          CostingTypeId: 1,
          MasterIdList: [],
          BudgetingIdList: [],
          OnboardingApprovalId: 1,

        };

        const classificationSenderObj = {
          ...senderObj,
          ReasonId: getValues('reason')?.value || '',
          Reason: getValues('reason')?.label || '',
          ApprovalTypeId: CLASSIFICATIONAPPROVALTYPEID,
          ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval
            ? classificationApproverIdList
            : [approver?.value || ''],
          ApproverDepartmentName: getValues('dept')?.label ?? '',
          ApproverDepartmentId: getValues('dept')?.value ?? '',

          SenderRemark: getValues('remarks'),
          DepartmentId: getValues('dept')?.value ?? '',
          DepartmentName: getValues('dept')?.label ?? '',
          FinalApprover: isFinalApprover,

          DivisionId: getValues('Division')?.value ?? '',
          MasterCreateRequest: {
            CreateVendorPlantClassificationLPSRatingUnblocking: {
              VendorClassificationId: deviationData?.VendorClassificationId,
              VendorLPSRatingId: '',
              IsSendForApproval: deviationData?.ClassificationIsBlocked,

              DeviationId: '00000000-0000-0000-0000-000000000000',
              CostingTypeId: 1,
              DeviationType: 1,
              DeviationDuration: `${month.value} Month(s)`,
              LoggedInUserId: loggedInUserId(),
              PlantId: deviationData.PlantId,
              PlantName: deviationData.PlantName,
              Remark: '',


            }
          }
        };

        const lpsSenderObj = {
          ...senderObj,
          ReasonId: getValues('reason1')?.value || '',
          Reason: getValues('reason1')?.label || '',
          ApproverDepartmentName: getValues('dept1')?.label ?? '',
          ApproverDepartmentId: getValues('dept1')?.value ?? '',
          SenderRemark: getValues('remarks1'),
          ApprovalTypeId: LPSAPPROVALTYPEID,
          ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval
            ? lpsApproverIdList
            : [approver?.value || ''],
          FinalApprover: isFinalApproverLps,

          DepartmentId: getValues('dept1')?.value ?? '',
          DepartmentName: getValues('dept1')?.label ?? '',

          DivisionId: getValues('Division1')?.value ?? '',
          MasterCreateRequest: {
            CreateVendorPlantClassificationLPSRatingUnblocking: {
              VendorClassificationId: '',
              VendorLPSRatingId: deviationData?.VendorLPSRatingId,
              IsSendForApproval: deviationData?.LPSRatingIsBlocked,
              DeviationId: '00000000-0000-0000-0000-000000000000',
              CostingTypeId: 1,
              DeviationType: 2,
              DeviationDuration: `1 Month(s)`,
              LoggedInUserId: loggedInUserId(),
              PlantId: deviationData.PlantId,
              PlantName: deviationData.PlantName,
              Remark: '',

            }
          }
        };


        // Dispatching API calls
        setIsLoader(true);
        const dispatchApproval = (sender, message) => {
          dispatch(sendForUnblocking(sender, res => {

            setIsLoader(false);
            if (res?.data?.Result) {
              Toaster?.success(message);
              props?.closeDrawer('', 'submit');
              // history.push('/supplier-approval-summary'); // Update the route as per your application

            }
          }));

        };

        if (isClassification && isLpsRating) {
          dispatchApproval(classificationSenderObj, 'Token has been sent for classification approval.');
          dispatchApproval(lpsSenderObj, 'Token has been sent for LPS rating approval.');
          props.closeDrawer()
        } else if (isClassification) {
          dispatchApproval(classificationSenderObj, 'Token has been sent for classification approval.');
        } else if (isLpsRating) {
          dispatchApproval(lpsSenderObj, 'Token has been sent for LPS rating approval.');
        }
      }

    }),
    500
  );





  useEffect(() => {
    dispatch(getAllReasonAPI(true, (res) => {
      setIsLoader(true)
      if (res.data.Result) {
        setReasonOption(res.data.DataList);
        // Set selected reason to the first option by default
        setSelectedReason(res.data.DataList || null);
      }
      setIsLoader(false)
    }));
  }, [dispatch]);


  const toggleDrawer = (event) => {
    // if (isDisable) {
    //   return false
    // }
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    reset()
    // dispatch(setCostingApprovalData([]))
    props?.closeDrawer('', 'Cancel')
  }

  const searchableSelectType = (label) => {
    const temp = [];
    if (label === 'Dept') {
      deptList && deptList.map((item) => {

        if (item?.Value === '0') return false
        temp.push({ label: item?.Text, value: item?.Value })
        return null
      })
      return temp
    }

    if (label === 'ApprovalType') {
      approvalTypeSelectList && approvalTypeSelectList.map((item) => {

        const transformedText = transformApprovalItem(item);
        if ((Number(item?.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item?.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item?.Value) === Number(RELEASESTRATEGYTYPEID3) || Number(item?.Value) === Number(RELEASESTRATEGYTYPEID4) || Number(item?.Value) === Number(RELEASESTRATEGYTYPEID6)) && !props?.isRfq) temp.push({ label: transformedText, value: item?.Value })
        if ((Number(item?.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item?.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item?.Value) === Number(RELEASESTRATEGYTYPEID6)) && props?.isRfq) temp.push({ label: transformedText, value: item?.Value })
        return null
      })
      return temp
    }

    if (label === 'month') {
      // Generate month options dynamically
      for (let i = 1; i <= 12; i++) {
        temp.push({ label: `${i}`, value: i });
      }

      return temp;
    }

    if (label === 'reason') {
      // Map options for 'department'
      // Example logic...
      reasonOption && reasonOption.map(item => {
        if (item?.Value === '0') return false


        temp.push({ label: item?.Reason, value: item?.ReasonId })
      });
      return temp;
    }

    // Add more conditions for other labels as needed

    return temp;
  }

  const handleMonthChange = (selectedMonth) => {
    // Do something with the selected month, such as updating state or setting a value

  };

  const handleReasonChange = (selectedReason) => {
    // Do something with the selected reason, such as updating state or setting a value

  };
  const handleApproverChange = (data) => {
    setApprover(data.label)
    setSelectedApprover(data.value)
    setSelectedApproverLevelId({ levelName: data.levelName, levelId: data.levelId })
  }
  const fetchDivisionList = (departmentId, dispatch, callback) => {
    let departmentIds = [departmentId];
    dispatch(getAllDivisionListAssociatedWithDepartment(departmentIds, res => {
      if (res && res?.data && res?.data?.Identity === true) {
        let divisionArray = res?.data?.DataList
          .filter(item => String(item?.DivisionId) !== '0')
          .map(item => ({
            label: `${item?.DivisionNameCode}`,
            value: (item?.DivisionId)?.toString(),
            DivisionCode: item?.DivisionCode
          }));
        callback(divisionArray, true);

      } else {
        if (isLpsRating && isClassification) {
          // Call for LPS
          callCheckFinalUserApi(departmentId, LPSAPPROVALTYPEID, null, 'dept1');
          // Call for Classification
          callCheckFinalUserApi(departmentId, CLASSIFICATIONAPPROVALTYPEID, null, 'dept');
        } else if (isLpsRating) {
          callCheckFinalUserApi(departmentId, LPSAPPROVALTYPEID, null, 'dept1');
        } else if (isClassification) {
          callCheckFinalUserApi(departmentId, CLASSIFICATIONAPPROVALTYPEID, null, 'dept');

        }
        callback([], false);

      }
    }));
  };
  const callCheckFinalUserApi = (newValue, approvalId, divisionId) => {


    let requestObject = {
      LoggedInUserId: loggedInUserId(),
      DepartmentId: newValue,
      MasterId: 0,
      ReasonId: 0,
      PlantId: deviationData?.PlantId ?? EMPTY_GUID,
      OnboardingMasterId: 1,
      ApprovalTypeId: approvalId,
      DivisionId: divisionId ?? null
    }

    let obj = {
      DepartmentId: newValue,
      UserId: loggedInUserId(),
      TechnologyId: '',
      Mode: 'onboarding',
      approvalTypeId: approvalId,
      plantId: deviationData.PlantId ?? EMPTY_GUID,
      divisionId: divisionId ?? null
    }

    dispatch(checkFinalUser(obj, (res) => {
      const data = res?.data?.Data
      if (data?.IsUserInApprovalFlow === true && data?.IsFinalApprover === false) {
        dispatch(getAllMasterApprovalUserByDepartment(requestObject, (res) => {
          const Data = res.data.DataList[1] ? res.data.DataList[1] : []
          if (Data?.length !== 0) {
            setIsLoader(false)

            setTimeout(() => {
              if (approvalId === CLASSIFICATIONAPPROVALTYPEID) {
                setValue('approver', {
                  label: Data.Text ? Data.Text : '',
                  value: Data.Value ? Data.Value : '',
                  levelId: Data.LevelId ? Data.LevelId : '',
                  levelName: Data.LevelName ? Data.LevelName : ''
                })
              } else if (approvalId === LPSAPPROVALTYPEID) {
                setValue('approver1', {
                  label: Data.Text ? Data.Text : '',
                  value: Data.Value ? Data.Value : '',
                  levelId: Data.LevelId ? Data.LevelId : '',
                  levelName: Data.LevelName ? Data.LevelName : ''
                })
              }
            }, 100);

            let tempDropdownList = []
            res.data.DataList &&
              res.data.DataList.map((item) => {
                if (item?.Value === '0') return false;
                tempDropdownList.push({
                  label: item?.Text,
                  value: item?.Value,
                  levelId: item?.LevelId,
                  levelName: item?.LevelName
                })
                return null
              })
            setTimeout(() => {
              if (approvalId === CLASSIFICATIONAPPROVALTYPEID) {
                setClassificationApprovalDropDown(tempDropdownList)
                setClassificationApproverIdList(tempDropdownList.map(item => item.value))
              } else if (approvalId === LPSAPPROVALTYPEID) {
                setLPSApprovalDropDown(tempDropdownList)
                setLPSApproverIdList(tempDropdownList.map(item => item.value))
              }
            }, 100)
          }
        }))
      } else if (data?.IsUserInApprovalFlow === false) {
        if (approvalId === CLASSIFICATIONAPPROVALTYPEID) {
          setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
          setClassificationApprovalDropDown([])
          setClassificationApproverIdList([])
          setIsFinalApprover(false)

          Toaster.warning('This user is not in approval flow for Classification.')

        } else if (approvalId === LPSAPPROVALTYPEID) {

          setIsFinalApproverLps(false)

          setValue('approver1', { label: '', value: '', levelId: '', levelName: '' })
          setLPSApprovalDropDown([])
          setLPSApproverIdList([])
          Toaster.warning('This user is not in approval flow for LPS.')

        }

        setApprover('')
        setSelectedApprover('')
        setIsSubmitDisabled(true)
        setNoApprovalExistMessage('')
      } else if (data?.IsNextLevelUserExist === false && data?.IsUserInApprovalFlow === true) {

        if (approvalId === CLASSIFICATIONAPPROVALTYPEID) {
          setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
          setClassificationApprovalDropDown([])
          setClassificationApproverIdList([])
          setIsFinalApprover(true)

          Toaster.warning('This user is final level approver for the Classification')

        } else if (approvalId === LPSAPPROVALTYPEID) {
          setValue('approver1', { label: '', value: '', levelId: '', levelName: '' })
          setLPSApprovalDropDown([])
          setLPSApproverIdList([])
          setIsFinalApproverLps(true)
          Toaster.warning('This user is final level approver for the LPS.')

        }
        // setApprover('')
        setIsSubmitDisabled(false)
        setSelectedApprover('')
        // setNoApprovalExistMessage('There is no higher approver available for this user in this department.')
      }
    }))
  }
  const handleDepartmentChange = (newValue, approvalId) => {
    if (approvalId === CLASSIFICATIONAPPROVALTYPEID) {
      setValue('approver', '')
      setValue('Division', '')
      setValue('reason', '')
      setValue('month', '')
      setValue('remarks', '')
      setClassificationApprovalDropDown([])
      setClassificationApproverIdList([])
      setIsFinalApprover(false)
    } else if (approvalId === LPSAPPROVALTYPEID) {
      setValue('approver1', '')
      setValue('Division1', '')
      setValue('reason1', '')
      setValue('remarks1', '')
      setLPSApprovalDropDown([])
      setLPSApproverIdList([])
      setIsFinalApproverLps(false)
    }


    setApprovalType(approvalId)
    if (getConfigurationKey().IsDivisionAllowedForDepartment) {
      setIsLoader(true)
      setIsShowDivision(true)
      fetchDivisionList(newValue.value, dispatch, (divisionArray, showDivision) => {

        setIsShowDivision(showDivision);
        setDivisionList(divisionArray);
        setDepartment(newValue)
        // if (!isShowDivision) {
        //   callCheckFinalUserApi(newValue.value, approvalType, division?.value)
        // }
      });
    } else {
      if (newValue && newValue !== '') {
        setValue(approvalId === CLASSIFICATIONAPPROVALTYPEID ? 'approver' : 'approver1', '')
        setApprover('')
        setSelectedApprover('')
        setShowValidation(false)
        callCheckFinalUserApi(newValue.value, approvalId)
        setSelectedDepartment(newValue)
      } else {
        setSelectedDepartment('')
      }
    }
  }

  const handleDivisionChange = (value, approvalId) => {
    setDivision(value)

    callCheckFinalUserApi(department?.value, approvalId, value?.value)


  }
  const approverMessage = `This user is not in approval cycle for "${getValues('ApprovalType')?.label ? getValues('ApprovalType')?.label : viewApprovalData && viewApprovalData[0]?.CostingHead}" approval type, please contact admin to add approver for "${getValues('ApprovalType')?.label ? getValues('ApprovalType')?.label : viewApprovalData && viewApprovalData[0]?.CostingHead}" approval type and ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}.`;

  return (
    <Fragment>
      <Drawer anchor={props?.anchor} open={isOpen}>

        <div className="container">
          <div className={"drawer-wrapper layout-width-900px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"Send for Approval"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  disabled={isLoader}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}

            {viewApprovalData &&
              viewApprovalData.map((data, index) => (
                <div className="" key={index}>
                  {/* Rendering approval data */}
                </div>
              ))}
            {isClassification && (<div className="">
              <Row>
                <Col md="12">
                  <div className="left-border">{`Supplier Classification`}</div>
                </Col>
              </Row>
              <form>
                {/* Form fields */}
                <Row>
                  <Col md="6">
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={`${handleDepartmentHeader()}`}
                        name={"dept"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={departmentDropdown}
                        disabled={disableRS || (!getConfigurationKey().IsDivisionAllowedForDepartment || isDisableDept)}

                        // disabled={(disableRS || (!(userData.Department.length > 1) || (initialConfiguration.IsReleaseStrategyConfigured && Object.keys(approvalType)?.length === 0))) && (!getConfigurationKey().IsDivisionAllowedForDepartment || isDisableDept)}
                        mandatory={true}
                        handleChange={(e) => handleDepartmentChange(e, CLASSIFICATIONAPPROVALTYPEID)}
                        errors={errors.dept}
                      />
                    </div>
                  </Col >
                  {getConfigurationKey().IsDivisionAllowedForDepartment && isShowDivision &&
                    <Col md="6">
                      <SearchableSelectHookForm
                        label={"Division"}
                        name={"Division"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        defaultValue={""}
                        options={divisionList}
                        // disabled={(Object.keys(getValues('dept')).length === 0)}
                        // handleChange={handleDivisionChange}
                        handleChange={(e) => handleDivisionChange(e, CLASSIFICATIONAPPROVALTYPEID)}

                        errors={errors.Division}
                        mandatory={true}
                        rules={{ required: true }}
                      />
                    </Col>}
                  <Col md="6">
                    {!isFinalApprover && <div className="input-group form-group col-md-12 input-withouticon">
                      {initialConfiguration?.IsMultipleUserAllowForApproval ? <>
                        <AllApprovalField
                          label="Approver"
                          approverList={classificationApprovalDropDown}
                          popupButton="View all"
                        />
                      </> :
                        <SearchableSelectHookForm
                          label={"Approver"}
                          name={"approver"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={classificationApprovalDropDown}
                          mandatory={true}
                          disabled={disableRS || !(userData.Department.length > 1)}
                          customClassName={"mb-0 approver-wrapper"}
                          handleChange={handleApproverChange}
                          errors={errors.approver}
                        />}

                      {
                        showValidation && <span className="warning-top"><WarningMessage title={approverMessage} dClass={`${errors.approver ? "mt-2" : ''} approver-warning`} message={approverMessage} /></span>
                      } </div>}
                  </Col>
                </Row>
                <Row>
                  {!isFinalApprover && (<Col md="6">
                    <SearchableSelectHookForm
                      label={'Select Reason'}
                      name={'reason'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={selectedReason}
                      options={searchableSelectType('reason')} // Call mapApprovalOptions with the label
                      mandatory={true}
                      handleChange={handleReasonChange}
                      errors={errors.reason}
                    />

                  </Col>)}
                  {!isFinalApprover && <Col md="6">
                    <SearchableSelectHookForm
                      label={'Deviation Duration (Months)'}
                      name={'month'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={selectedMonth}
                      options={searchableSelectType('month')}
                      mandatory={true}
                      handleChange={handleMonthChange}
                      errors={errors.month}
                    />

                  </Col>}
                  {!isFinalApprover && (<Col md="12">
                    <TextAreaHookForm
                      label="Remarks"
                      name={"remarks"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      rules={{
                        required: true,
                        maxLength: REMARKMAXLENGTH
                      }}
                      mandatory={true}
                      // mandatory={mandatoryRemark ? true : false}
                      // rules={{ required: mandatoryRemark ? true : false }}
                      handleChange={() => { }}
                      defaultValue={""}
                      className=""
                      customClassName={"withBorder"}
                      errors={errors.remarks}
                      disabled={false}
                    />
                  </Col>)}
                </Row>
              </form>
            </div>)}

            {viewApprovalData &&
              viewApprovalData.map((data, index) => (
                <div className="" key={index}>
                  {/* Rendering approval data */}
                </div>
              ))}
            {isLpsRating && (<div className="">
              <Row>
                <Col md="12">
                  <div className="left-border">{`LPS Rating`}</div>
                </Col>
              </Row>
              <form>
                {/* Form fields */}
                <Row>
                  <Col md="6">
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={`${handleDepartmentHeader()}`}
                        name={"dept1"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={departmentDropdown}
                        disabled={disableRS || (!getConfigurationKey().IsDivisionAllowedForDepartment || isDisableDept)}
                        // disabled={(disableRS || (!(userData?.department.length > 1) || (initialConfiguration.IsReleaseStrategyConfigured ))) || !getConfigurationKey().IsDivisionAllowedForDepartment}
                        mandatory={true}
                        handleChange={(e) => handleDepartmentChange(e, LPSAPPROVALTYPEID)}
                        errors={errors.dept1}
                      />
                    </div>
                  </Col >
                  {getConfigurationKey().IsDivisionAllowedForDepartment && isShowDivision &&
                    <Col md="6">
                      <SearchableSelectHookForm
                        label={"Division"}
                        name={"Division1"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        defaultValue={""}
                        options={divisionList}
                        // disabled={(Object?.keys(getValues('dept1')).length === 0)}
                        handleChange={(e) => handleDivisionChange(e, LPSAPPROVALTYPEID)}
                        errors={errors.Division1}
                        mandatory={true}
                        rules={{ required: true }}
                      />
                    </Col>}
                  {!isFinalApproverLps && (<Col md="6">
                    {initialConfiguration.IsMultipleUserAllowForApproval ? <>
                      <AllApprovalField
                        label="Approver"
                        approverList={lpsApprovalDropDown}
                        popupButton="View all"
                      />
                    </> :
                      <SearchableSelectHookForm
                        label={"Approver"}
                        name={"approver1"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={lpsApprovalDropDown}
                        mandatory={true}
                        disabled={disableRS || !(userData.Department.length > 1)}
                        customClassName={"mb-0 approver-wrapper"}
                        handleChange={handleApproverChange}
                        errors={errors.approver1}
                      />}
                    {
                      !noApprovalExistMessage && showValidation && <span className="warning-top"><WarningMessage title={approverMessage} dClass={`${errors.approver ? "mt-2" : ''} approver-warning`} message={approverMessage} /></span>
                    }
                    {noApprovalExistMessage && <span className="warning-top"><WarningMessage title={noApprovalExistMessage} message={noApprovalExistMessage} /></span>}
                  </Col >)}
                </Row>
                <Row>
                  {!isFinalApproverLps && (<Col md="6">
                    <SearchableSelectHookForm
                      label={'Select Reason'}
                      name={'reason1'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={selectedReason}
                      options={searchableSelectType('reason')} // Call mapApprovalOptions with the label
                      mandatory={true}
                      handleChange={handleReasonChange}
                      errors={errors.reason1}
                    />

                  </Col>)}
                  {!isFinalApproverLps && (<Col md="6">
                    <SearchableSelectHookForm
                      label={'Deviation Duration (Months)'}
                      name={'month1'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={searchableSelectType('month').find(option => option.value === 1)}
                      options={searchableSelectType('month')}
                      mandatory={true}
                      handleChange={handleMonthChange}
                      errors={errors.month1}
                      disabled={true}
                    />


                  </Col>)}
                  {!isFinalApproverLps && (<Col md="12">

                    <TextAreaHookForm
                      label="Remarks"
                      name={"remarks1"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      // mandatory={mandatoryRemark ? true : false}
                      rules={{
                        required: true,
                        maxLength: REMARKMAXLENGTH
                      }}

                      // rules={{ required: mandatoryRemark ? true : false }}
                      handleChange={() => { }}
                      defaultValue={""}
                      className=""
                      customClassName={"withBorder"}
                      errors={errors.remarks1}
                      disabled={false}
                    />

                  </Col>)}
                </Row>
              </form>
            </div>)}
            <Row className="mb-4">
              <Col
                md="12"
                className="d-flex justify-content-end align-items-center"
              >
                <button
                  className="cancel-btn mr-2"
                  type={"button"}
                  onClick={toggleDrawer}
                  disabled={false}

                // className="reset mr15 cancel-btn"
                >
                  <div className={'cancel-icon'}></div>
                  {"Cancel"}
                </button>
                <Button
                  className="btn btn-primary save-btn"
                  type="submit"
                  // disabled={(isDisable || isFinalApproverShow)}
                  disabled={isDisable || isDisableSubmit || isSubmitDisabled || isFinalApprover || isFinalApproverLps}
                  onClick={onSubmit}
                >
                  <div className={'save-icon'}></div>
                  {"Submit"}
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </Drawer>
    </Fragment>
  );
}

export default SendForApproval;
