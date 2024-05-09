import React, { useState, useEffect } from 'react';
import ScrollToTop from '../common/ScrollToTop';
import { SearchableSelectHookForm } from '../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeviationApprovalData, fetchSupplierDetailData, fetchVendorData, fetchVendorDependentPlantData } from './Action';
import { Col, Row, Table } from 'reactstrap';
import Button from '../layout/Button';
import SendForApproval from './approval/SendForApproval';
import { CLASSIFICATIONAPPROVALTYPEID, EMPTY_GUID, LPSAPPROVALTYPEID, ONBOARDINGID } from '../../config/constants';
import Switch from "react-switch";

import TooltipCustom from '../common/Tooltip';
import { loggedInUserId, showTitleForActiveToggle, userDetails, userTechnologyLevelDetailsWithoutCostingToApproval } from '../../helper';
import { getUsersOnboardingLevelAPI } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { checkFinalUser } from '../costing/actions/Costing';

const InitiateUnblocking = (props) => {


    const dispatch = useDispatch();
    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
    const supplierDetail = useSelector((state) => state.supplierManagement.supplierData)
    const vendorPlantData = useSelector((state) => state.supplierManagement.vendorPlantData)
    const deviationData = useSelector((state) => state.supplierManagement.deviationData)


    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [isClassification, setIsClassification] = useState((deviationData?.ClassificationStatus === ONBOARDINGID ? true : false));
    const [isLpsRating, setIsLpsRating] = useState((deviationData?.LPSRatingStatus === ONBOARDINGID ? true : false));
    const [openDraftDrawer, setOpenDraftDrawer] = useState(false); // State variable to control the opening of the approval drawer
    const [showApproval, setShowApproval] = useState(false);
    const [isFinalCommonApproval, setIsFinalCommonApproval] = useState(false)
    const [isClassificationChecked, setIsClassificationChecked] = useState(false)
    const [isLpsRatingChecked, setIsLpsRatingChecked] = useState(false)
    const isSendForApprovalEnabled = isClassificationChecked || isLpsRatingChecked;


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
        // Mapping logic based on the label
        if (label === 'vendor') {
            supplierDetail && supplierDetail?.map(item => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
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
    //     let approvalTypeIds = [];
    //     // Check if Classification checkbox is checked
    //     if (isClassificationChecked || isLpsRatingChecked) {
    //         // If checked, add Classification approval type ID to the array
    //         approvalTypeIds.push(isClassificationChecked ? CLASSIFICATIONAPPROVALTYPEID : LPSAPPROVALTYPEID);
    //     }


    //     if (isClassificationChecked && isLpsRatingChecked) {
    //         approvalTypeIds.push(CLASSIFICATIONAPPROVALTYPEID, LPSAPPROVALTYPEID)
    //     }
    //     approvalTypeIds = Array.from(new Set(approvalTypeIds));


    //     dispatch(getUsersOnboardingLevelAPI(loggedInUserId(), (res) => {
    //         let OnboardingApprovalLevels = Array.from(res?.data?.Data?.OnboardingApprovalLevels.values());
    //         let filteredApprovalLevels = OnboardingApprovalLevels.filter(level => approvalTypeIds.includes(level?.ApprovalTypeId));

    //         if (!res?.data?.Data?.OnboardingApprovalLevels?.length || res?.data?.Data?.OnboardingApprovalLevels?.length === 0) {

    //             setShowApproval(false)
    //             Toaster.warning('User is not in the approval flow')
    //         } else {
    //             let levelDetailsTemp = []
    //             filteredApprovalLevels?.forEach(filteredApprovalLevel => {
    //                 let response = userTechnologyLevelDetailsWithoutCostingToApproval(filteredApprovalLevel?.ApprovalTypeId, OnboardingApprovalLevels)
    //                 levelDetailsTemp.push(response); // Store the response


    //             })


    //             if (levelDetailsTemp?.length === 0) {
    //                 Toaster.warning("You don't have permission to send costing for approval.")
    //             } else {
    //                 let finalUserResponses = []; // Array to store responses for final user check

    //                 levelDetailsTemp.forEach(levelDetails => {


    //                     let obj = {};
    //                     obj.DepartmentId = userDetails().DepartmentId;
    //                     obj.UserId = loggedInUserId();
    //                     obj.TechnologyId = '';
    //                     obj.Mode = 'onboarding';
    //                     obj.approvalTypeId = levelDetails?.ApprovalTypeId; // Access the approval type ID from the response
    //                     obj.plantId = deviationData?.PlantId ?? EMPTY_GUID;

    //                     dispatch(checkFinalUser(obj, res => {
    //                         // finalUserResponses.push({ Data: res.data.Data, type: approvalTypeId === LPSAPPROVALTYPEID ? "lps" : "classification" });
    //                         finalUserResponses.push(res.data.Data);



    //                         if (res?.data?.Result) {
    //                             setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover);
    //                             if (finalUserResponses.every(response => response.IsUserInApprovalFlow === true && response.IsFinalApprover === false)) {
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

            if (isClassificationChecked && isLpsRatingChecked) {
                handleCombinedApproval(approvalTypeIds, res);
            } else if ((isClassificationChecked && res?.data?.Data?.OnboardingApprovalLevels[0]?.ApprovalTypeId === CLASSIFICATIONAPPROVALTYPEID) ||
                (isLpsRatingChecked && res?.data?.Data?.OnboardingApprovalLevels[0]?.ApprovalTypeId === LPSAPPROVALTYPEID)) {
                handleSingleApproval(approvalTypeIds, res);
            } else {

                Toaster.warning(`User is not in the approval flow for ${isClassificationChecked === CLASSIFICATIONAPPROVALTYPEID ? 'Classification' : 'LPS Rating'}`);
            }
        }));
    };

    const handleCombinedApproval = (approvalTypeIds, res) => {

        const combinedApprovalTypeIds = [...approvalTypeIds]; // Duplicate the array for both types


        if (combinedApprovalTypeIds?.length === 1) {

            Toaster.warning(`User is only in ${combinedApprovalTypeIds === LPSAPPROVALTYPEID ? 'LPS Rating' : 'Classification'} approval flow`)
            return;
        }
        processApproval(combinedApprovalTypeIds, res);

        // combinedApprovalTypeIds.forEach(approvalTypeId => {
        //     processApproval(approvalTypeId, res);
        // });
    };

    const handleSingleApproval = (approvalTypeIds, res) => {
        const type = isClassificationChecked ? 'Classification' : 'LPS Rating';


        processApproval(approvalTypeIds, res);

        // approvalTypeIds.forEach(approvalTypeId => {
        //     processApproval(approvalTypeId, res);
        // });
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

            levelDetailsTempArray.forEach(({ details, approvalTypeId }) => {

                let obj = {};
                obj.DepartmentId = userDetails().DepartmentId;
                obj.UserId = loggedInUserId();
                obj.TechnologyId = '';
                obj.Mode = 'onboarding';
                obj.approvalTypeId = details?.ApprovalTypeId; // Access the approval type ID from the response
                obj.plantId = deviationData?.PlantId ?? EMPTY_GUID;

                dispatch(checkFinalUser(obj, res => {
                    finalUserResponses.push({ Data: res.data.Data, type: approvalTypeId === LPSAPPROVALTYPEID ? "lps" : "classification" });



                    if (res?.data?.Result) {
                        setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover);
                        if (finalUserResponses.every(response => response.IsUserInApprovalFlow === true && response.IsFinalApprover === false)) {
                            setShowApproval(true);
                        } else if (finalUserResponses.some(response => response.IsFinalApprover === true)) {
                            Toaster.warning("Final level user cannot send costing for approval.");
                        } else {
                            Toaster.warning("User does not have permission to send for approval.");
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
    return (
        <div className="container-fluid">
            <ScrollToTop pointProp={"go-to-top"} />
            <div className='intiate-unblocking-container'>
                {props?.isMasterSummaryDrawer === undefined && <Row >
                    <Col md="3">
                        <div className="form-group">
                            <SearchableSelectHookForm
                                label={'Vendor'}
                                name={'SelectVendor'}
                                placeholder={'Select'}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                isClearable={true}
                                register={register}
                                defaultValue={selectedVendor}
                                options={searchableSelectType('vendor')}
                                mandatory={true}
                                handleChange={handleVendorChange}
                                errors={errors.Masters}
                            />
                        </div>
                    </Col>
                    {selectedVendor && (
                        <Col md="3">
                            <div className="form-group">
                                <SearchableSelectHookForm
                                    label={'Plant'}
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
                                    errors={errors.Masters}
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
                                            <div className="left-border">Approval for                                            <TooltipCustom id="Primary_Contact" customClass="mt-1" tooltipText="Please click on the check boxes for the approvals." />
                                            </div>
                                            <div className="approval-checkboxes">
                                                {deviationData && (
                                                    <div>
                                                        <label id={`vendorClassification_Checkbox_${deviationData?.ClassificationStatus}`} className={`custom-checkbox`}>
                                                            Vendor Classification
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
                            <div className="left-border">{'Vendor Details:'}</div>
                            <div>
                                <Table bordered>
                                    <thead>
                                        <tr>
                                            <th>Vendor Name</th>
                                            <th>Vendor Code</th>
                                            <th>Plant</th>
                                            <th>Vendor Classification</th>
                                            <th>Vendor Classification Status</th>
                                            <th>LPS Rating</th>
                                            <th>LPS Rating Status</th>
                                            <th>Division</th>
                                            <th>Vendor Category</th>

                                        </tr>
                                    </thead>
                                    <tbody>

                                        <tr >
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorName ?? '-'}</td>
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorCode ?? '-'}</td>
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.PlantName ?? '-'}</td>
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorClassification ?? '-'}</td>
                                            <td>{statusButtonFormatter((props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.ClassificationStatus, "ClassificationStatus")}</td>
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorLPSRating ?? '-'}</td>
                                            <td>{statusButtonFormatter((props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.LPSRatingStatus, "LPSRatingStatus")}</td>
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.Division ?? '-'}</td>
                                            <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.DepartmentName ?? '-'}</td>
                                        </tr>


                                    </tbody>
                                </Table>


                            </div>
                        </Col>

                    </>
                )}
            </div>
            {selectedVendor && selectedPlant && (!props?.isMasterSummaryDrawer) && !isSuperAdmin && (
                <Row className={`sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer`}>
                    <div className="col-sm-12 Text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                            <Button
                                id="addRMDomestic_sendForApproval"
                                type="submit"
                                className="approval-btn mr5"
                                disabled={!isSendForApprovalEnabled || !selectedPlant}
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
                    closeDrawer={() => setOpenDraftDrawer(false)}
                    anchor={'right'}
                    isApprovalisting={true}
                    deviationData={deviationData}
                    onboardingId={ONBOARDINGID}
                    isClassification={isClassification}
                    isLpsRating={isLpsRating} // Pass LPS Rating approval status
                // Add other props as needed
                />
            )}

        </div>
    );
};

export default InitiateUnblocking;
