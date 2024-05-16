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

import TooltipCustom from '../common/Tooltip';
import { loggedInUserId, showTitleForActiveToggle, userDetails, userTechnologyLevelDetailsWithoutCostingToApproval } from '../../helper';
import { getUsersOnboardingLevelAPI } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { checkFinalUser } from '../costing/actions/Costing';
import { autoCompleteDropdown } from '../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import CommonApproval from '../masters/material-master/CommonApproval';
import { getVendorNameByVendorSelectList } from '../../actions/Common';
import _ from 'lodash'
import { MESSAGES } from '../../config/message';

const InitiateUnblocking = (props) => {
    const dispatch = useDispatch();
    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
    const vendorPlantData = useSelector((state) => state.supplierManagement.vendorPlantData)
    const deviationData = useSelector((state) => state.supplierManagement.deviationData)


    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [isClassification, setIsClassification] = useState((deviationData?.ClassificationStatus === ONBOARDINGID ? true : false));
    const [isLpsRating, setIsLpsRating] = useState((deviationData?.LPSRatingStatus === ONBOARDINGID ? true : false));
    const [showApproval, setShowApproval] = useState(false);
    const [isClassificationChecked, setIsClassificationChecked] = useState(false)
    const [isLpsRatingChecked, setIsLpsRatingChecked] = useState(false)
    const [vendor, setVendor] = useState("");
    const [showApprvalStatus, setShowApprovalStatus] = useState(false)


    useEffect(() => {
        setIsSuperAdmin(userDetails()?.Role === "SuperAdmin")
        dispatch(fetchVendorData());
        if (selectedVendor) {
            dispatch(fetchVendorDependentPlantData(selectedVendor.value));
            // dispatch(fetchDeviationApprovalData(selectedVendor.Value, selectedPlant.Value)); // Use selectedVendor.Value and selectedPlant.Value to access the values

        }
    }, [selectedVendor]);
    useEffect(() => {
        if (selectedVendor && selectedPlant) {
            dispatch(fetchDeviationApprovalData(selectedVendor?.value, selectedPlant?.value));
        }
    }, [selectedVendor]);

    useEffect(() => {

        if (selectedVendor && selectedPlant) {
            dispatch(fetchDeviationApprovalData(selectedVendor.value, selectedPlant.value)); // Use selectedVendor.Value and selectedPlant.Value to access the values
        }
    }, [selectedVendor, selectedPlant, dispatch]); // Include dispatch in the dependency array

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
        setSelectedVendor(selectedValue);
        setSelectedPlant(null); // Reset selected plant when a new vendor is selected
        setValue('Plant', null);
    };


    const statusButtonFormatter = (status, fieldName) => {
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    <Switch
                        // onChange={() => handleChange(cellValue, rowData)}
                        checked={status === "Blocked"}
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
        setSelectedPlant(selectedValue);
    };
    // const handleNext = () => {
    //     // let approvalTypeIds = [];
    //     // // Check if Classification checkbox is checked
    //     // if (isClassificationChecked || isLpsRatingChecked) {
    //     //     // If checked, add Classification approval type ID to the array
    //     //     approvalTypeIds.push(isClassificationChecked ? CLASSIFICATIONAPPROVALTYPEID : LPSAPPROVALTYPEID);
    //     // }
    //     // if (isClassificationChecked && isLpsRatingChecked) {
    //     //     approvalTypeIds.push(CLASSIFICATIONAPPROVALTYPEID, LPSAPPROVALTYPEID)
    //     // }
    //     // approvalTypeIds = Array.from(new Set(approvalTypeIds));


    //     dispatch(getUsersOnboardingLevelAPI(loggedInUserId(), (res) => {
    //         
    //         let OnboardingApprovalLevels = Array.from(res?.data?.Data?.OnboardingApprovalLevels.values());
    //         
    //         // let filteredApprovalLevels = OnboardingApprovalLevels.filter(level => approvalTypeIds.includes(level?.ApprovalTypeId));

    //         if (!res?.data?.Data?.OnboardingApprovalLevels?.length || res?.data?.Data?.OnboardingApprovalLevels?.length === 0) {
    //             
    //             setShowApproval(false)
    //             Toaster.warning('User is not in the approval flow')
    //         } else {
    //             let levelDetailsTemp = []
    //             OnboardingApprovalLevels?.forEach(OnboardingApprovalLevel => {
    //                 let response = userTechnologyLevelDetailsWithoutCostingToApproval(OnboardingApprovalLevel?.ApprovalTypeId, OnboardingApprovalLevels)
    //                 levelDetailsTemp.push(response); // Store the response
    //                 


    //             })


    //             if (levelDetailsTemp?.length === 0) {
    //                 Toaster.warning("You don't have permission to send costing for approval.")
    //             }
    //             else {
    //                 let finalUserResponses = []; // Array to store responses for final user check
    //                 levelDetailsTemp.forEach(details => {
    //                     

    //                     let obj = {};
    //                     obj.DepartmentId = userDetails().DepartmentId;
    //                     obj.UserId = loggedInUserId();
    //                     obj.TechnologyId = '';
    //                     obj.Mode = 'onboarding';
    //                     obj.approvalTypeId = details?.ApprovalTypeId; // Access the approval type ID from the response
    //                     obj.plantId = deviationData?.PlantId ?? EMPTY_GUID;
    //                     dispatch(checkFinalUser(obj, res => {
    //                         finalUserResponses.push({ ...res.data.Data, type: details.ApprovalTypeId === LPSAPPROVALTYPEID ? "lps" : "classification" });
    //                         

    //                         if (res?.data?.Result) {
    //                             setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover);
    //                             let tempArr = _.filter(finalUserResponses, ['IsUserInApprovalFlow', true], ['IsFinalApprover', false]);
    //                             

    //                             if (tempArr?.length > 0) {
    //                                 setShowApproval(true);
    //                             } else if (finalUserResponses.some(response => response.IsFinalApprover === true)) {
    //                                 Toaster.warning("Final level user cannot send costing for approval.");
    //                             } else {
    //                                 Toaster.warning("User does not have permission to send for approval.");
    //                             }
    //                         }
    //                     }));
    //                 });
    //             }

    //         }
    //     }));
    // };
    const handleNext = () => {
        dispatch(getUsersOnboardingLevelAPI(loggedInUserId(), (res) => {
            let approvalTypeIds = Array.from(res?.data?.Data?.OnboardingApprovalLevels.values(), level => level.ApprovalTypeId);
            if (approvalTypeIds?.length === 0 || !res?.data?.Data?.OnboardingApprovalLevels?.length || res?.data?.Data?.OnboardingApprovalLevels?.length === 0) {
                setShowApproval(false)
                Toaster.warning('User is not in the approval flow');
                return;
            }

            let checkedApproval = [];
            if (isClassificationChecked && isLpsRatingChecked) {

                checkedApproval.push(CLASSIFICATIONAPPROVALTYPEID, LPSAPPROVALTYPEID)
                handleCombinedApproval(approvalTypeIds, res, checkedApproval);
            } else if (isClassificationChecked || isLpsRatingChecked) {

                checkedApproval.push(isClassificationChecked ? CLASSIFICATIONAPPROVALTYPEID : LPSAPPROVALTYPEID)
                const similarApprovals = checkedApproval.filter(approval => approvalTypeIds.includes(approval));

                handleSingleApproval(similarApprovals, res, checkedApproval);
            } else {
                Toaster.warning(`User is not in the approval flow for ${isClassificationChecked === CLASSIFICATIONAPPROVALTYPEID ? 'LPS Rating' : 'Classification'}`);
            }
        }));
    };

    const handleCombinedApproval = (approvalTypeIds, res, checkedApproval) => {

        let approvalType = checkedApproval?.find(approval => approval === approvalTypeIds[0]);
        if (approvalTypeIds?.length === 1) {
            // Match approvalTypeIds with checkedApproval

            if (approvalType === CLASSIFICATIONAPPROVALTYPEID) {
                Toaster.warning(`User is only in classification approval flow`);
            } else if (approvalType === LPSAPPROVALTYPEID) {
                Toaster.warning(`User is only in LPS Rating approval flow`);
            } else {
                Toaster.error("Invalid approval type.");
            }
            return;
        }
        processApproval(approvalTypeIds, res);
    };


    const handleSingleApproval = (approvalTypeIds, res, checkedApproval) => {

        const arraysAreEqual = (array1, array2) => {
            return JSON.stringify(array1) === JSON.stringify(array2);
        };


        if (!arraysAreEqual(approvalTypeIds, checkedApproval)) {


            Toaster.warning(`User is not in the approval flow for ${checkedApproval === CLASSIFICATIONAPPROVALTYPEID ? 'LPS Rating' : 'Classification'}`);
        } else {
            processApproval(checkedApproval, res);
        }
    };

    const processApproval = (approvalTypeIds, res) => {

        let levelDetailsTempArray = []; // Array to store level details responses
        approvalTypeIds.forEach(approvalTypeId => {
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

                    finalUserResponses.push({ ...res.data.Data, type: details.ApprovalTypeId === LPSAPPROVALTYPEID ? "lps" : "classification" });
                    let tempArr = _.filter(finalUserResponses, ['IsUserInApprovalFlow', true], ['IsFinalApprover', false]);

                    // if (res?.data?.Result) {
                    // 
                    // setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover);
                    if (finalUserResponses.length === levelDetailsTempArray.length) {

                        if (tempArr?.length === 1) {

                            if (tempArr[0].IsFinalApprover === false && tempArr[0].IsUserInApprovalFlow === true) {

                                setShowApproval(true);
                            } else {

                                Toaster.warning(`Final level user cannot send ${tempArr.type} for approval.`);
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
        setIsClassificationChecked(e.target.checked);
    };

    // Function to handle LPS rating checkbox change
    const handleLpsRatingCheckboxChange = (e) => {
        setIsLpsRatingChecked(e.target.checked);
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
        } else {
            setShowApprovalStatus(true)
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
                                        label={'Supplier (Code)'}
                                        name={'SelectVendor'}
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
                                        errors={errors.SelectVendor}
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

                        {((selectedVendor && selectedPlant) || (props?.isMasterSummaryDrawer)) && (
                            <>

                                {(!props?.isMasterSummaryDrawer) && <div>
                                    <div className="vendor-details">
                                        <Row>
                                            <Col md="3">
                                                <div className="approval-section mb-2 mt-2">
                                                    <div className="left-border">Approval for   <TooltipCustom id="Primary_Contact" customClass="mt-1" tooltipText="Please click on the checkboxes to send approval for." /></div>
                                                    <div className="approval-checkboxes">
                                                        {deviationData && (
                                                            <div>
                                                                <label id={`vendorClassification_Checkbox_${deviationData?.ClassificationStatus}`} className={`custom-checkbox`}>
                                                                    Classification
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isClassification}
                                                                        onChange={(e) => { setIsClassification(!isClassification); handleClassificationCheckboxChange(e); }}
                                                                        disabled={deviationData?.ClassificationStatus === "Blocked" ? false : true}
                                                                    />
                                                                    <span className="before-box" />
                                                                </label>

                                                                <label id={`LPS_Checkbox_${deviationData?.LPSRatingStatus}`} className={`custom-checkbox`}>
                                                                    LPS Rating
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isLpsRating}
                                                                        onChange={(e) => { setIsLpsRating(!isLpsRating); handleLpsRatingCheckboxChange(e); }}
                                                                        disabled={deviationData?.LPSRatingStatus === "Blocked" ? false : true}
                                                                    />
                                                                    <span className="before-box" />
                                                                </label>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>}





                                <Col md="12">
                                    <div className="left-border">{'Supplier Details:'}</div>
                                    <div>
                                        <Table bordered>
                                            <thead>
                                                <tr>
                                                    <th>Supplier (Code)</th>
                                                    <th>Plant (Code)</th>
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <th>Classification</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <th>Classification Status</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <th>LPS Rating</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <th>LPS Rating Status</th>}
                                                    <th>Division</th>
                                                    {/* <th>Department (Code)</th> */}

                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr >
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorName ?? '-'}</td>
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.PlantName ?? '-'}</td>
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorClassification ?? '-'}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <td>{statusButtonFormatter((props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.ClassificationStatus, "ClassificationStatus")}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorLPSRating ?? '-'}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <td>{statusButtonFormatter((props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.LPSRatingStatus, "LPSRatingStatus")}</td>}
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
                    {selectedVendor && (isLpsRating || isClassification) && !isSuperAdmin && selectedPlant && (!props?.isMasterSummaryDrawer) && (
                        <Row className={`sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer`}>
                            <div className="col-sm-12 Text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                                    <Button
                                        id="addRMDomestic_sendForApproval"
                                        type="submit"
                                        className="approval-btn mr5"
                                        disabled={!selectedPlant}
                                        onClick={handleNext}
                                        icon={"send-for-approval"}
                                        buttonName={"Send For Approval"}
                                    />
                                </div>
                            </div>
                        </Row>
                    )}
                    {selectedPlant && (!props?.isMasterSummaryDrawer) && selectedVendor && ( // Render SendForApproval component only when the approval drawer should be open and selectedVendor is not null
                        <SendForApproval
                            isOpen={showApproval}
                            closeDrawer={closeDrawer}
                            anchor={'right'}
                            isApprovalisting={true}
                            deviationData={deviationData}
                            isClassification={isClassification}
                            isLpsRating={isLpsRating} // Pass LPS Rating approval status
                        // Add other props as needed
                        />
                    )}
                </div>}
        </>
    );
};

export default InitiateUnblocking;
