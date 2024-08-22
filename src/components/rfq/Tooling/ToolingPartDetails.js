import React, { useEffect, useState } from 'react';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { Col, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import HeaderTitle from '../../common/HeaderTitle';
import TooltipCustom from '../../common/Tooltip';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form'
import { EMPTY_DATA } from '../../../config/constants';
function ToolingPartDetails() {
    const gridOptions = {};
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { toolingSpecificRowData } = useSelector(state => state?.rfq);

    const [formData, setFormData] = useState(toolingSpecificRowData[0]?.ToolPartData);
    const [rowData, setRowData] = useState([]);

    const dispatch = useDispatch()
    const toolingDetailsInputFields = [
        { name: 'partName', label: 'Part Name', editable: false, tooltip: 'Part Name', mandatory: false },
        { name: 'partRM', label: 'Part RM', editable: false, tooltip: 'Part RM', mandatory: false },

    ];
    const columnDefs = [
        { headerName: 'Specification', field: 'Specification', editable: false },
        { headerName: 'Value', field: 'Value', editable: false },
    ];


    useEffect(() => {
        const toolPartData = toolingSpecificRowData[0]?.ToolPartData
        setValue("partName", toolPartData?.ToolPartName)
        setValue("partRM", toolPartData?.ToolPartRawMaterial)
        setRowData(toolPartData?.ToolPartSpecificationList || [])

    }, [])
    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    /**
     * @method defaultColDef
     * @description Default column definitions for the table.
    */
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        editable: true
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
                                <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
                                    <AgGridReact

                                        style={{ height: '100%', width: '100%' }}
                                        defaultColDef={defaultColDef}
                                        domLayout="autoHeight"
                                        rowData={rowData}
                                        onGridReady={(params) => params?.api.sizeColumnsToFit()}
                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                        noRowsOverlayComponentParams={{
                                            title: EMPTY_DATA,
                                            imagClass: 'imagClass'
                                        }}
                                        stopEditingWhenCellsLoseFocus={true}
                                        gridOptions={gridOptions}
                                    >
                                        <AgGridColumn field="Specification" headerName="Specification Description" editable={false} ></AgGridColumn>
                                        <AgGridColumn field="Value" headerName="Specification Value" editable={false}></AgGridColumn>
                                    </AgGridReact>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </form>
            </Row>
        </>

    );
}

export default ToolingPartDetails;
