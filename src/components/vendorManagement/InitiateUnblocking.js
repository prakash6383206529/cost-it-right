import React, { useState, useEffect } from 'react';
import ScrollToTop from '../common/ScrollToTop';
import { SearchableSelectHookForm } from '../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorDetailData } from './Action';
import { Col, Row, Table } from 'reactstrap';
import Button from '../layout/Button';
import { useHistory } from "react-router-dom";
import SendForApproval from './SendForApproval';

const InitiateUnblocking = () => {
    let history = useHistory();

    const dispatch = useDispatch();
    const { register, control, setValue, formState: { errors } } = useForm({
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
        setValue('Plant', null);
    };


    useEffect(() => {
        if (selectedVendor) {
            const filteredVendorDetails = vendorDetailData?.filter((vendor) => vendor.VendorCode === selectedVendor.value);
            setFilteredVendor(filteredVendorDetails);

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
            <div className='intiate-unblocking-container'>
                <h2>Initiate Unblocking</h2>
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
                                options={vendorDetailData?.map((vendor) => ({ label: vendor.VendorName, value: vendor.VendorCode }))}
                                mandatory={false}
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
                                    options={vendorDetailData.find(vendor => vendor.VendorCode === selectedVendor.value)?.Plant.map((plant) => ({ label: plant.Plant, value: plant.sno }))}
                                    mandatory={false}
                                    handleChange={handlePlantChange}
                                    errors={errors.Masters}
                                />
                            </div>
                        </Col>
                    )}

                    {selectedVendor && (
                        <>
                            {vendorDetailData.map((vendor) => {
                                if (vendor.VendorCode === selectedVendor.value) {
                                    return (
                                        <div key={vendor.sno}>
                                            <div className="vendor-details">
                                                <Row>

                                                    <Col md="3">
                                                        <div className="approval-section mb-2 mt-2">
                                                            <div className="left-border">Approval for</div>
                                                            <div className="approval-checkboxes">
                                                                <label id="vendorClassification_Checkbox"
                                                                    className={`custom-checkbox disabled`}
                                                                //   onChange={this.onPressSurfaceTreatment}
                                                                >
                                                                    Vendor Classification
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={vendor.ApprovalForSupplier}
                                                                        disabled={false}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        checked={vendor.ApprovalForSupplier}
                                                                    // onChange={this.onPressSurfaceTreatment}
                                                                    />
                                                                </label>

                                                                <label id="LPS_Checkbox"
                                                                    className={`custom-checkbox disabled`}
                                                                //   onChange={this.onPressSurfaceTreatment}
                                                                >
                                                                    LPS Rating
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={vendor.ApprovalForLPSRating}
                                                                        disabled={false}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        checked={vendor.ApprovalForLPSRating}
                                                                    // onChange={this.onPressSurfaceTreatment}
                                                                    />
                                                                </label>

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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendorDetailData.map((vendor) => {
                                                if (vendor.VendorCode === selectedVendor.value) {
                                                    return (
                                                        <tr key={vendor.sno}>
                                                            <td>{vendor.VendorName}</td>
                                                            <td>{vendor.Division}</td>
                                                            <td>{vendor.VendorCategory}</td>
                                                            <td>{vendor.VendorClassification}</td>
                                                            <td>{vendor.LPSRating}</td>
                                                            <td>{vendor.VendorCode}</td>
                                                        </tr>
                                                    )
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
                    Approval={filteredVendor} // Pass LPS Rating approval status
                // Add other props as needed
                />
            )}

        </div>
    );
};

export default InitiateUnblocking;
