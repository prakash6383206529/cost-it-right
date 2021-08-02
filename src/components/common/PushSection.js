import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch } from 'react-redux'
// import { pushedApprovedCosting, createRawMaterialSAP, approvalPushedOnSap } from '../../actions/Approval'
// import { loggedInUserId } from '../../../../helper'
import { useForm, Controller } from "react-hook-form";
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs'
// import { materialGroup, purchasingGroup } from '../../../../config/masterData';
import { useState } from 'react'
// import { INR } from '../../../../config/constants'
import { toastr } from 'react-redux-toastr'
import moment from 'moment'
import { materialGroup, purchasingGroup } from '../../config/masterData';
import { setSAPData } from '../costing/actions/Approval';


function PushSection(props) {
    const { register, handleSubmit, formState: { errors }, control } = useForm();

    const [MaterialGroup, setMaterialGroup] = useState([]);
    const [PurchasingGroup, setPurchasingGroup] = useState([]);
    const dispatch = useDispatch()

    /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
    const renderListing = (label) => {
        let tempArr = []
        if (label === 'MaterialGroup') {
            const material = materialGroup;
            material && material.map(item => {
                tempArr.push({ label: `${item.label}(${item.value})`, value: item.value })
                return null
            })
        }
        if (label === 'PurchasingGroup') {
            const purchase = purchasingGroup;
            purchase && purchase.map(item => {
                tempArr.push({ label: `${item.label}(${item.value})`, value: item.value })
                return null
            })
        }
        return tempArr
    }

    /**
   * @const handleMaterialChange
   */
    const handleMaterialChange = (newValue) => {
        if (newValue && newValue !== '') {
            setMaterialGroup(newValue)
            dispatch(setSAPData({ PurchasingGroup: PurchasingGroup, MaterialGroup: newValue, }))
        } else {
            setMaterialGroup([])
        }
    }

    /**
  * @const handlePurchasingChange
  */
    const handlePurchasingChange = (newValue) => {
        if (newValue && newValue !== '') {
            setPurchasingGroup(newValue)
            dispatch(setSAPData({ PurchasingGroup: newValue, MaterialGroup: MaterialGroup }))
        } else {
            setPurchasingGroup([])
        }
    }

    return (
        <>
            <Row className="pl-3">
                <Col md="6">
                    <TextFieldHookForm
                        label="Company Code"
                        name={"CompanyCode"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={() => { }}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.CompanyCode}
                        disabled={true}
                    />
                </Col>
                {/* </Row> */}
                {/* <Row className="pl-3"> */}
                <Col md="6">
                    <SearchableSelectHookForm
                        label={"Material Group"}
                        name={"MaterialGroup"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={MaterialGroup.length !== 0 ? MaterialGroup : ""}
                        options={renderListing("MaterialGroup")}
                        mandatory={true}
                        handleChange={handleMaterialChange}
                        errors={errors.MaterialGroup}
                    />

                </Col>
                <Col md="6">
                    <SearchableSelectHookForm
                        label={"Purchasing Group"}
                        name={"PurchasingGroup"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={PurchasingGroup.length !== 0 ? PurchasingGroup : ""}
                        options={renderListing("PurchasingGroup")}
                        mandatory={true}
                        handleChange={handlePurchasingChange}
                        errors={errors.PurchasingGroup}
                    />
                </Col>
            </Row>
        </>
    );
}

export default PushSection;