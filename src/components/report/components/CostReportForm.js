import { AgGridColumn, AgGridReact } from "ag-grid-react"
import _ from "lodash"
import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import { reactLocalStorage } from "reactjs-localstorage"
import { Col, Row } from "reactstrap"
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from "../../../actions/Common"
import { BOUGHTOUTPARTSPACING, COMPONENT_PART, defaultPageSize, EMPTY_DATA, PRODUCT_ID, searchCount, VBC_VENDOR_TYPE, ZBC } from "../../../config/constants"
import { MESSAGES } from "../../../config/message"
import { getConfigurationKey, loggedInUserId } from "../../../helper"
import { autoCompleteDropdown, autoCompleteDropdownPart } from "../../common/CommonFunctions"
import LoaderCustom from "../../common/LoaderCustom"
import NoContentFound from "../../common/NoContentFound"
import Toaster from "../../common/Toaster"
import { checkPartWithTechnology, getCostingSpecificTechnology, getPartInfo, getPartSelectListByTechnology } from "../../costing/actions/Costing"
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from "../../layout/HookFormInputs"
import { getFormGridData, getRevisionNoFromPartId } from "../actions/ReportListing"
import { PaginationWrapper } from '../../common/commonPagination';
import { getClientSelectList } from "../../masters/actions/Client"
import { getProductGroupSelectList, getSelectListPartType } from "../../masters/actions/Part"
import { getPartSelectListWtihRevNo } from "../../masters/actions/Volume"
import { ASSEMBLY } from "../../../config/masterData"
import TourWrapper from "../../common/Tour/TourWrapper"
import { Steps } from "./TourMessages"
import { useTranslation } from "react-i18next"
import { useLabels } from "../../../helper/core"



