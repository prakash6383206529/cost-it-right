import React, { useState, useEffect } from 'react';
import ScrollToTop from '../common/ScrollToTop';
import { SearchableSelectHookForm } from '../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSupplierDetailData } from './Action';
import { Col, Row, Table } from 'reactstrap';
import Button from '../layout/Button';
import SendForApproval from './approval/SendForApproval';

const InitiateUnblocking = () => {
    const dispatch = useDispatch();
    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [unblockComponent, setUnblockComponent] = useState(null); // State variable to hold the component to render
    const supplierDetailData = useSelector((state) => state.supplierManagement.supplierDetailData);
    console.log('supplierDetailData: ', supplierDetailData);
    const [openDraftDrawer, setOpenDraftDrawer] = useState(false); // State variable to control the opening of the approval drawer

    const [filteredPlant, setFilteredPlant] = useState([]);


    useEffect(() => {
        dispatch(fetchSupplierDetailData());
    }, [dispatch]);


    const handleVendorChange = (selectedValue) => {
        setSelectedVendor(selectedValue);
        setSelectedPlant(null); // Reset selected plant when a new vendor is selected
        setValue('Plant', null);
    };


    useEffect(() => {
        if (selectedVendor && selectedPlant) {
            const selectedVendorDetails = supplierDetailData?.find((vendor) => vendor.SupplierCode === selectedVendor.value);
            if (selectedVendorDetails) {
                const selectedPlantData = selectedVendorDetails.Plant.find((plant) => plant.Plant === selectedPlant.label);
                console.log('selectedPlantData: ', selectedPlantData);
                setFilteredPlant(selectedPlantData);
            }
        }
    }, [selectedVendor, selectedPlant, supplierDetailData]);


    const handlePlantChange = (selectedValue) => {
        setSelectedPlant(selectedValue);
    };
    const handleNext = () => {
        setOpenDraftDrawer(true); // Open the approval drawer when the "Next" button is clicked
        // Remaining logic for navigation can be added here if needed
    };
    console.log(selectedPlant);
    return (
        <div className="container-fluid">
            <ScrollToTop pointProp={"go-to-top"} />
            <div className='intiate-unblocking-container'>
                <Row >
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
                                options={supplierDetailData?.map((vendor) => ({ label: vendor.SupplierName, value: vendor.SupplierCode }))}
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
                                    defaultValue={'select'}
                                    options={supplierDetailData.find(vendor => vendor.SupplierCode === selectedVendor.value)?.Plant.map((plant) => ({ label: plant.Plant, value: plant.sno }))}
                                    mandatory={true}
                                    handleChange={handlePlantChange}
                                    errors={errors.Masters}
                                />
                            </div>
                        </Col>
                    )}

                    {selectedVendor && selectedPlant && (
                        <>
                            {supplierDetailData.map((vendor) => {
                                if (vendor.SupplierCode === selectedVendor.value) {
                                    const selectedPlantData = vendor.Plant.find((plant) => plant.Plant === selectedPlant.label);

                                    return (
                                        <div key={vendor.sno}>
                                            <div className="vendor-details">
                                                <Row>
                                                    <Col md="3">
                                                        <div className="approval-section mb-2 mt-2">
                                                            <div className="left-border">Approval for</div>
                                                            <div className="approval-checkboxes">
                                                                {selectedPlantData && (
                                                                    <div key={selectedPlantData.sno}>
                                                                        <label id={`vendorClassification_Checkbox_${selectedPlantData.sno}`} className={`custom-checkbox disabled`}>
                                                                            Vendor Classification
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedPlantData.ApprovalForSupplier}
                                                                                disabled={false}
                                                                            />
                                                                            <span className=" before-box" checked={selectedPlantData.ApprovalForSupplier} />
                                                                        </label>

                                                                        <label id={`LPS_Checkbox_${selectedPlantData.sno}`} className={`custom-checkbox disabled`}>
                                                                            LPS Rating
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedPlantData.ApprovalForLPSRating}
                                                                                disabled={false}
                                                                            />
                                                                            <span className=" before-box" checked={selectedPlantData.ApprovalForLPSRating} />
                                                                        </label>
                                                                    </div>
                                                                )}
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

                            <Col md="12">
                                <div className="left-border">{'Vendor Details:'}</div>
                                <div>
                                    <Table bordered>
                                        <thead>
                                            <tr>
                                                <th>Vendor Name</th>
                                                <th>Division</th>
                                                <th>Vendor Category</th>
                                                <th>Vendor Classification</th>
                                                <th>LPS Rating</th>
                                                <th>Vendor Code</th>
                                                <th>Plant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supplierDetailData.map((vendor) => {
                                                if (vendor.SupplierCode === selectedVendor.value) {
                                                    if (vendor?.Plant?.length > 0) {
                                                        // Filter the Plant array to get the details of the selected plant
                                                        const selectedPlants = vendor?.Plant?.find((plant) => plant.Plant === selectedPlant.label);
                                                        console.log('selectedPlant: ', selectedPlants);

                                                        if (selectedPlants) {
                                                            return (
                                                                <tr key={selectedPlants.sno}>
                                                                    <td>{vendor.SupplierName}</td>
                                                                    <td>{vendor.Division}</td>
                                                                    <td>{vendor.SupplierCategory}</td>
                                                                    <td>{selectedPlants.SupplierClassification}</td>
                                                                    <td>{selectedPlants.LPSRating}</td>
                                                                    <td>{vendor.SupplierCode}</td>
                                                                    <td>{selectedPlants.Plant}</td>
                                                                </tr>
                                                            );
                                                        }
                                                    }
                                                }
                                                return null;
                                            })}

                                        </tbody>
                                    </Table>


                                </div>
                            </Col>
                        </>
                    )}
                </Row>
            </div>
            {selectedVendor && (
                <Row className={`sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer`}>
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                            {unblockComponent}
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
            {openDraftDrawer && selectedPlant && selectedVendor && ( // Render SendForApproval component only when the approval drawer should be open and selectedVendor is not null
                <SendForApproval
                    isOpen={openDraftDrawer}
                    closeDrawer={() => setOpenDraftDrawer(false)}
                    anchor={'right'}
                    isApprovalisting={true}
                    Approval={filteredPlant} // Pass LPS Rating approval status
                // Add other props as needed
                />
            )}

        </div>
    );
};

export default InitiateUnblocking;
