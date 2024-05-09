import React, { useState, useEffect } from 'react';
import ScrollToTop from '../common/ScrollToTop';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from '../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeviationApprovalData, fetchVendorData, fetchVendorDependentPlantData } from './Action';
import { Col, Row, Table } from 'reactstrap';
import Button from '../layout/Button';
import SendForApproval from './approval/SendForApproval';
import { ONBOARDINGID, VBC_VENDOR_TYPE, searchCount } from '../../config/constants';
import { getVendorNameByVendorSelectList } from '../../actions/Common';
import { autoCompleteDropdown } from '../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import CommonApproval from '../masters/material-master/CommonApproval';

const InitiateUnblocking = (props) => {


    const dispatch = useDispatch();
    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const vendorPlantData = useSelector((state) => state.supplierManagement.vendorPlantData)
    const deviationData = useSelector((state) => state.supplierManagement.deviationData)



    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [isClassification, setIsClassification] = useState((deviationData?.ClassificationStatus === ONBOARDINGID ? true : false));
    const [isLpsRating, setIsLpsRating] = useState((deviationData?.LPSRatingStatus === ONBOARDINGID ? true : false));
    const [openDraftDrawer, setOpenDraftDrawer] = useState(false); // State variable to control the opening of the approval drawer
    const [vendor, setVendor] = useState("");
    const [showApprvalStatus, setShowApprovalStatus] = useState(false)


    useEffect(() => {
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



    const handlePlantChange = (selectedValue) => {
        setSelectedPlant(selectedValue);
    };
    const handleNext = () => {
        setOpenDraftDrawer(true); // Open the approval drawer when the "Next" button is clicked
        // Remaining logic for navigation can be added here if needed
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
            setOpenDraftDrawer(false)
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
                                        label={'Vendor (Code)'}
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
                                                    <div className="left-border">Approval for</div>
                                                    <div className="approval-checkboxes">
                                                        {deviationData && (
                                                            <div>
                                                                <label id={`vendorClassification_Checkbox_${deviationData?.ClassificationStatus}`} className={`custom-checkbox`}>
                                                                    Vendor Classification
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isClassification}
                                                                        onChange={() => setIsClassification(!isClassification)}
                                                                    />
                                                                    <span className="before-box" />
                                                                </label>

                                                                <label id={`LPS_Checkbox_${deviationData?.LPSRatingStatus}`} className={`custom-checkbox`}>
                                                                    LPS Rating
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isLpsRating}
                                                                        onChange={() => setIsLpsRating(!isLpsRating)}
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
                                                    <th>Plant</th>
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <th>Vendor Classification</th>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <th>LPS Rating</th>}
                                                    <th>Division</th>
                                                    {/* <th>Department (Code)</th> */}

                                                </tr>
                                            </thead>
                                            <tbody>

                                                <tr >
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorName ?? '-'}</td>
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.PlantName ?? '-'}</td>
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'Classification') || !props?.isMasterSummaryDrawer) && <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorClassification ?? '-'}</td>}
                                                    {((props?.isMasterSummaryDrawer && props.deviationData?.DeviationType === 'LPSRating') || !props?.isMasterSummaryDrawer) && <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.VendorLPSRating ?? '-'}</td>}
                                                    <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.Division ?? '-'}</td>
                                                    {/* <td>{(props?.isMasterSummaryDrawer ? props.deviationData : deviationData)?.DepartmentName ?? '-'}</td> */}
                                                </tr>


                                            </tbody>
                                        </Table>


                                    </div>
                                </Col>

                            </>
                        )}
                    </div>
                    {selectedVendor && selectedPlant && (!props?.isMasterSummaryDrawer) && (
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
                    {openDraftDrawer && selectedPlant && (!props?.isMasterSummaryDrawer) && selectedVendor && ( // Render SendForApproval component only when the approval drawer should be open and selectedVendor is not null
                        <SendForApproval
                            isOpen={openDraftDrawer}
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
