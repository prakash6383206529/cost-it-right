import React, { useEffect, useState } from 'react';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { Col, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import HeaderTitle from '../../common/HeaderTitle';
import TooltipCustom from '../../common/Tooltip';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { getRfqToolingDetails, updatedToolingData } from '../actions/rfq';
import { Controller, useForm } from 'react-hook-form'
import { useLabels } from '../../../helper/core';
function AddToolingRfq() {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    // const { getRfqToolingData } = useSelector(state => state?.rfq);

    const getRfqToolingData = {
        partName: 'Tool A',
        toolingType: 'Injection Mold',
        partRM: 'Aluminum',
        toolTechnology: 'Advanced',
        toolLife: '5000 Cycles',
        machineTonage: '10 Ton',
        noOfCavity: '10',
        toolRunLoc: 'India',
    };
    const [formData, setFormData] = useState(getRfqToolingData);
    const { technologyLabel } = useLabels();
    const [rowData, setRowData] = useState([

    ]);

    const dispatch = useDispatch()
    // useEffect(() => {
    //     dispatch(getRfqToolingDetails(() => { }))
    // }, [])
    // useEffect(() => {
    //     // Update local state when toolingRfqData is updated
    //     if (getRfqToolingData) {
    //         // Assuming toolingRfqData contains both editable and disabled fields
    //         setRowData(getRfqToolingData.specifications || []);
    //         // Additional logic to handle form data if needed
    //     }
    // }, [toolingRfqData]);

    // useEffect(() => {

    //     dispatch(updatedToolingData((formData) => { }))
    // }, [])
    const toolingDetailsInputFields = [
        { name: 'toolingType', label: 'Tooling Type', editable: false, tooltip: 'Tooling Type', mandatory: false },
        { name: 'toolTechnology', label: `Tool ${technologyLabel}`, editable: false, tooltip: 'Tool Technology', mandatory: false },
        { name: 'toolLife', label: 'Tool Life', editable: false, tooltip: 'Tool Life', mandatory: false },
        { name: 'noOfCavity', label: 'No. of Cavity', editable: false, tooltip: 'No of Cavity', mandatory: false },
        { name: 'machineTonage', label: 'Machine Tonnage', editable: false, tooltip: 'Machine Tonnage', mandatory: false },
        { name: 'toolRunLoc', label: 'Tool Run loc.', editable: false, tooltip: 'Tool Run loc.', mandatory: false },
    ];
    const columnDefs = [
        { headerName: 'Specification', field: 'specification', editable: false },
        { headerName: 'Value', field: 'value', editable: false },
    ];


    useEffect(() => {
        setValue("noOfCavity", getRfqToolingData?.noOfCavity)
        setValue("machineTonage", getRfqToolingData?.machineTonage)
        setValue("partName", getRfqToolingData?.partName)
        setValue("toolingType", getRfqToolingData?.toolingType)
        setValue("partRM", getRfqToolingData?.partRM)
        setValue("toolTechnology", getRfqToolingData?.toolTechnology)
        setValue("toolLife", getRfqToolingData?.toolLife)
        setValue("toolRunLoc", getRfqToolingData?.toolRunLoc)

    }, [])
    const handleInputChange = (name, value) => {


        // Update form data in state
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    return (
        <>
            <Row>
                <Col md="12">
                    <HeaderTitle
                        title={'Tooling:'} />
                </Col>
                <form>
                    <Row>
                        {toolingDetailsInputFields.map(item => {
                            const { tooltip = "", name, label, editable } = item ?? {};
                            return <Col md="3">
                                {/* {item.tooltip && <TooltipCustom width={tooltip.width} tooltipClass={tooltip.className ?? ''} disabledIcon={true} id={item.name} tooltipText={`${item.label} = ${tooltip.text ?? ''}`} />} */}
                                <TextFieldHookForm
                                    label={label}
                                    name={name}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    rules={{ required: false }}
                                    mandatory={false}
                                    handleChange={(e) => handleInputChange(name, e.target.value)}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors[name]}
                                    disabled={!editable}
                                    placeholder={!editable}
                                />
                            </Col>
                        })}

                    </Row>
                </form>
            </Row>
        </>

    );
}

export default AddToolingRfq;
