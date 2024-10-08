import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Col, Row } from "reactstrap"
import { getFormGridData } from "../../actions/ReportListing"
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs"
import { useForm, Controller } from "react-hook-form"
import { getProductGroupSelectList } from "../../../masters/actions/Part"
import { MESSAGES } from "../../../../config/message"
import { getCostingSpecificTechnology, getPartSelectListByTechnology } from "../../../costing/actions/Costing"
import { loggedInUserId } from "../../../../helper"
import { reactLocalStorage } from "reactjs-localstorage"
import { autoCompleteDropdown } from "../../../common/CommonFunctions"
import { VBC_VENDOR_TYPE, ZBC, searchCount } from "../../../../config/constants"
import GotGivenSummary from "./GotGivenSummary"
import Toaster from "../../../common/Toaster"
import { getClientSelectList } from "../../../masters/actions/Client"
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from "../../../../actions/Common"
import TourWrapper from "../../../common/Tour/TourWrapper"
import { Steps } from "../TourMessages"
import { useTranslation } from "react-i18next"
import { useLabels } from "../../../../helper/core"

const GotGivenReport = (props) => {
    const { t } = useTranslation("Reports")
    const [runGotGivenReport, setRunGotGivenReport] = useState(false)
    const [product, setProduct] = useState('')
    const [technology, setTechnology] = useState('')
    const [part, setPart] = useState('')
    const [inputLoader, setInputLoader] = useState(false)
    const [partName, setpartName] = useState('')
    const [vendor, setVendor] = useState([])
    const dispatch = useDispatch()

    const { control, register, reset, getValues, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const { technologyLabel, vendorLabel } = useLabels();
    const productGroupSelectList = useSelector(state => state.part.productGroupSelectList)
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const vendorSelectList = useSelector((state) => state.costing.costingVendorList)
    const plantSelectList = useSelector((state) => state.comman.plantSelectList)

    useEffect(() => {
        dispatch(getFormGridData({}))
        dispatch(getProductGroupSelectList(() => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getClientSelectList((res) => {
        }))
        dispatch(getPlantSelectListByType(ZBC, "REPORT", '', () => { }))
    }, [])
    /**
    * @Method runReport
    * @description Run report hide current component and mount CostRatioListing component
    */
    const runReport = () => {

        if (product || part) {
            setRunGotGivenReport(true)
        } else {
            Toaster.warning("Please enter part or product")
        }
    }

    /**
    * @Method viewListingHandler
    * @description callback function from CostRatioListing component on the click cancel button to hiding current component mount CostRatioReport
    */
    const closeDrawer = (value) => {
        setRunGotGivenReport(false)

    }

    const handleProductChange = (value) => {

        if (value) {
            setProduct(value)
        }
    }

    const handleTechnologyChange = (value) => {

        if (value) {
            setTechnology(value)
            setpartName([])
        }
    }

    const handlePartChange = (value) => {
        if (value) {
            setPart(value)
        }
    }

    const renderListing = (label) => {

        const temp = []

        if (label === 'ProductGroup') {
            productGroupSelectList && productGroupSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            })
            return temp;
        }

        if (label === 'Technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'Customer') {
            clientSelectList && clientSelectList.map((item) => {
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
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }
    }

    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            setInputLoader(true)
            const res = await getPartSelectListByTechnology(technology.value, resultInput);
            setInputLoader(false)
            setpartName(resultInput)
            let partDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, partDataAPI, false, [], true)

            } else {
                return partDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, partData, false, [], false)
                } else {
                    return partData
                }
            }
        }

    }

    const resetReport = () => {
        reset({
            Technology: '',
            Part: '',
            product: ''
        })
        setTechnology('')
        setPart('')
        setProduct('')
    }

    const handleVendorChange = (value) => {
        setVendor(value)

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
    return (
        <>
            {!runGotGivenReport && <div className="container-fluid ">

                <div className="cost-ratio-report">
                    <TourWrapper
                        buttonSpecificProp={{ id: "Got_Given_Report" }}
                        stepsSpecificProp={{
                            steps: Steps(t).GOTGIVENSUMMARY
                        }} />
                    <form noValidate >
                        <Row>

                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={technologyLabel}
                                    name={"Technology"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: false }}
                                    register={register}
                                    options={renderListing("Technology")}
                                    mandatory={false}
                                    handleChange={handleTechnologyChange}
                                    errors={errors.Technology}
                                />
                            </Col>

                            <Col md="3">

                                <AsyncSearchableSelectHookForm
                                    label={"Assembly/Part No."}
                                    name={"Part"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: false }}
                                    register={register}
                                    asyncOptions={filterList}
                                    mandatory={false}
                                    //isLoading={loaderObj}
                                    handleChange={handlePartChange}
                                    errors={errors.Part}
                                    disabled={(technology.length === 0) ? true : false}
                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                />

                            </Col>
                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Customer (Code)"}
                                    name={"Customer"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    handleChange={() => { }}
                                    options={renderListing("Customer")}
                                    mandatory={true}
                                    errors={errors.Customer}

                                />
                            </Col>
                            <Col md="3">
                                <AsyncSearchableSelectHookForm
                                    label={`${vendorLabel} (Code)`}
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
                                    asyncOptions={vendorFilterList}
                                    disabled={props.isSaleAndPurchase ? false : (part.length === 0 ? true : false)}
                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                />
                            </Col>
                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Product"}
                                    name={"product"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: false }}
                                    register={register}
                                    options={renderListing("ProductGroup")}
                                    mandatory={false}
                                    handleChange={handleProductChange}
                                    errors={errors.Technology}
                                />
                            </Col>
                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Plant (Code)"}
                                    name={"Plant"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    handleChange={() => { }}
                                    options={renderListing("Plant")}
                                    mandatory={true}

                                    errors={errors.Plant}

                                />
                            </Col>

                            <Col md="3" className="mt-2">
                                <button
                                    id="Reset_Button"
                                    type="button"
                                    className={"reset-btn pull-left mt-4"}
                                    onClick={() => resetReport()}>
                                    {"RESET"}
                                </button>
                            </Col>
                        </Row>
                    </form>
                </div>

                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <Col md="12" className="text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"user-btn save-btn"} disabled={false} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </Col>
                </Row>
            </div >}
            {runGotGivenReport && <GotGivenSummary closeDrawer={closeDrawer} part={part} product={product} customerId={getValues('Customer')?.value} plantId={getValues('Plant')?.value} vendorId={getValues('vendor')?.value} />}
        </>
    )
}
export default GotGivenReport
