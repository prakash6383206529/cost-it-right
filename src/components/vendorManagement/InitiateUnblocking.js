import React, { useState, useEffect } from 'react';
import ScrollToTop from '../common/ScrollToTop';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from '../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeviationApprovalData, fetchVendorData, fetchVendorDependentPlantData } from './Action';
import { Col, Row, Table } from 'reactstrap';
import Button from '../layout/Button';
import SendForApproval from './approval/SendForApproval';
import { CLASSIFICATIONAPPROVALTYPEID, EMPTY_GUID, LPSAPPROVALTYPEID, ONBOARDINGID, searchCount } from '../../config/constants';
import Switch from "react-switch";
import { useLocation } from 'react-router-dom';
import TooltipCustom from '../common/Tooltip';
import { getConfigurationKey, loggedInUserId, showTitleForActiveToggle, userDetails, userTechnologyLevelDetailsWithoutCostingToApproval } from '../../helper';
import { getUsersOnboardingLevelAPI } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { checkFinalUser } from '../costing/actions/Costing';
import { autoCompleteDropdown } from '../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import CommonApproval from '../masters/material-master/CommonApproval';
import { getVendorNameByVendorSelectList } from '../../actions/Common';
import _ from 'lodash'
import { MESSAGES } from '../../config/message';
import LoaderCustom from '../common/LoaderCustom';
import DayTime from '../common/DayTimeWrapper';
import { useLabels } from '../../helper/core';

