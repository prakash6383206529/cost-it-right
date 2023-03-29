
import React, { Fragment, useState } from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Row } from 'reactstrap';
import { fetchPlantDataAPI, fetchSpecificationDataAPI, getApprovalTypeSelectList, getPlantSelectListByType, getRawMaterialCategory, getVendorWithVendorCodeSelectList } from '../../../../actions/Common';
import { searchCount, ZBC } from '../../../../config/constants';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from '../../../../helper';
import { autoCompleteDropdown } from '../../../common/CommonFunctions';
import { getCostingSpecificTechnology } from '../../../costing/actions/Costing';
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { getClientSelectList } from '../../../masters/actions/Client';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../../../masters/actions/Material';
import { getSelectListOfMasters } from '../../../simulation/actions/Simulation';
import CostMovementByMasterReportListing from './CostMovementByMasterReportListing';

function MasterCostMovement() {
    const [fromDate, setFromDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [minDate, setMinDate] = useState('')
    const [master, setMaster] = useState('')
    const [technology, setTechnology] = useState('')
    const [costingHeadType, setCostingHeadType] = useState('')
    const [showCustomer, setShowCustomer] = useState(false)
    const [rawMaterial, setRawMaterial] = useState('');
    const [reportListing, setReportListing] = useState(false)
    const [RMGrade, setRMGrade] = useState('')
    const [RMSpec, setRMSpec] = useState('')
    const [category, setCategory] = useState('')
    const [vendor, setVendor] = useState('')
    const masterList = useSelector(state => state.simulation.masterSelectList)
    const rawMaterialNameSelectList = useSelector(state => state.material.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state.material.gradeSelectList);
    const rmSpecification = useSelector(state => state.comman.rmSpecification);
    const categoryList = useSelector(state => state.comman.categoryList);
    const plantSelectList = useSelector(state => state.comman.plantSelectList)
    const clientSelectList = useSelector((state) => state.client.clientSelectList)

    const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)
    const costingSpecifiTechnology = useSelector(state => state.costing.costingSpecifiTechnology,)



    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getApprovalTypeSelectList(() => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getRMGradeSelectListByRawMaterial('', () => { }))
        dispatch(getRawMaterialNameChild('', () => { }))
        dispatch(getRawMaterialCategory(() => { }))
        dispatch(fetchPlantDataAPI(() => { }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getClientSelectList((res) => { }))
    }, [])
    const { handleSubmit, control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const handleFromDate = (date) => {
        setFromDate(date);
        setMaxDate(date);
    };
    const handleToDate = (date) => {
        setToDate(date);
        setMinDate(date);
    };
    const handleMasterChange = (e) => {

        setMaster(e);

    };
    const handleSpecChange = (e) => {

        setRMSpec(e);
    };

    const renderListing = (label) => {
        let temp = []

        if (label === 'masters') {
            masterList && masterList.map((item) => {
                if (item.Value === '0') return false

                if (item.Text !== 'Assembly' && item.Text !== 'Exchange Rates' && item.Text !== 'Combined Process') {
                    temp.push({ label: item.Text, value: item.Value })
                }
                return null
            })
            return temp
        }
        if (label === 'costingHeadType') {

            approvalTypeSelectList && approvalTypeSelectList.map(item => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp;
        }

        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'grade') {
            gradeSelectList && gradeSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'specification') {
            rmSpecification && rmSpecification.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value, RawMaterialCode: item.RawMaterialCode })
                return null
            })
            return temp
        }

        if (label === 'category') {
            categoryList && categoryList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'technology') {
            costingSpecifiTechnology &&
                costingSpecifiTechnology.map((item) => {

                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
            return temp
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                console.log('item: ', item);
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }

        if (label === 'Customer') {
            clientSelectList && clientSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

    }
    const handleCostingHeadTypeChange = (newValue) => {

        if (newValue.value === '3') {
            setShowCustomer(true)
        }
        else {
            setShowCustomer(false)
        }
    };

    const handleTechnologyChange = (e) => {

        setTechnology(e);
    };
    const handleRMChange = (newValue) => {


        if (newValue && newValue !== '') {
            setRawMaterial(newValue);
            setRMGrade([])
            dispatch(getRMGradeSelectListByRawMaterial(
                newValue.value,
                (res) => { },
            ))
        } else {
            setRawMaterial([])
            setRMGrade([])
            setRMSpec([])
            dispatch(getRMGradeSelectListByRawMaterial('', (res) => { }))
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    };
    const handleGradeChange = (newValue) => {

        if (newValue && newValue !== '') {
            setRMSpec(newValue)
            dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }))
        } else {
            setRMGrade([])
            setRMSpec([])
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    };
    const handleCategoryChange = (newValue) => {

        if (newValue && newValue !== '') {
            setCategory(newValue)
            dispatch(getRawMaterialNameChild(newValue.value, (res) => { }))
        } else {
            setCategory([])
            setRawMaterial([])
            setRMGrade([])
            setRMSpec([])
            dispatch(getRawMaterialNameChild(0, (res) => { }))
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    };

    const handleVendorChange = (newValue) => {
        if (newValue && newValue !== '') {
            setVendor(newValue)
        } else {
            setVendor([])
        }
    };


    const vendorFilterList = async (inputValue) => {
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
    const runReport = () => {
        setReportListing(true)
        let data = {
            "FromDate": fromDate,
            "ToDate": toDate,
            "CostingHeadType": costingHeadType.value,
            // "CostingHeadId": costingHeadType.value === '3' ? customer.value : costingHeadType.value === '2' ? vendor.value : costingHeadType.value === '1' ? vendor.value : '',
            "RawMaterialId": rawMaterial.value,
            "GradeId": RMGrade.value,
            "SpecificationId": RMSpec.value,
            "CategoryId": category.value,
            "TechnologyId": technology.value,
        }
    }


    const viewListingHandler = (value) => {
        setReportListing(value)
    }
    return <Fragment>
        {!reportListing && <Row>
            <Col md="3">
                <div className="inputbox date-section">
                    <DatePickerHookForm
                        name={`fromDate`}
                        label={'From Date'}
                        selected={new Date(fromDate)}
                        handleChange={(date) => {
                            handleFromDate(date);
                        }}
                        rules={{ required: true }}
                        maxDate={maxDate}
                        Controller={Controller}
                        control={control}
                        register={register}
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="DD/MM/YYYY"
                        dropdownMode="select"
                        placeholder="Select date"
                        customClassName="withBorder"
                        className="withBorder"
                        autoComplete={"off"}
                        disabledKeyboardNavigation
                        onChangeRaw={(e) => e.preventDefault()}
                        // disabled={rowData.length !== 0}
                        mandatory={true}
                        errors={errors && errors.fromDate}
                    />
                </div>
            </Col>
            <Col md="3">
                <div className="inputbox date-section">
                    <DatePickerHookForm
                        name={`toDate`}
                        label={'To Date'}
                        selected={new Date(toDate)}
                        handleChange={handleToDate}
                        minDate={minDate}
                        rules={{ required: true }}
                        Controller={Controller}
                        control={control}
                        register={register}
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="DD/MM/YYYY"
                        dropdownMode="select"
                        placeholder="Select date"
                        customClassName="withBorder"
                        className="withBorder"
                        autoComplete={"off"}
                        disabledKeyboardNavigation
                        onChangeRaw={(e) => e.preventDefault()}
                        // disabled={rowData.length !== 0}
                        mandatory={true}
                        errors={errors && errors.toDate}
                    />
                </div>
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={"Masters"}
                    name={'Masters'}
                    placeholder={'Masters'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={master.length !== 0 ? master : ''}
                    options={renderListing('masters')}
                    mandatory={true}
                    handleChange={handleMasterChange}
                    errors={errors.Masters}
                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={"Costing Head Type"}
                    name={"costingHeadTypeId"}
                    placeholder={"Costing Head Type"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={costingHeadType}
                    options={renderListing("costingHeadType")}
                    mandatory={true}
                    handleChange={handleCostingHeadTypeChange}
                    errors={errors.costingHeadTypeId}
                // isDisabled={isEditFlag || isViewFlag}
                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={'Technology'}
                    name={'TechnologyId'}
                    placeholder={'Technology'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={technology}
                    options={renderListing('technology')}
                    mandatory={true}
                    handleChange={handleTechnologyChange}
                    errors={errors.TechnologyId}
                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={'Name'}
                    name={'RawMaterialId'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={rawMaterial}
                    options={renderListing('material')}
                    mandatory={true}
                    handleChange={handleRMChange}
                    errors={errors.RawMaterialId}
                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={'Grade'}
                    name={'RawMaterialGradeId'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={RMGrade}
                    options={renderListing('grade')}
                    mandatory={true}
                    handleChange={handleGradeChange}
                    errors={errors.RawMaterialGradeId}
                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={'Spec'}
                    name={'RawMaterialSpecificationId'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={RMSpec}
                    options={renderListing('specification')}
                    mandatory={true}
                    handleChange={handleSpecChange}
                    errors={errors.RawMaterialSpecificationId}
                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    label={'Category'}
                    name={'CategoryId'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={category}
                    options={renderListing('category')}
                    mandatory={true}
                    handleChange={handleCategoryChange}
                    errors={errors.RawMaterialSpecificationId}
                />
            </Col>
            <Col md="3">
                {showCustomer ? <SearchableSelectHookForm
                    label={"Customer (Code)"}
                    name={"Customer"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: false }}
                    register={register}
                    // defaultValue={customer.length !== 0 ? customer : ""}
                    options={renderListing("Customer")}
                    mandatory={false}
                    handleChange={() => { }}
                    errors={errors.Customer}
                /> :
                    <AsyncSearchableSelectHookForm
                        label={"Vendor (Code)"}
                        name={"vendor"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={vendor.length !== 0 ? vendor : ""}
                        options={renderListing("vendor")}
                        mandatory={true}
                        handleChange={handleVendorChange}
                        // handleChange={() => { }}
                        errors={errors.vendor}
                        // isLoading={VendorLoaderObj}
                        asyncOptions={vendorFilterList}
                        disabled={false}
                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                    />
                }

            </Col>
            <Col md="3" className='align-items-center mt2'>
                <SearchableSelectHookForm
                    label={"Plant (Code)"}
                    name={"plant"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    // defaultValue={vendor.length !== 0 ? vendor : ""}
                    options={renderListing("plant")}
                    mandatory={true}
                    // handleChange={handleVendorChange}
                    handleChange={() => { }}
                    errors={errors.plant}
                // isLoading={VendorLoaderObj}
                // disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                />
            </Col>
            <Col md="auto" className='d-flex align-items-center mt-2'>
                <button type="button" className={"user-btn save-btn"} disabled={false} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
            </Col>
        </Row>}
        {reportListing && <CostMovementByMasterReportListing viewList={viewListingHandler} />}
    </Fragment>;
}
export default MasterCostMovement;