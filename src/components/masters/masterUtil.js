// import React, { useEffect, useState } from 'react';
import { EMPTY_DATA } from '../../config/constants';
import { Field } from "redux-form";
import NoContentFound from '../common/NoContentFound';
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs';
import { Col, Row } from 'reactstrap';
import { useForm, Controller } from "react-hook-form";
import { AgGridReact } from 'ag-grid-react';
import React, { useMemo, useState } from 'react';
import { renderMultiSelectField, renderText } from "../../components/layout/FormInputs";
import { checkWhiteSpaces, maxLength80 } from '../../helper';

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

    const { register, control, formState: { errors }, getValues } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'GroupName',
            rowSpan: rowSpan,
            cellClassRules: {
                'cell-span': `"value === ${getValues('groupName')}"`,
            },
            width: 200,
        },
        { field: 'ProcessName' },

    ]);

    const [selectedProcess, setSelectedProcess] = useState([])
    const defaultColDef = useMemo(() => {
        return {
            width: 170,
            resizable: true,
        };
    }, []);


    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        // slected row 1 time

    };
    const handleProcess = () => {
        const processName = getValues('process')
        console.log('processName: ', processName);
        setSelectedProcess([...selectedProcess, { ProcessName: processName.label, ProcessId: processName.value }])

    }

    const processTableHandler = () => {

        let temp = selectedProcess && selectedProcess.map((item, index) => {
            if (index === 0) {
                return { GroupName: getValues('groupName'), ProcessName: item.ProcessName, ProcessId: item.ProcessId }
            } else {
                return { GroupName: '', ProcessName: item.ProcessName, ProcessId: item.ProcessId }
            }
        })
        setRowData([...rowData, temp])
    }

    const renderListing = (label) => {
        let temp = []
        if (label === 'process') {
            temp = props.processListing && props.processListing.map(item => {
                return { label: item.processName, value: item.ProcessId }
            })
        }
        console.log(temp, "temp");
        return temp
    }
    return (
        <>
            <Row>
                <Col className="col-md-3">
                    <TextFieldHookForm
                        label="Group Name"
                        name={"groupName"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        rules={{ required: false }}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.groupName}
                        disabled={false}
                    />
                </Col>
                <Col className="col-md-3">
                    <SearchableSelectHookForm
                        label={"Process"}
                        name={"process"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        options={renderListing("process")}
                        mandatory={false}
                        handleChange={() => { }}
                        errors={errors.process}
                    />
                </Col>
                {
                    <Col className="col-md-1 d-flex align-items-center">
                        <div onClick={handleProcess} className={'plus-icon-square mr5 right'}> </div>
                    </Col>

                }
                <Col md="3" className='process-group-wrapper'>
                    <div className='border process-group'>
                        {
                            selectedProcess && selectedProcess.map(item =>
                                <span className='process-name'>{item.Text}</span>
                            )
                        }
                    </div>
                </Col>
                <Col md="3" className='mb-2 d-flex align-items-center'>
                    <div>
                        {
                            <>
                                <button
                                    type="button"
                                    className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                    //   disabled={isViewFlag ? true : isViewMode}
                                    onClick={processTableHandler}
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