const InitiateUnblocking = (props) => {
    const location = useLocation();
    const { plantId, vendorId } = location.state || {};
    const { vendorLabel } = useLabels()

    const dispatch = useDispatch();
    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
    const vendorPlantData = useSelector((state) => state.supplierManagement.vendorPlantData)
    const deviationData = useSelector((state) => state.supplierManagement.deviationData)
    const [shouldMakeApiCalls, setShouldMakeApiCalls] = useState(false)

    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [isClassification, setIsClassification] = useState((deviationData?.ClassificationStatus === ONBOARDINGID ? true : false));
    const [isLpsRating, setIsLpsRating] = useState((deviationData?.LPSRatingStatus === ONBOARDINGID ? true : false));
    const [showApproval, setShowApproval] = useState(false);
    const [vendor, setVendor] = useState("");
    const [showApprvalStatus, setShowApprovalStatus] = useState(false)
    const [submit, setSubmit] = useState(true)
    const [isLoader, setIsLoader] = useState(false)
    const [CanGoForApproval, setCanGoForApproval] = useState(false)

    useEffect(() => {
        if (vendorId?.label !== '' && plantId?.label !== '') {
            setValue('vendor', vendorId)
            setSelectedVendor(vendorId)
            if (plantId) {
                setValue('Plant', plantId)
                setSelectedPlant(plantId)
            }
        }
    }, [location.state]);
    useEffect(() => {
        setIsSuperAdmin(userDetails()?.Role === "SuperAdmin")
        dispatch(fetchVendorData());
        if (selectedVendor) {
            dispatch(fetchVendorDependentPlantData(selectedVendor.value));

        }
    }, [selectedVendor]);
    useEffect(() => {
        if (selectedVendor && selectedPlant) {
            setIsLoader(true);
            dispatch(fetchDeviationApprovalData(selectedVendor.value, selectedPlant.value, (res) => {
                if (res?.status === 200 && res?.data?.DataList !== '') {
                    setIsLoader(false);
                    return true
                } else if (res?.status === 204) {
                    setIsLoader(false);
                    return false
                }
            }));
        }
    }, [selectedPlant, selectedVendor]);
    useEffect(() => {
        if (!isClassification && !isLpsRating) {
            setSubmit(true);
            setCanGoForApproval(false);
        }
    }, [isClassification, isLpsRating]);

    const handlePlantCheck = (approvalTypeId) => {

        if (selectedVendor && selectedPlant) {
            let obj = {};
            obj.DepartmentId = userDetails().DepartmentId;
            obj.UserId = loggedInUserId();
            obj.TechnologyId = '';
            obj.Mode = 'onboarding';
            obj.approvalTypeId = approvalTypeId; // Access the approval type ID from the response
            obj.plantId = selectedPlant?.value ?? EMPTY_GUID;
            dispatch(checkFinalUser(obj, res => {
                if (res?.data?.Result) {
                    const { IsUserInApprovalFlow, IsFinalApprover } = res?.data?.Data || {};

                    if ((IsUserInApprovalFlow === true && IsFinalApprover === true) || (IsUserInApprovalFlow === false && IsFinalApprover === false)) {
                        approvalTypeId === LPSAPPROVALTYPEID ? setIsLpsRating(false) : setIsClassification(false);
                        approvalTypeId === CLASSIFICATIONAPPROVALTYPEID ? setIsClassification(false) : setIsLpsRating(false);
                        const message = IsUserInApprovalFlow === true && IsFinalApprover === true
                            ? "User does not have permission for unblocking either the plant is not associated or it is the final level approver."
                            : "You don't have permission to initiate unblocking for the vendor against the selected plant. Either the plant is not associated, or the approval level has not been set or it may be both.";

                        Toaster.warning(message);
                        return false
                    } else {
                        setCanGoForApproval(true);
                        setSubmit(false);
                    }
                }
            }));

        }
    };
    const reset = () => {
        setSelectedPlant(null);
        setIsClassification(false);
        setIsLpsRating(false);
        setShowApproval(false);
        setSubmit(true)
        setValue('Plant', null);
    }

    const searchableSelectType = (label) => {
        const temp = [];
        if (label === 'plant') {
            vendorPlantData && vendorPlantData?.map(item => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
        return temp;
    }

    const handleVendorChange = (selectedValue) => {
        if (selectedValue === null) {
            reset()
        }
        setSelectedVendor(selectedValue);
        reset()
    };


    const statusButtonFormatter = (status, fieldName) => {
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    <Switch
                        // onChange={() => handleChange(cellValue, rowData)}
                        checked={status === false}
                        disabled={true}
                        background="#ff6600"
                        onColor="#FC5774"
                        onHandleColor="#ffffff"
                        offColor="#4DC771"
                        id="normal-switch"
                        height={24}
                    // className={cellValue ? "active-switch" : "inactive-switch"}
                    />
                </label>
            </>
        )
    }
    const handlePlantChange = (selectedValue) => {
        if (selectedValue === null) {
            reset()
        } else {
            reset()
            setSelectedPlant(selectedValue);

        }
    };


    const handleNext = () => {
        if (!getConfigurationKey().IsDivisionAllowedForDepartment) {
            dispatch(getUsersOnboardingLevelAPI(loggedInUserId(), (res) => {

                //When user is not in any approval flow
                if (res.status === 204 && res?.data === '') {

                    Toaster.warning('User is not in any approval flow');
                    return false;
                }
                let approvalTypeIds = Array?.from(res?.data?.Data?.OnboardingApprovalLevels.values(), level => level.ApprovalTypeId);
                if (approvalTypeIds?.length === 0 || !res?.data?.Data?.OnboardingApprovalLevels?.length || res?.data?.Data?.OnboardingApprovalLevels?.length === 0) {
                    setShowApproval(false)
                    Toaster.warning('User is not in the approval flow');
                    return false;
                }

                let checkedApproval = [];
                if (isClassification && isLpsRating) {

                    checkedApproval.push(CLASSIFICATIONAPPROVALTYPEID, LPSAPPROVALTYPEID)
                    handleCombinedApproval(approvalTypeIds, res, checkedApproval);
                } else if (isClassification || isLpsRating) {

                    checkedApproval.push(isClassification ? CLASSIFICATIONAPPROVALTYPEID : LPSAPPROVALTYPEID)
                    const similarApprovals = checkedApproval.filter(approval => approvalTypeIds.includes(approval));

                    handleSingleApproval(similarApprovals, res, checkedApproval);
                } else {
                    Toaster.warning(`User is not in the approval flow for ${isClassification === CLASSIFICATIONAPPROVALTYPEID ? 'LPS Rating' : 'Classification'}`);
                }
            }));
        }
        else {
            setCanGoForApproval(true);
            setShowApproval(true);
            setShouldMakeApiCalls(true);
        }
    };

    const handleCombinedApproval = (approvalTypeIds, res, checkedApproval) => {

        let approvalType = checkedApproval?.find(approval => approval === approvalTypeIds[0]);

        if (approvalTypeIds?.length === 1) {
            // Match approvalTypeIds with checkedApproval
            if (approvalType === CLASSIFICATIONAPPROVALTYPEID) {
                Toaster.warning(`User is only in classification approval flow`);
                processApproval(LPSAPPROVALTYPEID, res);
            }
            else if (approvalType === LPSAPPROVALTYPEID) {
                Toaster.warning(`User is only in LPS Rating approval flow`);
                processApproval(CLASSIFICATIONAPPROVALTYPEID, res);
            }
        }
        else
            processApproval(approvalTypeIds, res);

        return true;
    }



    const handleSingleApproval = (approvalTypeIds, res, checkedApproval) => {
        const arraysAreEqual = (array1, array2) => {
            return JSON.stringify(array1) === JSON.stringify(array2);
        };
        if (!arraysAreEqual(approvalTypeIds, checkedApproval)) {
            Toaster.warning(`User is not in the approval flow for ${checkedApproval === CLASSIFICATIONAPPROVALTYPEID ? 'Classification' : 'LPS Rating'}`);
        } else {
            processApproval(checkedApproval, res);
        }
    };

    const processApproval = (approvalTypeIds, res) => {
        let levelDetailsTempArray = []; // Array to store level details responses
        approvalTypeIds?.forEach(approvalTypeId => {
            let levelDetailsTemp;
            levelDetailsTemp = userTechnologyLevelDetailsWithoutCostingToApproval(approvalTypeId, res?.data?.Data?.OnboardingApprovalLevels);
            levelDetailsTempArray.push(levelDetailsTemp); // Store response in array
        });
        if (levelDetailsTempArray?.length === 0) {
            Toaster.warning("You don't have permission to send for approval.");
        }
        else {
            let finalUserResponses = []; // Array to store responses for final user check
            levelDetailsTempArray.forEach(details => {
                let obj = {};
                obj.DepartmentId = userDetails().DepartmentId;
                obj.UserId = loggedInUserId();
                obj.TechnologyId = '';
                obj.Mode = 'onboarding';
                obj.approvalTypeId = details?.ApprovalTypeId; // Access the approval type ID from the response
                obj.plantId = deviationData?.PlantId ?? EMPTY_GUID;
                dispatch(checkFinalUser(obj, res => {

                    finalUserResponses?.push({ ...res?.data?.Data, type: details?.ApprovalTypeId === LPSAPPROVALTYPEID ? "lps" : "classification" });
                    let tempArr = _.filter(finalUserResponses, ['IsUserInApprovalFlow', true], ['IsFinalApprover', false]);
                    // if (res?.data?.Result) {
                    // setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover);
                    if (finalUserResponses.length === levelDetailsTempArray.length) {
                        if (tempArr?.length === 1) {
                            if (tempArr[0].IsFinalApprover === false && tempArr[0].IsUserInApprovalFlow === true) {
                                setShowApproval(true);
                                setShouldMakeApiCalls(true);

                            } else {
                                Toaster.warning(`Final level user cannot send ${tempArr[0].type} for approval.`);
                            }
                        }
                        else if (finalUserResponses?.length > 1) {
                            // Check all elements in tempArr
                            const satisfiedElements = _.filter(finalUserResponses, (response) => {
                                return response.IsFinalApprover === false && response.IsUserInApprovalFlow === true;
                            });
                            const finalLevelElements = _.filter(finalUserResponses, (response) => {
                                return !(response.IsFinalApprover === false && response.IsUserInApprovalFlow === true);
                            });
                            const undefinedElements = _.filter(finalUserResponses, (response) => {
                                return !(response.IsFinalApprover === true && response.IsUserInApprovalFlow === false);
                            });
                            // If all conditions are satisfied, open the drawer; otherwise, show a warning
                            if (satisfiedElements.length === finalUserResponses.length) {
                                setShowApproval(true);
                                setShouldMakeApiCalls(true);
                            } else {
                                Toaster.warning(`Final level user cannot send ${finalLevelElements[0].type} for approval.`);
                            }
                        }
                    }
                }));
            });
        }

    };

    const handleClassificationCheckboxChange = (e) => {
        if (e.target.checked && !getConfigurationKey().IsDivisionAllowedForDepartment) {
            handlePlantCheck(CLASSIFICATIONAPPROVALTYPEID);
        }
        else {

            setSubmit(false)
        }
    };

    const handleLpsRatingCheckboxChange = (e) => {
        if (e.target.checked && !getConfigurationKey().IsDivisionAllowedForDepartment) {
            handlePlantCheck(LPSAPPROVALTYPEID);
        }
        else {
            setSubmit
                (false)
        }
    };


    const vendorFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList('', resultInput, '', '', true)
            setVendor(resultInput)
            let vendorDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
            } else {
                return vendorDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let VendorData = reactLocalStorage?.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, VendorData, false, [], false)
                } else {
                    return VendorData
                }
            }
        }
    };
    const closeDrawer = (e, type = '') => {
        if (type === 'Cancel') {
            setShowApproval(false)
            setShouldMakeApiCalls(false);


        } else {
            setShowApprovalStatus(true)
            setShouldMakeApiCalls(false);

            props.toggle('2')
        }
    }


    return (
        <>
            {showApprvalStatus ? <CommonApproval MasterId={0} OnboardingApprovalId={ONBOARDINGID} /> :
                <div className="container-fluid">
                    <ScrollToTop pointProp={"go-to-top"} />
                    <div className='intiate-unblocking-container'>
                        {props?.isMasterSummaryDrawer === undefined && <Row >
                            <Col md="3">
                                <div className="form-group">
                                    <AsyncSearchableSelectHookForm
                                        label={`${vendorLabel} (Code)`}
                                        name={'vendor'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        isClearable={true}
                                        register={register}
                                        defaultValue={selectedVendor}
                                        asyncOptions={vendorFilterList}
                                        mandatory={true}
                                        handleChange={handleVendorChange}
                                        errors={errors.vendor}
                                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                    />
                                </div>
                            </Col>
                            {selectedVendor && (
                                <Col md="3">
                                    <div className="form-group">
                                        <SearchableSelectHookForm
                                            label={'Plant (Code)'}
                                            name={'Plant'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            isClearable={true}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            options={searchableSelectType('plant')}
                                            mandatory={true}
                                            handleChange={handlePlantChange}
                                            errors={errors.Plant}
                                        />
                                    </div>
                                </Col>
                            )}
                        </Row>}
                        {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}

                        {((selectedVendor && selectedPlant) || (props?.isMasterSummaryDrawer)) && (

                            <>

                                {(!props?.isMasterSummaryDrawer) && <div>
                                    <div className="vendor-details">
                                        <Row>
                                            <Col md="3">
                                                <div className="approval-section mb-2 mt-2">
                                                    <div className="left-border"><div className='d-flex'>Approval For <TooltipCustom id="Primary_Contact" customClass="mt2 pl-1 ml-5"
                                                        tooltipText="Click checkboxes to send deviation for approval. If unavailable for LPS or classification, deviation is under approval or approved."
                                                    /></div></div>
                                                    <div className="approval-checkboxes">
                                                        {deviationData && (
                                                            <div>
                                                                {(!deviationData?.ClassificationDeviationIsInApprovalProcess && !deviationData?.ClassificationDeviationIsApproved) && <label id={`vendorClassification_Checkbox_${deviationData?.ClassificationStatus}`} className={`custom-checkbox ${deviationData?.ClassificationStatus === "Blocked" ? "" : "disabled"}`}>
                                                                    Classification
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isClassification}
                                                                        onChange={(e) => { setIsClassification(!isClassification); handleClassificationCheckboxChange(e); }}
                                                                        disabled={deviationData?.ClassificationStatus === "Blocked" ? false : true}
                                                                    />
                                                                    <span className="before-box" />
                                                                </label>}

                                                                {(!deviationData?.LPSRatingDeviationIsInApprovalProcess && !deviationData?.LPSRatingDeviationIsApproved) && <label id={`LPS_Checkbox_${deviationData?.LPSRatingStatus}`} className={`custom-checkbox ${deviationData?.LPSRatingStatus === "Blocked" ? "" : "disabled"}`}>
                                                                    LPS Rating
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isLpsRating}
                                                                        onChange={(e) => { setIsLpsRating(!isLpsRating); handleLpsRatingCheckboxChange(e); }}
                                                                        disabled={deviationData?.LPSRatingStatus === "Blocked" ? false : true}
                                                                    />
                                                                    <span className="before-box" />
                                                                </label>}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>}





                                <Col md="12">
                                    <div className="left-border">{`${vendorLabel} Details:`}</div>
                                    <div>
                                        <Table bordered>
                                            <thead>
                                                <tr>
                                                    <th>{vendorLabel} (Code)</th>
                                                    <th>Plant (Code)</th>
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <th>Classification</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <th>Classification Status</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <th>LPS Rating</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <th>LPS Rating Status</th>}
                                                    {((props?.isMasterSummaryDrawer)) && <th>Deviation Duration</th>}
                                                    {((props?.isMasterSummaryDrawer)) && <th>Deviation Start Date</th>}
                                                    {((props?.isMasterSummaryDrawer)) && <th>Deviation End Date</th>}
                                                    <th>Division</th>
                                                    {/* <th>Department (Code)</th> */}

                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr >
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorName ?? '-'}</td>
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.PlantName ?? '-'}</td>
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorClassification ?? '-'}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <td>{statusButtonFormatter((props?.isMasterSummaryDrawer ? props.deviationData?.ClassificationDeviationIsApproved : deviationData?.ClassificationIsBlocked ? deviationData?.ClassificationDeviationIsApproved : !deviationData?.ClassificationIsBlocked), "ClassificationStatus")}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorLPSRating ?? '-'}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <td>{statusButtonFormatter((props?.isMasterSummaryDrawer ? props.deviationData?.LPSRatingDeviationIsApproved : deviationData?.LPSRatingIsBlocked ? deviationData?.LPSRatingDeviationIsApproved : !deviationData?.LPSRatingIsBlocked), "LPSRatingStatus")}</td>}
                                                    {((props?.isMasterSummaryDrawer)) && <td>{props?.deviationData?.DeviationDuration}</td>}
                                                    {((props?.isMasterSummaryDrawer)) && <td>{props?.deviationData?.DeviationApprovalStartDate ? DayTime(props?.deviationData?.DeviationApprovalStartDate).format('DD/MM/YYYY') : '-'}</td>}
                                                    {((props?.isMasterSummaryDrawer)) && <td>{props?.deviationData?.DeviationApprovalEndDate ? DayTime(props?.deviationData?.DeviationApprovalEndDate).format('DD/MM/YYYY') : '-'}</td>}
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.Division ?? '-'}</td>
                                                    {/* <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.DepartmentName ?? '-'}</td> */}
                                                </tr>
                                            </tbody >
                                        </Table >
                                    </div >
                                </Col >
                            </>
                        )}
                    </div>
                </div >}
            {
                !isSuperAdmin && (!props?.isMasterSummaryDrawer) && (
                    <Row className={`sf-btn-footer no-gutters justify-content-between sticky-btn-footer`}>
                        <div className="col-sm-12 Text-right bluefooter-butn mt-3">
                            <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                                <Button
                                    id="addRMDomestic_sendForApproval"
                                    type="submit"
                                    className="approval-btn mr5"
                                    disabled={submit}
                                    onClick={handleNext}
                                    icon={"send-for-approval"}
                                    buttonName={"Send For Approval"}
                                />
                            </div>
                        </div>
                    </Row>
                )
            }
            {
                (isLpsRating || isClassification) && shouldMakeApiCalls && CanGoForApproval && (!props?.isMasterSummaryDrawer) && selectedVendor && ( // Render SendForApproval component only when the approval drawer should be open and selectedVendor is not null
                    <SendForApproval
                        isOpen={showApproval}
                        closeDrawer={closeDrawer}
                        anchor={'right'}
                        isApprovalisting={false}
                        deviationData={deviationData}
                        isClassification={isClassification}
                        isLpsRating={isLpsRating} // Pass LPS Rating approval status
                        isLpsClasssification={isLpsRating && isClassification}

                    // Add other props as needed
                    />
                )
            }
        </>
    );
};
export default InitiateUnblocking;
