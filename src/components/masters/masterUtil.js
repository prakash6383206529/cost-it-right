// import React, { useEffect, useState } from 'react';
import { EMPTY_DATA } from '../../config/constants';
import { Field } from "redux-form";
import NoContentFound from '../common/NoContentFound';
import { TextFieldHookForm } from '../layout/HookFormInputs';
import { Col, Row } from 'reactstrap';
import { useForm, Controller } from "react-hook-form";
import { AgGridReact } from 'ag-grid-react';
import React, { useMemo, useState } from 'react';
import { renderMultiSelectField } from "../../components/layout/FormInputs";

const gridOptions = {};

const rowSpan = (params) => {
    var ProcessGroup = params.data.ProcessGroup;
    if (ProcessGroup === 'ABC') {
        return 2;
    } else {
        return 1;
    }
};

export const ProcessGroup = (props) => {

    const { register, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'ProcessGroup',
            rowSpan: rowSpan,
            cellClassRules: {
                'cell-span': " value==='ABC'",
            },
            width: 200,
        },
        { field: 'Process' },

    ]);
    const defaultColDef = useMemo(() => {
        return {
            width: 170,
            resizable: true,
        };
    }, []);


    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setRowData([
            {
                ProcessGroup: "ABC",
                Process: 'DEF'
            },
            {
                ProcessGroup: "DEFE",
                Process: 'FRG'
            },
            {
                ProcessGroup: "ABC",
                Process: 'LMO'
            },
            {
                ProcessGroup: "DEFE",
                Process: 'SDE'
            },
            {
                ProcessGroup: "MHR",
                Process: 'ABCRT'
            }
        ])

    };
    const handleTechnology = () => { }
    const renderListing = (label) => { }
    return (
        <>
            <Row>
                <Col md="3">
                    <div className="">
                        <TextFieldHookForm
                            //   title={titleObj.partNameTitle}
                            label="Group Name"
                            name={'groupName'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{ required: false, }}
                            handleChange={() => { }}
                            defaultValue={''}
                            customClassName={'withBorder'}
                            errors={errors.PartName}
                        // disabled={true}
                        />
                    </div>
                    {/* {(!props.isEditFlag || isViewFlag) && <div
                        // onClick={this.processToggler}
                        className={'plus-icon-square mr5 right'}>
                    </div>} */}
                </Col>
                <Col md="3">
                    <Field
                        label="Technology"
                        name="technology"
                        placeholder="Select"
                        selection={
                            []
                        }
                        options={renderListing("process")}
                        selectionChanged={handleTechnology}
                        optionValue={(option) => option.Value}
                        optionLabel={(option) => option.Text}
                        component={renderMultiSelectField}
                        mendatory={true}
                        //   validate={selectedTechnology == null || selectedTechnology.length === 0 ? [required] : []}
                        className="multiselect-with-border"
                    //   disabled={isEditFlag ? true : false}
                    />
                </Col>
                <Col md="3" className='mb-2 d-flex align-items-center'>
                    <div>
                        {props.isEditIndex ?
                            <>
                                <button
                                    //   disabled={isViewMode}
                                    type="button"
                                    className={'btn btn-primary mt30 pull-left mr5'}
                                // onClick={this.updateProcessGrid}
                                >Update</button>

                                <button
                                    type={'button'}
                                    //   disabled={isViewMode}
                                    className="reset-btn mt30 "
                                // onClick={this.resetProcessGridData}
                                >{'Cancel'}
                                </button>
                            </>
                            :
                            // !IsDetailedEntry &&
                            <>
                                <button
                                    type="button"
                                    className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                //   disabled={isViewFlag ? true : isViewMode}
                                // onClick={this.processTableHandler}
                                >
                                    <div className={'plus'}></div>ADD</button>
                                <button
                                    type="button"
                                    //   disabled={isViewMode}
                                    className={`${props.isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                // onClick={this.resetProcessGridData}
                                >Reset</button>
                            </>
                        }
                    </div>
                </Col>
            </Row>
            <div className={`ag-grid-wrapper  border mb-4`}>
                <div className={`ag-theme-material`}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        suppressRowTransform={true}
                        onGridReady={onGridReady}
                        domLayout='autoHeight'
                    ></AgGridReact>
                </div>
            </div>
        </>
    );
};
