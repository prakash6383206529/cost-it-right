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
import { searchCount } from "../../../../config/constants"
import GotGivenSummary from "./GotGivenSummary"
import Toaster from "../../../common/Toaster"

const GotGivenReport = (props) => {
    const [runGotGivenReport, setRunGotGivenReport] = useState(false)
    const [product, setProduct] = useState('')
    const [technology, setTechnology] = useState('')
    const [part, setPart] = useState('')
    const [inputLoader, setInputLoader] = useState(false)
    const [partName, setpartName] = useState('')
    const dispatch = useDispatch()

    const { control, register, reset, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const productGroupSelectList = useSelector(state => state.part.productGroupSelectList)
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)


    useEffect(() => {
        dispatch(getFormGridData({}))
        dispatch(getProductGroupSelectList(() => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
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

    return (
        <>
            {!runGotGivenReport && <div className="container-fluid ">

                <div className="cost-ratio-report">
                    <form noValidate >
                        <Row>

                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Technology"}
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
                            <Col md="3" className="mt-2">
                                <button
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
            {runGotGivenReport && <GotGivenSummary closeDrawer={closeDrawer} part={part} product={product} />}
        </>
    )
}
export default GotGivenReport