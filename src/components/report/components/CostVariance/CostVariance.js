import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs";
import { useForm, Controller } from "react-hook-form";
import { useLabels } from "../../../../helper/core";
import { formViewData, getConfigurationKey, loggedInUserId } from "../../../../helper";
import { checkPartWithTechnology, getCostingSpecificTechnology, getExistingCosting, getPartInfo, getPartSelectListByTechnology, getSingleCostingDetails, setCostingViewData } from "../../../costing/actions/Costing";
import { useDispatch, useSelector } from "react-redux";
import { getSelectListPartType } from "../../../masters/actions/Part";
import { ApprovedCostingStatus, EMPTY_DATA, searchCount } from "../../../../config/constants";
import { autoCompleteDropdown } from "../../../common/CommonFunctions";
import { reactLocalStorage } from "reactjs-localstorage";
import { MESSAGES } from "../../../../config/message";
import { BarChartComparison } from "../../../costing/components/BarChartComparison";
import CostingSummaryTable from "../../../costing/components/CostingSummaryTable";
import { getMultipleCostingDetails } from "../../../rfq/actions/rfq";
import LoaderCustom from "../../../common/LoaderCustom";
import NoContentFound from "../../../common/NoContentFound";
import { useLocation, useHistory } from "react-router-dom/cjs/react-router-dom";
import Button from "../../../layout/Button";

const CostVariance = ({ formData, viewCostVariance }) => {
    const { control, register, handleSubmit, formState: { errors } } = useForm();
    const { technologyLabel } = useLabels();
    const [partTypeList, setPartTypeList] = useState([])
    const [selectedTechnology, setSelectedTechnology] = useState({})
    const [partName, setpartName] = useState("")
    const [partType, setPartType] = useState([])
    const [inputLoader, setInputLoader] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch();
    const { costingSpecifiTechnology: technology, viewCostingDetailData } = useSelector((state) => state.costing)

    useEffect(() => {
        // window.history.replaceState({}, document.title);
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getSelectListPartType((res) => {
            setPartTypeList(res?.data?.SelectList)
        }))
    }, [])

    useEffect(() => {
        if (formData) {
            getData(formData);
        }
    }, [formData]);
    const backHandler = () => {
        viewCostVariance({
            view: false,
            data: {
                TechnologyId: '',
                PartId: '',
            }
        })
    }
    const renderListing = (type) => {
        const temp = []
        if (type === "Technology") {
            technology && technology?.map((item) => {
                if (item?.Value === '0') return false        // SPECIFIC FOR RE, HIDE Machining TECHNOLOGY IN COSTING DROPDOWN
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
        }
        else if (type === "PartType") {
            partTypeList && partTypeList?.map((item) => {
                if (item?.Value === '0') return false        // SPECIFIC FOR RE, HIDE Raw Material IN COSTING DROPDOWN
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
        }
        return temp
    }
    const handleTechnologyChange = (e) => {
        setSelectedTechnology(e)
        // getData({ TechnologyId: e.value, PartId: partType.value })
    }

    const handlePartTypeChange = (e) => {
        setPartType(e)
        getData({ TechnologyId: selectedTechnology.value, PartId: e.value })
    }

    const getData = (data) => {
        setIsLoader(true)
        dispatch(checkPartWithTechnology(data, (response) => {
            if (response.data.Result) {
                dispatch(getPartInfo(data.PartId, (res) => {
                    dispatch(getExistingCosting(data.PartId, (res) => {
                        const DataList = res?.data?.DataList;
                        const approvedCosting = DataList?.map(item => item?.CostingOptions?.filter(item => ApprovedCostingStatus.includes(String(item?.StatusId))))
                        const finalData = approvedCosting?.flat()
                        let temp = []
                        let tempObj = []
                        dispatch(getMultipleCostingDetails(finalData, (res) => {
                            if (res) {
                                res?.map((item) => {
                                    tempObj = formViewData(item?.data?.Data)
                                    temp.push(tempObj[0])
                                    return null
                                })
                            }
                            dispatch(setCostingViewData(temp))
                            setIsLoader(false)
                        }))
                    }))

                }))

            } else {
                setIsLoader(false)
            }
        }))
    }
    const handlePartChange = (e) => {
        getData({ TechnologyId: selectedTechnology.value, PartId: e.value })
    }
    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            setInputLoader(true)
            const res = await getPartSelectListByTechnology(selectedTechnology.value, resultInput, partType?.value,null);
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
    return (
        <div className="p-relative">
            {formData?.TechnologyId && formData?.PartId ? <><Row><Col md="12"><Button className="float-right" buttonName="Back" title="Back" icon="back-icon" onClick={backHandler} /></Col></Row></> : <Row>
                <Col className="col-md-15">
                    <SearchableSelectHookForm
                        label={technologyLabel}
                        name={"Technology"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={technology.length !== 0 ? technology : ""}
                        options={renderListing("Technology")}
                        mandatory={true}
                        handleChange={handleTechnologyChange}
                        errors={errors.Technology}
                    />
                </Col>
                <Col className="col-md-15">

                    <SearchableSelectHookForm
                        label={"Part Type"}
                        name={"PartType"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={partType.length !== 0 ? partType : ""}
                        options={renderListing('PartType')}
                        mandatory={true}
                        handleChange={handlePartTypeChange}
                        errors={errors.Part}
                    // disabled={(technology.length === 0) ? true : false}
                    />

                </Col>
                <Col className="col-md-15">

                    <AsyncSearchableSelectHookForm
                        label={"Assembly/Part No."}
                        name={"Part"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={part.length !== 0 ? part : ""}
                        asyncOptions={filterList}
                        mandatory={true}
                        isLoading={inputLoader}
                        handleChange={handlePartChange}
                        errors={errors.Part}
                        disabled={(partType.length === 0) ? true : false}
                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                    />

                </Col>
            </Row>}
            {isLoader ? <LoaderCustom /> :
                viewCostingDetailData.length > 0 ? <>
                    <Row>
                        <BarChartComparison
                            costingData={viewCostingDetailData}
                            currency={getConfigurationKey()?.BaseCurrency}
                        />
                    </Row>
                    <CostingSummaryTable
                        viewMode={true}
                        // simulationMode={true}
                        // isApproval={true}
                        // costingIdExist={true}
                        costVariance={true}
                        selectedTechnology={selectedTechnology.value}
                    />
                </> : <NoContentFound title={EMPTY_DATA} />}
        </div>
    )
}

export default CostVariance;

