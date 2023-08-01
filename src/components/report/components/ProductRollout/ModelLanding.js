import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { MESSAGES } from "../../../../config/message";
import { searchCount } from "../../../../config/constants";
import { getPartSelectListWtihRevNo } from "../../../masters/actions/Volume";
import { reactLocalStorage } from "reactjs-localstorage";
import { autoCompleteDropdownPart } from "../../../common/CommonFunctions";
const modelSelectList = [
    { Text: 'MD-002', Value: 1 }, { Text: 'MD-004', Value: 2 }, { Text: 'MD-006', Value: 3 },
] //DUMMY DATA
const ModelLanding = (props) => {
    const { control, register, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const [model, setModel] = useState([])
    const [part, setPart] = useState([])
    const [partName, setpartName] = useState('')
    const renderListing = (label) => {
        const temp = []
        if (label === 'Model') {
            modelSelectList && modelSelectList.map((item) => {
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


            const res = await getPartSelectListWtihRevNo(resultInput);
            setpartName(resultInput)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)
            } else {
                return partDataAPI
            }

        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject(props.partWithRevision ? 'PartData' : 'Data')
                if (inputValue) {

                    return autoCompleteDropdownPart(inputValue, partData, false, [], false)
                }
                else {
                    return partData
                }
            }
        }

    }

    return (
        <div className="seprate-box">
            <Row>
                <Col md="4">
                    <SearchableSelectHookForm
                        label={"Model No."}
                        name={"model"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={model.length !== 0 ? model : ""}
                        options={renderListing("Model")}
                        mandatory={false}
                        handleChange={() => { }}
                    />
                </Col>
                <Col md="4">
                    <AsyncSearchableSelectHookForm
                        label={"Part No."}
                        name={"Part"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={part.length !== 0 ? part : ""}
                        asyncOptions={filterList}
                        mandatory={false}
                        //   isLoading={loaderObj}
                        handleChange={() => { }}
                        errors={errors.Part}
                        disabled={false}
                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                    />
                </Col>
                <Col md="4" className="d-flex align-items-center">
                    <div className="inputbox date-section h-auto">
                        <DatePickerHookForm
                            name={`EffectiveDate`}
                            label={'Effective Date'}
                            selected={new Date()}
                            handleChange={(date) => {

                            }}
                            rules={{ required: false }}
                            Controller={Controller}
                            control={control}
                            register={register}
                            showMonthDropdown
                            showYearDropdown
                            dateFormat="DD/MM/YYYY"
                            placeholder="-"
                            customClassName="withBorder"
                            className="withBorder"
                            autoComplete={"off"}
                            disabledKeyboardNavigation
                            onChangeRaw={(e) => e.preventDefault()}
                            disabled={true}
                            mandatory={false}
                            errors={errors && errors.EffectiveDate}
                        />
                    </div>
                    <button className='user-btn ml-1 mt-2' onClick={props.fetchData}>
                        <div className='save-icon'></div>
                    </button>

                </Col>
                <Col md="12">
                    <div className="disabled-background"><div className="text-disabled">image will come here</div></div>
                </Col>
            </Row>
        </div>
    );
}
export default ModelLanding;