const gridOptions = {}
function CostReportForm(props) {
    const { t } = useTranslation("Reports")
    const { isDateMandatory, showVendor, gotGiven, plantWiseGotGiven } = props
    const [technology, setTechnology] = useState([])
    const [partName, setpartName] = useState('')
    const [part, setPart] = useState([]);
    const [plant, setPlant] = useState([]);
    const [revision, setRevision] = useState([]);
    const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
    const [vendor, setVendor] = useState([])
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [effectiveDate, setEffectiveDate] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [customerPoamSummary, setCustomerPoamSummary] = useState(props.customerPoamSummary ? true : false);

    const [productCategory, setProductCategory] = useState('');
    const [includeQuarterData, setIncludeQuarterData] = useState(false);
    const [partType, setPartType] = useState('');
    const [partTypeList, setPartTypeList] = useState([])

    const dispatch = useDispatch()
    const { technologyLabel, vendorLabel } = useLabels();
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const vendorSelectList = useSelector((state) => state.costing.costingVendorList)
    const DestinationplantSelectList = useSelector(state => state.comman.plantSelectList);
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const productGroupSelectList = useSelector((state) => state.part.productGroupSelectList)

    const costReportFormData = useSelector(state => state.report.costReportFormGridData)

    let gridData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];
    let startDate = costReportFormData && costReportFormData.fromDate
    let endDate = costReportFormData && costReportFormData.toDate


    // const toDate = useSelector(state => state.report.costReportFormGridData?.toDate)
    // const fromDate = useSelector(state => state.report.costReportFormGridData?.fromDate)


    const { handleSubmit, control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    useEffect(() => {
        dispatch(getPlantSelectListByType(ZBC, "REPORT", '', () => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getPartInfo('', () => { }))
        dispatch(getProductGroupSelectList(() => { }))
        dispatch(getClientSelectList((res) => {
        }))
        dispatch(getSelectListPartType((res) => {
            setPartTypeList(res?.data?.SelectList)
        }))
        if (props.isDataClear) {
            setValue('fromDate', startDate ? startDate : '')
            setValue('toDate', endDate ? endDate : '')
        }
    }, [])

    /**
    * @Method onSubmit
    * @description Insert data in the bottom table
    */
    const onSubmit = () => {
        let obj = {}
        let isDuplicateEntry = false;
        obj.TechnologyId = getValues('Technology')?.value
        obj.PartId = getValues('Part')?.value
        obj.RevisionNumber = getValues('Revision')?.label ? getValues('Revision')?.label : ''
        obj.VendorId = getValues('Vendor')?.value
        obj.PlantId = getValues('Plant')?.value
        obj.TechnologyName = getValues('Technology')?.label
        obj.PartNo = getValues('Part')?.label
        obj.ShowRevisionNumber = getValues('Revision')?.label ? getValues('Revision')?.label : '-'
        obj.Vendor = getValues('vendor')?.label ? getValues('Vendor')?.label : '-'
        obj.Plant = getValues('Plant')?.label ? getValues('Plant')?.label : '-'
        obj.productCategory = getValues('productCategory')?.label ? getValues('productCategory')?.label : '-'
        obj.productCategoryId = getValues('productCategory')?.value ? getValues('productCategory')?.value : '-'
        obj.CustomerId = getValues('Customer')?.value ? getValues('Customer')?.value : '-'
        obj.CustomerName = getValues('Customer')?.label ? getValues('Customer')?.label : '-'

        gridData && gridData.map((item) => {
            if (item.TechnologyId === obj.TechnologyId && item.PartId === obj.PartId && item.RevisionNumber === obj.RevisionNumber && item.VendorId === obj.VendorId && item.PlantId === obj.PlantId) {
                isDuplicateEntry = true
            }
        })
        if (isDuplicateEntry) {
            Toaster.warning("This data is already exist in the row.")
            return false
        }
        let arr = [...gridData, obj];

        dispatch(getFormGridData({ ...costReportFormData, gridData: arr }))
        resetData()
    }

    /**
    * @Method handleFromDate
    * @description Handle change for from date input field
    */
    const handleFromDate = (value) => {
        setEffectiveDate(value)
        setMinDate(value)
        dispatch(getFormGridData({ ...costReportFormData, fromDate: value }))
        // dispatch(getFormGridData({ ...costReportFormData, EffectiveDate: value }))      //RE

    }

    /**
    * @Method handleToDate
    * @description Handle change for To date input field
    */
    const handleToDate = (value) => {

        setMaxDate(value)
        setToDate(value)
        dispatch(getFormGridData({ ...costReportFormData, toDate: value }))
    }

    /**
    * @Method resetRevisionVendorPlant
    * @description Reset Revision Number, Plant and Vendor Field
    */
    const resetRevisionVendorPlant = () => {
        setVendor([])
        setPlant([])
        setRevision([])
        setValue('Revision', '')
        setValue('Vendor', '')
        setValue('Plant', '')
    }

    const CompanyName = [
        { Text: '4W lighting', Value: '1' },
        { Text: 'MKL', Value: '2' },
        { Text: 'ONKYO', Value: '3' },
    ]
    const DUMMY_PLANT = [
        { Text: '1031', Value: '1' },
        { Text: '1032', Value: '2' },
        { Text: '1035', Value: '3' },
        { Text: '1036', Value: '3' },
    ]

    /**
    * @Method renderListing
    * @description Dropdown data list
    */
    const renderListing = (label) => {
        const temp = []
        if (label === 'Technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'Vendor') {
            vendorSelectList && vendorSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'Plant') {
            if (props.isCompany) {
                DUMMY_PLANT && DUMMY_PLANT.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
            } else {
                DestinationplantSelectList && DestinationplantSelectList.map((item) => {
                    if (item.PlantId === '0') return false
                    temp.push({ label: item.PlantNameCode, value: item.PlantId })
                    return null
                })
            }

            return temp
        }
        if (label === 'Revision') {
            revision && revision.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
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

        if (label === 'ProductGroup') {
            productGroupSelectList && productGroupSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            })
            return temp;
        }
        if (label === 'Company') {
            CompanyName && CompanyName.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            })
            return temp;
        }
        if (label === 'PartType') {
            partTypeList && partTypeList.map((item) => {
                if (item.Value === '0') return false
                if (item.Value === PRODUCT_ID) return false
                if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured && item.Text === BOUGHTOUTPARTSPACING) return false
                if (String(technology?.value) === String(ASSEMBLY) && ((item.Text === COMPONENT_PART) || (item.Text === BOUGHTOUTPARTSPACING))) return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
    };
    const onGridReady = (params) => {
        setGridApi(params.api)
        params.api.sizeColumnsToFit();
        params.api.paginationGoToPage(0);
    }

    /**
    * @Method handleTechnologyChange
    * @description Change other field data basis of the technology change
    */
    const handleTechnologyChange = (newValue) => {
        if (newValue && newValue !== '') {
            setTechnology(newValue)
            setIsTechnologySelected(true)
            setPart([])
            dispatch(getPartInfo('', () => { }))
            setValue('Part', '')
            resetRevisionVendorPlant()
        } else {
            setTechnology([])
            setIsTechnologySelected(false)
        }
        setpartName([])
        reactLocalStorage.setObject('PartData', [])
    }

    /**
     * @method handlePartChange
     * @description  USED TO HANDLE PART CHANGE
     */
    const handlePartTypeChange = (newValue) => {
        if (newValue && newValue !== '') {
            setPartType(newValue)
        } else {
            setPartType([])
        }
        setpartName([])
        reactLocalStorage.setObject('PartData', [])
    }

    const handleProductCategory = (newValue) => {
        setProductCategory(newValue)
    }

    /**
    * @Method handlePartChange
    * @description Change other field data basis of the Part change
    */
    const handlePartChange = (newValue) => {
        if (newValue && newValue !== '') {
            if (IsTechnologySelected) {
                const data = { TechnologyId: technology.value, PartId: newValue.value }
                resetRevisionVendorPlant()
                dispatch(checkPartWithTechnology(data, (response) => {
                    if (response.status === 412) {
                        setPart([])
                        setValue('Part', '')
                    } else {
                        setPart(newValue)
                        dispatch(getFormGridData({ ...costReportFormData, part: newValue, isPlant: true, isCompany: false }))
                    }
                    if (response.data.Result) {
                        dispatch(getRevisionNoFromPartId(newValue.value, (res) => {
                            let Data = res && res.data && res.data.SelectList
                            setRevision(Data)
                        }))

                    } else {
                        dispatch(getPartInfo('', () => { }))
                    }
                }),
                )
            }
        } else {
            setPart([])
            dispatch(getPartInfo('', () => { }))
        }
    }
    const handleVendorChange = (value) => {
        setVendor(value)
        dispatch(getFormGridData({ ...costReportFormData, vendor: value, isPlant: true, isCompany: false }))
    }

    const plantHandleChange = (value) => {
        setPlant(value)
        dispatch(getFormGridData({ ...costReportFormData, plant: value, isPlant: true, isCompany: false }))
    }

    /**
    * @Method filterList
    * @description get data from backend after entering three char
    */

    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {

            if (props.partWithRevision) {
                const res = await getPartSelectListWtihRevNo(resultInput, technology.value, null, partType?.value);
                setpartName(resultInput)
                let partDataAPI = res?.data?.DataList
                if (inputValue) {
                    return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)
                } else {
                    return partDataAPI
                }
            } else {
                const res = await getPartSelectListByTechnology(technology.value, resultInput, partType?.value);
                setpartName(resultInput)
                let partDataAPI = res?.data?.SelectList
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, partDataAPI, false, [], true)
                } else {
                    return partDataAPI
                }
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject(props.partWithRevision ? 'PartData' : 'Data')
                if (inputValue) {
                    if (props.partWithRevision) {
                        return autoCompleteDropdownPart(inputValue, partData, false, [], false)
                    } else {
                        return autoCompleteDropdown(inputValue, partData, false, [], false)
                    }
                } else {
                    return partData
                }
            }
        }

    }
    const vendorFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
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
    /**
* @Method deleteItemFromTable
* @description remove data from table on the click of delete icon
*/
    const deleteItemFromTable = (gridData, props) => {
        let arr = []
        gridData && gridData.map((item, index) => {
            if (index !== props?.node?.rowIndex) {
                arr.push(item)
            }
        })
        dispatch(getFormGridData({ ...costReportFormData, gridData: arr }))
        // dispatch(getFormGridData({ toDate, fromDate, gridData: arr }))        //RE
    }
    const buttonFormatter = (props) => {
        return (
            <>
                {<button title='Delete' className="Delete align-middle" type={'button'} onClick={() => deleteItemFromTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        buttonFormatter: buttonFormatter,

    };

    /**
    * @Method resetData
    * @description Reset all field after click on reset button
    */
    const resetData = () => {
        setPart([])
        setTechnology([])
        dispatch(getPartInfo('', () => { }))
        setValue('Technology', '')
        setValue('Part', '')
        setValue('Customer', '')
        setValue('Vendor', '')
        setValue('PartType', '')
        resetRevisionVendorPlant()
    }

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

    }

    const includeQuarterDataCheck = () => {
        dispatch(getFormGridData({ ...costReportFormData, includeQuarterData: !includeQuarterData }))
        setIncludeQuarterData(!includeQuarterData)
    }

    return (
        <>
            <div className="cost-ratio-report">
                <TourWrapper
                    buttonSpecificProp={{ id: "Add_Cost_Report_Form" }}
                    stepsSpecificProp={{
                        steps: Steps(t, { plantWiseGotGiven: props?.plantWiseGotGiven, gotGiven: props?.gotGiven, effectiveDate: props?.effectiveDate, dateHide: props?.dateHide, hideAddtable: props?.hideAddtable, showVendor: props?.showVendor, customerPoamSummary: customerPoamSummary, showCustomer: props?.showCustomer }).COST_REPORT_FORM
                    }} />
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {false && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} customClass="loader-center mt-n2" />}

                    {!props.dateHide && <Row className="pt-2 mb-5">
                        <div className="form-group mb-0 col-md-3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`fromDate`}
                                    label={'From Date'}
                                    selected={new Date(fromDate)}
                                    handleChange={(date) => {
                                        handleFromDate(date);
                                    }}
                                    rules={{ required: isDateMandatory }}
                                    maxDate={maxDate}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    placeholder="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    // disabled={rowData.length !== 0}
                                    mandatory={isDateMandatory}
                                    errors={errors && errors.fromDate}
                                />
                            </div>
                        </div>
                        <div className="form-group mb-0 col-md-3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`toDate`}
                                    label={'To Date'}
                                    selected={new Date(toDate)}
                                    handleChange={handleToDate}
                                    minDate={minDate}
                                    rules={{ required: isDateMandatory }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    placeholder="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    // disabled={rowData.length !== 0}
                                    mandatory={isDateMandatory}
                                    errors={errors && errors.toDate}
                                />
                            </div>
                        </div>
                    </Row>}


                    {<Row>
                        {customerPoamSummary && <Col md="3">
                            <SearchableSelectHookForm
                                label={"Product Category"}
                                name={"productCategory"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                defaultValue={productCategory.length !== 0 ? productCategory : ""}
                                options={renderListing("ProductGroup")}
                                mandatory={true}
                                handleChange={handleProductCategory}
                                errors={errors.productCategory}
                            />
                        </Col>}


                        {!plantWiseGotGiven && <Col md="3">
                            <SearchableSelectHookForm
                                label={technologyLabel}
                                name={"Technology"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                defaultValue={technology.length !== 0 ? technology : ""}
                                options={renderListing("Technology")}
                                mandatory={true}
                                handleChange={handleTechnologyChange}
                                errors={errors.Technology}
                            />
                        </Col>}

                        {!plantWiseGotGiven && <Col md="3">
                            <SearchableSelectHookForm
                                label={"Part Type"}
                                name={"PartType"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                defaultValue={partType.length !== 0 ? partType : ""}
                                options={renderListing('PartType')}
                                mandatory={true}
                                handleChange={handlePartTypeChange}
                                errors={errors.Part}
                                disabled={(technology?.length === 0) ? true : false}
                            />
                        </Col>}

                        {!plantWiseGotGiven && <Col md="3">
                            <AsyncSearchableSelectHookForm
                                label={"Part No."}
                                name={"Part"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: props.isSaleAndPurchase ? false : true }}
                                register={register}
                                defaultValue={part.length !== 0 ? part : ""}
                                asyncOptions={filterList}
                                mandatory={props.isSaleAndPurchase ? false : true}
                                //   isLoading={loaderObj}
                                handleChange={handlePartChange}
                                errors={errors.Part}
                                disabled={!technology || !partType || technology.length === 0 || partType.length === 0}
                                NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                            />

                        </Col>}


                        {!customerPoamSummary && !props.partWithRevision && !plantWiseGotGiven && <Col md="3">
                            <SearchableSelectHookForm
                                label={"Revision Number"}
                                name={"Revision"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                defaultValue={revision.length !== 0 ? revision : ""}
                                options={renderListing("Revision")}
                                mandatory={false}
                                handleChange={() => { }}
                                errors={errors.revision}
                                disabled={part.length === 0 ? true : false}
                            />
                        </Col>}

                        {showVendor &&
                            <Col md="3">
                                <AsyncSearchableSelectHookForm
                                    label={`${vendorLabel} (Code)`}
                                    name={"Vendor"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: props.isSaleAndPurchase ? true : false }} // Agar props.isSaleAndPurchase true hai, to required false hoga, warna true hoga
                                    register={register}
                                    defaultValue={vendor.length !== 0 ? vendor : ""}
                                    options={renderListing("Vendor")}
                                    mandatory={props.isSaleAndPurchase ? true : false}
                                    handleChange={handleVendorChange}
                                    // handleChange={() => { }}
                                    errors={errors.Vendor}
                                    asyncOptions={vendorFilterList}
                                    disabled={props.isSaleAndPurchase ? false : (part.length === 0 ? true : false)}
                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                />
                            </Col>
                        }

                        <Col md="3">
                            <SearchableSelectHookForm
                                label={"Plant (Code)"}
                                name={"Plant"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: props.isPlantRequired ? true : false }}
                                register={register}
                                defaultValue={plant.length !== 0 ? plant : ""}
                                options={renderListing("Plant")}
                                mandatory={props.isPlantRequired ? true : false}
                                handleChange={plantHandleChange}
                                errors={errors.Plant}
                                disabled={!plantWiseGotGiven ? (props.isSaleAndPurchase || props.isCompany ? false : (part.length === 0 ? true : false)) : false}
                            />
                        </Col>


                        {(!showVendor || customerPoamSummary || gotGiven) && !plantWiseGotGiven && <Col md="3">
                            <SearchableSelectHookForm
                                label={"Customer (Code)"}
                                name={"Customer"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: isDateMandatory }}
                                register={register}
                                // defaultValue={customer.length !== 0 ? customer : ""}
                                options={renderListing("Customer")}
                                mandatory={isDateMandatory}
                                handleChange={(e) => { dispatch(getFormGridData({ ...costReportFormData, customer: e })) }}
                                errors={errors.Customer}
                                disabled={props.isSaleAndPurchase ? false : (part.length === 0 ? true : false)}
                            />
                        </Col>}
                        {props.isCompany && <Col md="3">
                            <SearchableSelectHookForm
                                label={"Company Name"}
                                name={"CompanyName"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                // defaultValue={customer.length !== 0 ? customer : ""}
                                options={renderListing("Company")}
                                mandatory={false}
                                handleChange={() => { dispatch(getFormGridData({ ...costReportFormData, isPlant: false, isCompany: true })) }}
                                // handleChange={() => { }}         //RE
                                errors={errors.Customer}
                                disabled={false}
                            />
                        </Col>}
                        {props.effectiveDate && <div className="form-group mb-0 col-md-3">
                            <div id="EffectiveDate_Container" className="inputbox date-section">
                                <DatePickerHookForm

                                    name={`EffectiveDate`}
                                    label={'Effective Date'}
                                    selected={new Date(effectiveDate)}
                                    handleChange={(date) => {
                                        handleFromDate(date);
                                    }}
                                    rules={{ required: true }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    placeholder="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    // disabled={rowData.length !== 0}
                                    mandatory={true}
                                    errors={errors && errors.EffectiveDate}
                                />
                            </div>
                        </div>}


                        {customerPoamSummary && <Col md="2" className="d-flex align-items-center">
                            <label
                                className={`custom-checkbox w-auto mb-0 mt-3 `}
                                onChange={() => includeQuarterDataCheck()}
                            >
                                Include Quarter Data
                                <input
                                    type="checkbox"
                                    disabled={false}
                                    checked={costReportFormData.includeQuarterData ? costReportFormData.includeQuarterData : ''}
                                />
                                <span
                                    className=" before-box p-0"
                                    onChange={() => includeQuarterDataCheck()}
                                />
                            </label>

                        </Col>}

                        {!props.hideAddtable && <><Col md="3" className="mt-4 pt-1">
                            <button
                                id="add-btn"
                                type="submit"
                                className={"user-btn  pull-left mt-1"}

                            >
                                <div className={"plus"}></div>ADD
                            </button>
                            <button
                                id="reset-btn"
                                type="button"
                                className={"reset-btn pull-left mt-1 ml5"}
                                onClick={resetData}
                            >
                                Reset
                            </button>
                        </Col>
                            <Col md={customerPoamSummary ? 4 : 3} className="mt-4 pt-2 text-right">
                                <button type="button" className="user-btn reset-btn1" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                            </Col>
                        </>}
                    </Row>}
                </form>
                {!props.hideAddtable && <div className={`ag-grid-wrapper height-width-wrapper ${(gridData && gridData?.length <= 0) ? "overlay-contain" : ""}`}>
                    < div className={`ag-theme-material `}>
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={gridData}
                            pagination={true}
                            paginationPageSize={defaultPageSize}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass'
                            }}
                            rowSelection={'multiple'}
                            suppressRowClickSelection={true}
                            // onSelectionChanged={onRowSelect}
                            // onFilterModified={onFloatingFilterChanged}
                            frameworkComponents={frameworkComponents}
                        >
                            {<AgGridColumn field="TechnologyName" headerName="Tehnology"></AgGridColumn>}
                            {customerPoamSummary && <AgGridColumn field="productCategory" headerName="Product Category"></AgGridColumn>}
                            {<AgGridColumn field="PartNo" headerName="Part No."></AgGridColumn>}
                            {!customerPoamSummary && <AgGridColumn field="ShowRevisionNumber" headerName="Revision No."></AgGridColumn>}
                            {(!customerPoamSummary && showVendor) && <AgGridColumn field="Vendor" headerName="Vendor (Code)"></AgGridColumn>}
                            {<AgGridColumn field="Plant" headerName="Plant (Code)"></AgGridColumn>}
                            {(!showVendor || customerPoamSummary) && <AgGridColumn field="CustomerName" headerName="Customer (Code)"></AgGridColumn>}
                            {<AgGridColumn field="action" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatter'}></AgGridColumn>}
                        </AgGridReact>
                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                    </div>
                </div>}
            </div>
        </>
    )
}
export default CostReportForm