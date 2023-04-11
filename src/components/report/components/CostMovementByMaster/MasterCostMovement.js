
import React, { Fragment, useState } from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Row } from 'reactstrap';
import { fetchPlantDataAPI, fetchSpecificationDataAPI, getApprovalTypeSelectList, getPlantSelectListByType, getRawMaterialCategory, getVendorWithVendorCodeSelectList } from '../../../../actions/Common';
import { searchCount, VBCTypeId, ZBC } from '../../../../config/constants';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from '../../../../helper';
import { autoCompleteDropdown } from '../../../common/CommonFunctions';
import DayTime from '../../../common/DayTimeWrapper';
import { getCostingSpecificTechnology } from '../../../costing/actions/Costing';
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { getBOPCategorySelectList } from '../../../masters/actions/BoughtOutParts';
import { getClientSelectList } from '../../../masters/actions/Client';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../../../masters/actions/Material';
import { getBoughtOutPartSelectList } from '../../../masters/actions/Part';
import { getSelectListOfMasters } from '../../../simulation/actions/Simulation';
import CostMovementByMasterReportListing from './CostMovementByMasterReportListing';

function MasterCostMovement() {
    const [fromDate, setFromDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [minDate, setMinDate] = useState('')
    const [master, setMaster] = useState(0)
    const [technology, setTechnology] = useState('')
    const [costingHeadType, setCostingHeadType] = useState('')
    const [showCustomer, setShowCustomer] = useState(false)
    const [rawMaterial, setRawMaterial] = useState('');
    const [reportListing, setReportListing] = useState(false)
    const [plant, setPlant] = useState('')
    const [RMGrade, setRMGrade] = useState('')
    const [RMSpec, setRMSpec] = useState('')
    const [category, setCategory] = useState('')
    const [vendor, setVendor] = useState('')
    const [formData, setFormData] = useState({})
    const masterList = useSelector(state => state.simulation.masterSelectList)
    const rawMaterialNameSelectList = useSelector(state => state.material.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state.material.gradeSelectList);
    const rmSpecification = useSelector(state => state.comman.rmSpecification);
    const categoryList = useSelector(state => state.comman.categoryList);
    const plantSelectList = useSelector(state => state.comman.plantSelectList)
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const boughtOutPartSelectList = useSelector(state => state.part.boughtOutPartSelectList)
    const bopCategorySelectList = useSelector(state => state.boughtOutparts.bopCategorySelectList)
    const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)
    const costingSpecifiTechnology = useSelector(state => state.costing.costingSpecifiTechnology)



    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getApprovalTypeSelectList(() => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(fetchPlantDataAPI(() => { }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))
    }, [])
    const { handleSubmit, control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const handleFromDate = (date) => {
        setFromDate(date);
        setMinDate(date);
    };
    const handleToDate = (date) => {
        setToDate(date);
        setMaxDate(date);
    };

    const resetFields = () => {
        setValue('Technology', '')
        setValue('CostingHeadType', '')
        setValue('Customer', '')
        setValue('RawMaterialId', '')
        setValue('RawMaterialGradeId', '')
        setValue('RawMaterialSpecificationId', '')
        setValue('Category', '')
        setValue('BOPCategory', '')
        setValue('Vendor', '')
        setValue('BOPId', '')
        setValue('OperationId', '')
        setValue('MachineId', '')
        setValue('MachineTypeId', '')
    }


    const handleMasterChange = (event) => {
        setMaster(event.value);
        resetFields()
        switch (Number(event.value)) {
            case 2:
            case 1:
                dispatch(getRMGradeSelectListByRawMaterial('', () => { }))
                dispatch(getRawMaterialNameChild(() => { }))
                dispatch(getRawMaterialCategory(() => { }))
                break;
            case 4:
            case 5:
                dispatch(getBoughtOutPartSelectList(DayTime(fromDate).format('DD-MM-YYYY'), () => { }))
                dispatch(getBOPCategorySelectList(() => { }))
                break;
            case 6:
                break;
            case 9:
                break;
            default:
                break;
        }

    };


    const inputFieldsRenderer = () => {
        switch (Number(master)) {
            case 1:
            case 2:
                return (<>

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
                            handleChange={() => { }}
                            errors={errors.RawMaterialSpecificationId}
                        />
                    </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Code'}
                            name={'RMcode'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            // defaultValue={RMcode}
                            options={renderListing('RMCode')}
                            mandatory={true}
                            handleChange={handleRMChange}
                            errors={errors.RMcode}
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
                </>
                )
            case 4:
            case 5:
                return (<> <Col md="3">
                    <SearchableSelectHookForm
                        label={'BOP Name'}
                        name={'BOPId'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={renderListing('BOPName')}
                        mandatory={true}
                        handleChange={() => { }}
                        errors={errors.BOPId}
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
                            defaultValue={""}
                            options={renderListing('BOPCategory')}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.BOPId}
                        />
                    </Col>
                </>)
            case 6:
                return (<>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Operation Name'}
                            name={'OperationId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing('OperationName')}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.OperationId}
                        />
                    </Col>
                </>)
            case 9:
                return (<>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Machine Name'}
                            name={'MachineId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing('MachineName')}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.MachineId}
                        />
                    </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Machine Type'}
                            name={'MachineTypeId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing('MachineType')}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.MachineTypeId}
                        />
                    </Col>
                </>)

            default:
                break;
        }
    }


    const listMapping = {
        'masters': masterList,
        'costingHeadType': approvalTypeSelectList,
        'material': rawMaterialNameSelectList,
        'grade': gradeSelectList,
        'specification': rmSpecification,
        'category': categoryList,
        'technology': costingSpecifiTechnology,
        'plant': plantSelectList,
        'Customer': clientSelectList,
        'BOPName': boughtOutPartSelectList,
        'BOPCategory': bopCategorySelectList,
        'RMCode': rmSpecification

    }

    const renderListing = (label) => {
        let temp = [];

        const list = listMapping[label];

        if (list) {
            list.forEach((item) => {
                if (item.Value !== '0') {
                    if (label === 'specification') {
                        temp.push({ label: item.Text, value: item.Value });
                    } else if (label === 'plant') {
                        if (item.PlantId !== '0') {
                            temp.push({ label: item.PlantNameCode, value: item.PlantId });
                        }
                    } else if (label === 'RMCode') {
                        if (item.RMcode !== '0') {
                            temp.push({ label: item.RawMaterialCode, value: item.Value });
                        }

                    }
                    else {
                        temp.push({ label: item.Text, value: item.Value });
                    }
                }
            });
        }
        return temp;
    }

    const handleCostingHeadTypeChange = (newValue) => {
        setCostingHeadType(newValue)
        if (newValue.value === '3') {
            setShowCustomer(true)
            dispatch(getClientSelectList((res) => { }))
        }
        else {
            setShowCustomer(false)
        }
    };

    const handleRMChange = (newValue) => {
        if (newValue && newValue !== '') {
            setRawMaterial(newValue);
            setRMGrade(newValue)
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
            dispatch(getRawMaterialNameChild((res) => { }))
        } else {
            setCategory([])
            setRawMaterial([])
            setRMGrade([])
            setRMSpec([])
            dispatch(getRawMaterialNameChild((res) => { }))
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
    const runReport = () => {

        let fixedData = {
            "FromDate": DayTime(fromDate).format('DD/MM/YYYY'),
            "ToDate": DayTime(toDate).format('DD/MM/YYYY'),
            "CostingHeadId": Number(costingHeadType.value),
            "TechnologyId": Number(technology.value),
            "PlantId": plant.value,
            "VendorId": vendor.value,
        }

        let masterData = {}
        switch (Number(master)) {
            case Number(1):
                masterData = {
                    "RawMaterialChildId": rawMaterial.value,
                    "RawMaterialCategoryId": rawMaterial.value,
                    "RawMaterialGradeId": RMGrade.value,
                    "RawMaterialSpecsId": RMSpec.value,
                    "CategoryId": Number(category.value),
                }
                break;

            default:
                break;
        }
        let finalObj = {
            ...fixedData,
            ...masterData
        }
        setFormData(finalObj)
        setReportListing(true)
    }

    const viewListingHandler = (value) => {
        setReportListing(value)
    }
    return <Fragment>
        {!reportListing &&
            <form onSubmit={handleSubmit(runReport)}>
                <div className='master-movement-report'>
                    <Row>
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
                                disabled={fromDate === '' ? true : false}
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
                                handleChange={(e) => { setTechnology(e) }}
                                errors={errors.TechnologyId}
                            />
                        </Col>
                        {inputFieldsRenderer()}

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
                                handleChange={(e) => { setPlant(e) }}
                                errors={errors.plant}
                            // isLoading={VendorLoaderObj}
                            // disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                            />
                        </Col>
                    </Row>
                </div>
                <Row className="sf-btn-footer no-gutters justify-content-between">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 align-items-center">
                            <button type="button" className={"user-btn mr5 save-btn"} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </div>
                </Row>
            </form>}
        {reportListing && <CostMovementByMasterReportListing viewList={viewListingHandler} masterData={master} formData={formData} />}
    </Fragment>;
}
export default MasterCostMovement;