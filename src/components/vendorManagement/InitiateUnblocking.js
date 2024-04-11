import React, { useState, useEffect } from 'react';
import ScrollToTop from '../common/ScrollToTop';
import { SearchableSelectHookForm } from '../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorDetailData } from './Action';
import { Col, Row } from 'reactstrap';
import Button from '../layout/Button';
import { useHistory } from "react-router-dom";
import SendForApproval from './SendForApproval';

const InitiateUnblocking = () => {
    let history = useHistory();

    const dispatch = useDispatch();
    const { register, control, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [unblockComponent, setUnblockComponent] = useState(null); // State variable to hold the component to render
    const vendorDetailData = useSelector((state) => state.vendorManagement.vendorDetailData);
    const [openDraftDrawer, setOpenDraftDrawer] = useState(false); // State variable to control the opening of the approval drawer

    const [filteredVendor, setFilteredVendor] = useState([]);


    useEffect(() => {
        dispatch(fetchVendorDetailData());
    }, [dispatch]);


    const handleVendorChange = (selectedValue) => {
        setSelectedVendor(selectedValue);
        setSelectedPlant(null); // Reset selected plant when a new vendor is selected
    };


    useEffect(() => {
        if (selectedVendor) {
            const filteredVendorDetails = vendorDetailData?.filter((vendor) => vendor.VendorCode === selectedVendor.value);
            setFilteredVendor(filteredVendorDetails);
            console.log('filteredVendorDetails: ', filteredVendorDetails);
        }
    }, [selectedVendor, vendorDetailData]);


    const handlePlantChange = (selectedValue) => {
        setSelectedPlant(selectedValue);
    };
    const handleNext = () => {
        setOpenDraftDrawer(true); // Open the approval drawer when the "Next" button is clicked
        // Remaining logic for navigation can be added here if needed
    };

    return (
        <div className="container-fluid">
            <ScrollToTop pointProp={"go-to-top"} />
            <h2>Initiate Unblocking</h2>
            <Row>
                <Col md="3">
                    <div className="form-group">
                        <SearchableSelectHookForm
                            label={'Vendor'}
                            name={'SelectVendor'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={selectedVendor}
                            options={vendorDetailData?.map((vendor) => ({ label: vendor.VendorName, value: vendor.VendorCode }))}
                            mandatory={false}
                            handleChange={handleVendorChange}
                            errors={errors.Masters}
                        />
                    </div>
                </Col>
                {selectedVendor && (
                    <Col md="12">
                        <h3>Vendor Details</h3>
                        <div>
                            {vendorDetailData.map((vendor) => {
                                if (vendor.VendorCode === selectedVendor.value) {
                                    return (
                                        <div key={vendor.sno}>
                                            <div className="vendor-details">
                                                <Row>
                                                    <Col md={6}>
                                                        <div className="vendor-info">
                                                            <p><strong>Vendor Name:</strong> {vendor.VendorName}</p>
                                                            <p><strong>Division:</strong> {vendor.Division}</p>
                                                            <p><strong>Vendor Category:</strong> {vendor.VendorCategory}</p>
                                                            <p><strong>Vendor Classification:</strong> {vendor.VendorClassification}</p>
                                                            <p><strong>LPS Rating:</strong> {vendor.LPSRating}</p>
                                                            <p><strong>Vendor Code:</strong> {vendor.VendorCode}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="plant-list">
                                                            <p><strong>Plant List:</strong></p>
                                                            {vendor.Plant.map((plant) => (
                                                                <p key={plant.sno}>{plant.Plant}</p>
                                                            ))}
                                                        </div>
                                                    </Col>
                                                    <Col md="3">
                                                        <div className="approval-section">
                                                            <h3>Approval for</h3>
                                                            <div className="approval-checkboxes">
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" checked={vendor.ApprovalForSupplier} disabled />
                                                                    <label className="form-check-label" htmlFor="approvalForSupplier">Vendor Classification</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" checked={vendor.ApprovalForLPSRating} disabled />
                                                                    <label className="form-check-label" htmlFor="approvalForLpsRating">LPS Rating</label>
                                                                </div>
                                                                <div className="form-group">
                                                                    <SearchableSelectHookForm
                                                                        label={'Plant'}
                                                                        name={'Plant'}
                                                                        placeholder={'Select'}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        rules={{ required: false }}
                                                                        register={register}
                                                                        defaultValue={'select'}
                                                                        options={vendorDetailData.find(vendor => vendor.VendorCode === selectedVendor.value)?.Plant.map((plant) => ({ label: plant.Plant, value: plant.sno }))}
                                                                        mandatory={false}
                                                                        handleChange={handlePlantChange}
                                                                        errors={errors.Masters}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </Col>
                )}
                {selectedVendor && selectedPlant && (
                    <Row>
                        <Col md="12">
                            {unblockComponent}
                            <Button color="primary" onClick={handleNext}>Next</Button>
                        </Col>
                    </Row>
                )}
            </Row>
            {openDraftDrawer && selectedPlant && selectedVendor && ( // Render SendForApproval component only when the approval drawer should be open and selectedVendor is not null
                <SendForApproval
                    isOpen={openDraftDrawer}
                    closeDrawer={() => setOpenDraftDrawer(false)}
                    anchor={'right'}
                    isApprovalisting={true}
                    Approval={filteredVendor} // Pass LPS Rating approval status
                // Add other props as needed
                />
            )}

        </div>
    );
};

export default InitiateUnblocking;
