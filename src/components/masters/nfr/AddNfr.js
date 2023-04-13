import { debounce } from 'lodash';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Row, Table } from 'reactstrap';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';
import { EMPTY_DATA, EMPTY_GUID, searchCount } from '../../../config/constants';

import { autoCompleteDropdown } from '../../common/CommonFunctions';
import HeaderTitle from '../../common/HeaderTitle';
import NoContentFound from '../../common/NoContentFound';
import Toaster from '../../common/Toaster';
import { AsyncSearchableSelectHookForm, NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';



//this is the data that we are getting from the backend please delete it after the backend is ready
// [{
//     groupName: 'Group-first', data: [{ vendorName: 'vendor 1', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//     { vendorName: 'vendor 2', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//     { vendorName: 'vendor 3', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//     ], netPrice: 30
// },
//     {
//         groupName: 'Group-second', data: [{ vendorName: 'vendor 1', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         { vendorName: 'vendor 2', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         { vendorName: 'vendor 3', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         { vendorName: 'vendor 4', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         ], netPrice: 10
//     }]
function AddNfr(props) {
    const { nfrData } = props;
    const dispatch = useDispatch();
    const [rowData, setRowData] = useState([])
    const [vendorName, setVendorname] = useState([])
    const [vendor, setVendor] = useState([]);
    const [addNewCosting, setAddNewCosting] = useState(false)

    const { register, setValue, getValues, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const handleVendorChange = (newValue) => {
        setVendorname(newValue)
    }

    // Sets the initial values of the form fields based on the nfrData prop.
    useEffect(() => {
        if (nfrData) {
            setValue('NprId', nfrData?.NfrPartStatusId);
            setValue('PartNo', nfrData?.PartNumber);
            setValue('PartName', nfrData?.PartName);
        }
    }, [nfrData]);

    // Adds a new costing object to the list of existing costings.
    const onSubmit = () => {
        if (vendorName.length === 0 || getValues('GroupName') === '') {
            Toaster.warning('Please select group name and vendor name');
            return false;
        }
        const newCosting = {
            groupName: getValues('GroupName'),
            data: vendorName
        };
        setRowData([...rowData, newCosting]);
        resetData()
    };
    const resetData = () => {
        setVendorname([])
        setValue('VendorName', '')
        setValue('GroupName', '')
    }

    const addDetails = debounce((index, type) => { }, 500);
    const viewDetails = (index) => { };
    const editCosting = (index) => { };
    const copyCosting = (index) => { };
    const deleteItem = (index) => { };
    const deleteRowItem = (index) => { };


    // Fetches vendor data based on user input for the vendor filter field.
    const vendorFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorWithVendorCodeSelectList(resultInput)
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
    // Redirects to the costing page when the "Add new costing" button is clicked.
    if (addNewCosting === true) {
        return <Redirect
            to={{
                pathname: "/costing",
                state: {
                    isAddMode: true,
                    isViewMode: false
                }
            }}
        />
    }


    return (
        <>
            {props.showAddNfr && <div>
                <Row className='mb-2'>
                    <Col md="4">
                        <h1>Create Estimation</h1>
                    </Col>
                    <Col md="8"><div className="parent-container">
                        <div className="child-container">
                            <TextFieldHookForm
                                label="NPR Id:"
                                name={"NprId"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={() => { }}
                                className=""
                                customClassName={"withBorder nfr-inputs"}
                                disabled={true}
                            />
                        </div>
                        <div className="child-container">
                            <TextFieldHookForm
                                label="Part No.:"
                                name={"PartNo"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={() => { }}
                                className=""
                                customClassName={"withBorder nfr-inputs"}
                                disabled={true}
                            />
                        </div>
                        <div className="child-container">
                            <TextFieldHookForm
                                label="Part Name:"
                                name={"PartName"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={() => { }}
                                className=""
                                customClassName={"withBorder nfr-inputs"}
                                disabled={true}
                            />
                        </div>
                        <div className="child-container">
                            <button type="button" className={"apply"} onClick={props?.close}>
                                <div className={'back-icon'}></div>Back
                            </button>
                        </div>
                    </div>
                    </Col>
                </Row>
                <HeaderTitle className="border-bottom"
                    title={'Estimation'}
                />
                <Row>
                    <Col md="3">
                        <TextFieldHookForm
                            label="Group Name"
                            name={"GroupName"}
                            Controller={Controller}
                            placeholder={props.isViewFlag ? '-' : "Enter"}
                            control={control}
                            register={register}
                            rules={{ required: true }}
                            mandatory={true}
                            handleChange={(e) => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.groupName}
                            disabled={props.isViewFlag}
                        />
                    </Col>
                    <Col md="3">
                        <AsyncSearchableSelectHookForm
                            label={"Vendor (Code)"}
                            name={"VendorName"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            isMulti={true}
                            defaultValue={vendor.length !== 0 ? vendor : ""}
                            // options={renderListing("Vendor")}
                            asyncOptions={vendorFilterList}
                            mandatory={true}
                            handleChange={handleVendorChange}
                            errors={errors.vendorName}
                        // disabled={customer.length === 0 ? true : false}
                        // isLoading={plantLoaderObj}
                        />
                    </Col>
                    <Col md="3" className="mt-4 pt-1">

                        <button
                            type="button"
                            className={"user-btn  pull-left mt-1"}
                            onClick={onSubmit}
                        >
                            <div className={"plus"}></div> ADD
                            {/* {isEditMode ? "UPDATE" : 'ADD'} */}
                        </button>
                        <button
                            type="button"
                            className={"reset-btn pull-left mt-1 ml5"}
                            onClick={resetData}
                        >
                            Reset
                        </button>
                    </Col>
                </Row>
                <div>
                    <Table className="table-record">
                        <thead>
                            <tr>
                                <th className="table-record">Group Name</th>
                                <th>Vendor</th>
                                <th>Sob</th>
                                <th>Costing Version</th>
                                <th className="text-center">Status</th>
                                <th>PO Price</th>
                                <th className='text-right'>Action</th>
                                <th className="table-record">Net Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowData.map((item) => (
                                <React.Fragment key={item.groupName}>
                                    {item.data.map((dataItem, index) => (
                                        <tr key={`${item.groupName}-${index}`}>
                                            {index === 0 && (
                                                <td rowSpan={item.data.length} className="table-record">{item.groupName}</td>
                                            )}
                                            <td>{dataItem.label}</td>
                                            <td><NumberFieldHookForm
                                                label=""
                                                name={`${index}.ShareOfBusinessPercent`}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d*\.?\d*$/,
                                                        message: "Invalid Number.",
                                                    },
                                                    max: {
                                                        value: 100,
                                                        message: "Should not be greater then 100"
                                                    }
                                                }}
                                                defaultValue={item.ShareOfBusinessPercent}
                                                className=""
                                                customClassName={"withBorder sob"}
                                                handleChange={(e) => {
                                                    e.preventDefault();
                                                }}
                                                errors={errors && errors.vbcGridFields && errors.vbcGridFields[index] !== undefined ? errors.vbcGridFields[index].ShareOfBusinessPercent : ""}
                                            /></td>
                                            <td><SearchableSelectHookForm
                                                label={""}
                                                name={`${index}.CostingVersion`}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                customClassName="costing-version"
                                                defaultValue={item.SelectedCostingVersion}
                                                // options={renderCostingOption(item.CostingOptions)}
                                                mandatory={false}
                                            // handleChange={(newValue) => handleCostingChange(newValue, VBCTypeId, index)}
                                            // errors={`${index}CostingVersion`}
                                            /></td>
                                            <td className="text-center">
                                                <div className={dataItem.CostingId !== EMPTY_GUID ? dataItem.Status : ''}>
                                                    {dataItem.Status}
                                                </div>
                                            </td>
                                            <td>{dataItem.poPrice}</td>
                                            <td> <div className='action-btn-wrapper pr-2'>
                                                {<button className="Add-file" type={"button"} title={"Add Costing"} onClick={() => addDetails(index)} />}
                                                {!item.IsNewCosting && item.Status !== '' && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(index)} />)}
                                                {!item.IsNewCosting && (<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(index)} />)}
                                                {!item.IsNewCosting && (<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(index)} />)}
                                                {!item.IsNewCosting && (<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(item, index)} />)}
                                                {item?.CostingOptions?.length === 0 && <button title='Discard' className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index)} />}
                                            </div></td>
                                            {index === 0 && (
                                                <td rowSpan={item.data.length} className="table-record">{item.netPrice}</td>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {rowData.length === 0 && (<tr>
                                <td colSpan={8} className="text-center"><NoContentFound title={EMPTY_DATA} /></td>
                            </tr>)}
                        </tbody>
                    </Table>
                </div>
            </div>}
        </>
    );
}

export default AddNfr;

