
import React from "react"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

import { Col, Row } from "reactstrap"




import { TextFieldHookForm, SearchableSelectHookForm } from "./layout/HookFormInputs"
import { decimalLengthsix, maxLength15, number, positiveAndDecimalNumber } from "../helper"
import { getExternalIntegrationEvaluationType } from "./costing/actions/Costing"
import { setSAPData } from "./costing/actions/Approval"



function SAPApproval(props) {

    const { Controller, control, errors, register } = props



    const dispatch = useDispatch()
    const SAPData = useSelector(state => state.approval.SAPObj)






    useEffect(() => {
        let data = {
            PlantCode: '',
            Material: ''
        }

        dispatch(getExternalIntegrationEvaluationType(data, res => { }))
    }, [])
    const { evaluationType } = useSelector((state) => state?.costing)







    const dropDown = [
        {
            label: 'Standard',
            value: 0
        },
        {
            label: 'Sub-Contracting',
            value: 1,
        },

    ]





    /**
    * @Method renderListing
    * @description Dropdown data list
    */
    const renderListing = (label) => {
        let temp = []
        if (label === 'evaluationType') {
            evaluationType && evaluationType.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'infoCategeory') {
            return dropDown
        }
    }

    const handleValuationType = (value) => {
        dispatch(setSAPData({ ...SAPData, evaluationType: value?.label }))
    }
    const handleinfoCategory = (value) => {
        dispatch(setSAPData({ ...SAPData, infoCategory: value?.value }))
    }
    const handleLeadTime = (e) => {
        dispatch(setSAPData({ ...SAPData, leadTime: e.target.value }))
    }









    return (
        <>
            <div >

                {<Row>
                    <Col md={props?.isSimulation ? "12" : "3"}>
                        <SearchableSelectHookForm
                            label={"Valuation Type"}
                            name={"evaluationType"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("evaluationType")}
                            mandatory={false}
                            handleChange={handleValuationType}
                            errors={errors.evaluationType}
                        />
                    </Col>


                    <Col md=
                        {props?.isSimulation ? "12" : "3"}>
                        <SearchableSelectHookForm
                            label={"Info Categeory"}
                            name={"infoCategeory"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("infoCategeory")}
                            mandatory={true}
                            handleChange={handleinfoCategory}
                            errors={errors.infoCategeory}
                            disabled={false}
                        />
                    </Col>
                    <Col md=
                        {props?.isSimulation ? "12" : "3"}>
                        <TextFieldHookForm
                            label={`Lead Time (Days)`}
                            name={"leadTime"}
                            placeholder={"-"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                                required: true,
                                validate: { positiveAndDecimalNumber, maxLength15, decimalLengthsix, number },
                            }}
                            disabled={false}
                            className=" "
                            handleChange={handleLeadTime}
                            customClassName=" withBorder"
                            mandatory={true}
                            errors={errors.leadTime}
                        />
                    </Col>
                </Row>}


            </div>
        </>
    )
}
export default SAPApproval