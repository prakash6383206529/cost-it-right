import _, { debounce } from 'lodash';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Row, Table } from 'reactstrap';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';
import { EMPTY_DATA, EMPTY_GUID, NFR, NFRTypeId, VBCTypeId, searchCount } from '../../../config/constants';

import { autoCompleteDropdown } from '../../common/CommonFunctions';
import HeaderTitle from '../../common/HeaderTitle';
import NoContentFound from '../../common/NoContentFound';
import Toaster from '../../common/Toaster';
import { AsyncSearchableSelectHookForm, NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { getNFRPartWiseGroupDetail, saveNFRGroupDetails } from './actions/nfr';
import { checkVendorPlantConfigurable, loggedInUserId, userDetails } from '../../../helper';
import { dataLiist } from '../../../config/masterData';
import { createCosting, getBriefCostingById, storePartNumber } from '../../costing/actions/Costing';
import ApprovalDrawer from './ApprovalDrawer';



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
    const { nfrData, nfrIdsList } = props;
    const dispatch = useDispatch();
    const [rowData, setRowData] = useState([])
    const [vendorName, setVendorname] = useState([])
    const [vendor, setVendor] = useState([]);
    const [addNewCosting, setAddNewCosting] = useState(false)
    const [isRowEdited, setIsRowEdited] = useState(false)
    const [nfrPartDetail, setNFRPartDetail] = useState([])
    // const [nFRPartWiseGroupDetails, setNFRPartWiseGroupDetails] = useState({})
    const partNumber = useSelector(state => state.costing.partNo);
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const partInfo = useSelector((state) => state.costing.partInfo)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    let history = useHistory();
    const [isAddDetails, setIsAddDetails] = useState(false);
    const [partInfoStepTwo, setpartInfoStepTwo] = useState({});
    const [costingData, setcostingData] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [costingOptionsSelectedObject, setCostingOptionsSelectedObject] = useState([]);
    const [selectedCheckBox, setSelectedCheckbox] = useState(false);

    const { register, setValue, getValues, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const handleVendorChange = (newValue) => {
        setVendorname(newValue)
    }

    useEffect(() => {
        let requestObject = {
            nfrId: nfrIdsList?.NfrMasterId,
            partWiseDetailId: nfrIdsList?.NfrPartWiseDetailId,
            plantId: initialConfiguration?.DefaultPlantId
        }
        dispatch(getNFRPartWiseGroupDetail(requestObject, (res) => {
            // setNFRPartWiseGroupDetails(res?.data?.Data)
            if (res?.data?.Result) {
                const newArray = res?.data?.Data?.groupWiseResponse?.map((item) => {
                    const vendorData = item.VendorList.map((vendor) => {
                        return {
                            label: `${vendor.VendorName} (${vendor.VendorCode})`,
                            value: vendor.VendorId,
                            vendorName: vendor.VendorName,
                            vendorCode: vendor.VendorCode,
                            CostingOptions: vendor.CostingOptions
                        };
                    });

                    return {
                        groupName: item.GroupName,
                        data: vendorData,
                    };
                });

                setNFRPartDetail(res?.data?.Data)
                setRowData(newArray)
            }
        }))
    }, [])

    useEffect(() => {
        if (rowData?.length === 0) {
            setValue('GroupName', 'OEQA 1');
        }
    }, [rowData])

    // Sets the initial values of the form fields based on the nfrData prop.
    useEffect(() => {
        if (nfrData) {
            setValue('NprId', nfrData?.NfrPartStatusId);
            setValue('PartNo', nfrData?.PartNumber);
            setValue('PartName', nfrData?.PartName);
        }
    }, [nfrData]);

    // Adds a new costing object to the list of existing costings.
    const addRow = () => {
        if (vendorName.length === 0 || getValues('GroupName') === '') {
            Toaster.warning('Please select group name and vendor name');
            return false;
        }
        const newCosting = {
            groupName: getValues('GroupName'),
            data: vendorName
        };
        setRowData([...rowData, newCosting]);
        resetData(true)
    };

    const updateRow = () => {
        let list = [...rowData]
        let rowIndex = list.findIndex(element => element?.groupName === getValues('GroupName'))
        let rowtemp = list[rowIndex]
        rowtemp.data = getValues('VendorName')
        let finalList = Object.assign([...list], { [rowIndex]: rowtemp })
        setRowData([...finalList]);
        resetData(true)
        setIsRowEdited(false)
    };

    const resetData = (removeGroup) => {
        setVendorname([])
        setValue('VendorName', '')
        setIsRowEdited(false)
        if (removeGroup) {
            setValue('GroupName', '')
        }
    }
    const addDetails = debounce((data, index1, index) => {
        let dataa = rowData[index1]
        let list = dataa?.data && dataa?.data[index]
        const userDetail = userDetails()
        let tempData = viewCostingData[0]

        const Data = {
            PartId: nfrData?.PartId,
            PartTypeId: nfrPartDetail?.PartTypeId,
            PartType: nfrData?.PartType,
            PartNumber: nfrData?.PartNumber,
            PartName: nfrData?.PartName,
            TechnologyId: nfrData?.TechnologyId,
            ZBCId: userDetail.ZBCSupplierInfo.VendorId,
            VendorId: list?.value,
            VendorPlantId: checkVendorPlantConfigurable() ? tempData.vendorPlantId : '',
            // VendorPlantName: tempData.vendorPlantName,
            // VendorPlantCode: tempData.vendorPlantCode,
            VendorName: list?.vendorName,
            VendorCode: list?.vendorCode,
            PlantId: initialConfiguration?.DefaultPlantId,
            PlantName: initialConfiguration?.DefaultPlantName,
            PlantCode: initialConfiguration?.DefaultPlantCode,
            DestinationPlantId: initialConfiguration?.DefaultPlantId,
            DestinationPlantName: initialConfiguration?.DefaultPlantName,
            DestinationPlantCode: initialConfiguration?.DefaultPlantCode,
            UserId: loggedInUserId(),
            LoggedInUserId: loggedInUserId(),
            ShareOfBusinessPercent: 0,
            IsAssemblyPart: false,
            Description: nfrPartDetail?.Description,
            ECNNumber: nfrPartDetail?.ECNNumber,
            RevisionNumber: nfrPartDetail?.RevisionNumber,
            DrawingNumber: nfrPartDetail?.DrawingNumber,
            Price: nfrPartDetail?.Price ? nfrPartDetail?.Price : '',
            EffectiveDate: nfrPartDetail?.EffectiveDate,
            CostingHead: NFRTypeId,
            CostingTypeId: NFRTypeId,
            CustomerId: '',
            CustomerName: '',
            Customer: ''
        }
        dispatch(createCosting(Data, (res) => {
            if (res.data?.Result) {
                setpartInfoStepTwo({ costingId: res.data?.Data?.CostingId, NFRTypeId })
                setcostingData(res.data?.Data)
                dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
                    setIsAddDetails(true)
                }))
            }
        }))

    }, 500);

    const viewDetails = (index) => { };

    const editCosting = (index) => {
        let tempData;
        tempData = costingOptionsSelectedObject[index]
        dispatch(getBriefCostingById(tempData?.CostingId, (res) => {
            if (res?.data?.Result) {
                setpartInfoStepTwo(partInfoStepTwo)
                setcostingData({ costingId: tempData?.CostingId, NFRTypeId })
                setIsAddDetails(true)
            }

        }))

    };

    const copyCosting = (index) => { };
    const deleteItem = (index) => { };
    const deleteRowItem = (index) => { };

    const editRow = (item, index) => {
        setVendorname(item?.data)
        setValue('VendorName', item?.data)
        setValue('GroupName', item?.groupName)
        setIsRowEdited(true)
    }

    const deleteRow = (item, index) => {
        let list = [...rowData]
        let rowtemp = list.filter(element => element?.groupName !== item?.groupName)
        setRowData(rowtemp)
        setIsRowEdited(false)
        resetData(true)
    }

    const saveEstimation = () => {

        let requestObject = {
            GroupName: rowData[0]?.groupName,
            NfrId: nfrIdsList?.NfrMasterId,
            PlantId: '27D5F3F4-871A-40AD-8E75-D5AB4B7B227B',
            NfrPartWiseDetailId: nfrIdsList?.NfrPartWiseDetailId,
            LoggedInUserId: loggedInUserId(),
            vendorList: _.map(rowData[0]?.data, 'value')
        }
        dispatch(saveNFRGroupDetails(requestObject, (res) => {
            if (res?.data?.Result === true) {
                Toaster.success("Group details saved successfully")
            }
        }))
    }

    const vendorFilterList = async (inputValue) => {
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorWithVendorCodeSelectList(VBCTypeId, resultInput)
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

    if (isAddDetails === true) {
        return <Redirect
            to={{
                pathname: "/costing",
                state: {
                    isAddMode: true,
                    isViewMode: false,
                    costingData: costingData,
                    partInfoStepTwo: partInfoStepTwo,
                    isNFR: true
                }

            }}
        />
    }

    const renderListing = (options) => {
        let opts1 = []
        if (options?.length > 0) {
            let opts = [...options]
            opts1 = [...options]
            opts1 = opts && opts?.map(item => {
                item.label = item.DisplayCostingNumber
                item.value = item.CostingId
                return item
            })
        }
        return opts1
    }
    // const handleCostingChange = (newValue, type, index, costingOptionsDropDown) => {
    const handleCostingChange = (newValue, indexOuter, indexInside) => {
        let tempObject = []
        // if (type === VBC) {
        tempObject = [...rowData[indexOuter]?.data[indexInside]?.CostingOptions]
        // }

        const indexOfCostingOptions = tempObject.findIndex((el) => el.CostingId === newValue.value)

        let costingOptionsSelectedObjectTemp = {
            ...tempObject[indexOfCostingOptions],
            SubAssemblyCostingId: tempObject[indexOfCostingOptions]?.SubAssemblyCostingId,
            AssemblyCostingId: tempObject[indexOfCostingOptions]?.AssemblyCostingId,
            SentDate: tempObject[indexOfCostingOptions]?.SentDate,
        }

        let costingOptionsSelectedArray = Object.assign([...costingOptionsSelectedObject], { [indexInside]: costingOptionsSelectedObjectTemp })
        setCostingOptionsSelectedObject(costingOptionsSelectedArray)
        let temprowData = [...rowData]
        let temprowDataInside = temprowData[indexOuter]?.data
        let costingOfVendors = {
            ...rowData[indexOuter]?.data[indexInside]
        }
        let tempData = {
            ...costingOfVendors,
            SelectedCostingVersion: newValue,
        }

        temprowDataInside = Object.assign([...temprowDataInside], { [indexInside]: tempData })
        let newObj = {
            data: temprowDataInside,
            groupName: temprowData[indexOuter]?.groupName
        }
        temprowData = Object.assign([...temprowData], { [indexOuter]: newObj })
        setRowData(temprowData)
    }

    const onCheckBoxClick = (index) => {
        let temp = selectedCheckBox
        console.log(rowData, 'rowData');
        setSelectedCheckbox(!temp)
        if (!temp === true) {

        }

    }
    const sendForApproval = () => {
        setShowDrawer(true)
    }
    const closeShowApproval = () => {
        setShowDrawer(false)
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
                            disabled={true}
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
                            defaultValue={vendorName.length !== 0 ? vendorName : ""}
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

                        {isRowEdited ?
                            <button
                                type="button"
                                className={"user-btn  pull-left mt-1"}
                                onClick={updateRow}
                            >
                                <div className={"plus"}></div> UPDATE
                            </button> :
                            <button
                                type="button"
                                className={"user-btn  pull-left mt-1"}
                                onClick={addRow}
                            >
                                <div className={"plus"}></div> ADD
                                {/* {isEditMode ? "UPDATE" : 'ADD'} */}
                            </button>}
                        <button
                            type="button"
                            className={"reset-btn pull-left mt-1 ml5"}
                            onClick={() => { resetData(false) }}
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
                                <th>Costing Version</th>
                                <th className="text-center">Status</th>
                                <th>PO Price</th>
                                <th className='text-right'>Action</th>
                                <th className="table-record">Row Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowData?.map((item, indexOuter) => (
                                <React.Fragment key={item?.groupName}>
                                    {item?.data?.map((dataItem, indexInside) => (
                                        <tr key={`${item?.groupName} -${indexInside} `}>
                                            {indexInside === 0 && (
                                                <>
                                                    <td rowSpan={item?.data.length} className="table-record">
                                                        <label
                                                            className={`custom-checkbox`}
                                                            onChange={(e) => onCheckBoxClick(indexOuter)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCheckBox}
                                                            //   disabled={CostingViewMode ? true : false}
                                                            />
                                                            <span
                                                                className=" before-box"
                                                                checked={selectedCheckBox}
                                                                onChange={(e) => onCheckBoxClick(indexOuter)}
                                                            />
                                                        </label>
                                                        {item?.groupName}</td>
                                                </>
                                            )}
                                            <td>{dataItem?.label}</td>

                                            <td><SearchableSelectHookForm
                                                label={""}
                                                name={`${indexInside}.CostingVersion`}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                customClassName="costing-version"
                                                defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                                options={renderListing(dataItem?.CostingOptions)}
                                                mandatory={false}
                                                handleChange={(newValue) => handleCostingChange(newValue, indexOuter, indexInside)}
                                            // handleChange={(newValue) => handleCostingChange(newValue, VBCTypeId, index)}
                                            // errors={`${indexInside} CostingVersion`}
                                            /></td>
                                            <td className="text-center">
                                                <div className={dataItem?.CostingId !== EMPTY_GUID ? dataItem?.Status : ''}>
                                                    {dataItem?.Status}
                                                </div>
                                            </td>
                                            <td>{dataItem?.poPrice}</td>
                                            <td> <div className='action-btn-wrapper pr-2'>
                                                {<button className="Add-file" type={"button"} title={"Add Costing"} onClick={() => addDetails(dataItem, indexOuter, indexInside)} />}
                                                {!item?.IsNewCosting && item?.Status !== '' && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(indexInside)} />)}
                                                {!item?.IsNewCosting && (<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(indexInside)} />)}
                                                {!item?.IsNewCosting && (<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(indexInside)} />)}
                                                {!item?.IsNewCosting && (<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(item, indexInside)} />)}
                                                {item?.CostingOptions?.length === 0 && <button title='Discard' className="CancelIcon" type={'button'} onClick={() => deleteRowItem(indexInside)} />}
                                            </div></td>
                                            {indexInside === 0 && (
                                                <td rowSpan={item?.data.length} className="table-record">
                                                    <button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editRow(item, indexInside)} />
                                                    <button className="Delete All ml-1" title={"Delete Costing"} type={"button"} onClick={() => deleteRow(item, indexInside)} />
                                                </td>
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
                    <Row>
                        <Col md="12" className='text-right'>
                            <button
                                type="button"
                                className="user-btn mr5 save-btn"
                                onClick={() => saveEstimation()}
                            >
                                <div className={"save-icon"}></div>
                                Save
                            </button>
                            <button
                                className='user-btn'
                                type='button'
                                onClick={sendForApproval}
                            >
                                <div className="send-for-approval"></div>
                                Send for Approval
                            </button>
                        </Col>
                    </Row>

                </div>
            </div>}

            {
                showDrawer &&
                <ApprovalDrawer
                    isOpen={showDrawer}
                    closeDrawer={closeShowApproval}
                    anchor={'right'}
                    // isApprovalisting={false}
                    data={[]}
                // technologyId={1}
                />
            }
        </>
    );
}

export default AddNfr;

