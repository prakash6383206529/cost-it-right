import React, { useEffect, useState } from 'react';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { Col, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import HeaderTitle from '../../common/HeaderTitle';
import TooltipCustom from '../../common/Tooltip';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { getRfqToolingDetails, updatedToolingData } from '../actions/rfq';
import { Controller, useForm } from 'react-hook-form'
function ToolingPartDetails() {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    // const { getRfqToolingData } = useSelector(state => state?.rfq);
    const [noOfCavity, setNoOfCavity] = useState("")
    const [machineTonage, setMachineTonage] = useState("")
    const getRfqToolingData = {
        partName: 'Tool A',
        partRM: 'Aluminum',

        specifications: [
            { specification: 'Material Type', value: 'Steel' },
            { specification: 'Heat Treatment', value: 'Tempered' },
            { specification: 'Surface Finish', value: 'Polished' },
            { specification: 'Dimensions', value: '10x20x30 mm' },
        ],
    };
    const [formData, setFormData] = useState(getRfqToolingData);

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
        { name: 'partName', label: 'Part Name', editable: false, tooltip: 'Part Name', mandatory: false },
        { name: 'partRM', label: 'Part RM', editable: false, tooltip: 'Part RM', mandatory: false },

    ];
    const columnDefs = [
        { headerName: 'Specification', field: 'specification', editable: false },
        { headerName: 'Value', field: 'value', editable: false },
    ];


    useEffect(() => {

        setValue("partName", getRfqToolingData?.partName)
        setValue("partRM", getRfqToolingData?.partRM)
        setRowData(getRfqToolingData?.specifications || [])

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
                        title={'Part:'} />
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
                    <Row>
                        <Col md="12">
                            <HeaderTitle title={'Part Specification:'} />
                        </Col>
                        <Col >
                            <div className={`ag-grid-wrapper without-filter-grid rfq-grid height-width-wrapper ${rowData && rowData.length <= 0 ? "overlay-contain border" : ""} `}>
                                {/* <div className={`ag-theme-material ${!state ? "custom-min-height-208px" : ''}`}> */}

                                <AgGridReact
                                    columnDefs={columnDefs}
                                    rowData={rowData}
                                    domLayout='autoHeight'
                                />
                                {/* </div> */}
                            </div>
                        </Col>
                    </Row>
                </form>
            </Row>
        </>

    );
}

export default ToolingPartDetails;
