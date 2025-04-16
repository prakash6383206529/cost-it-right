import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Controller } from 'react-hook-form';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { checkForNull, number } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA } from '../../../config/constants';
import { Drawer } from '@material-ui/core'
import DatePicker from 'react-datepicker'
import HeaderTitle from '../../common/HeaderTitle'
import DayTime from '../../common/DayTimeWrapper';
import _ from 'lodash';
import Toaster from '../../common/Toaster';

function AddForecast(props) {
    const {
        isOpen,
        closeDrawer,
        anchor,
        isViewFlag,
        partListData,
        sopDate,
        handleSOPDateChange,
        zbcDate,
        errors,
        gridOptionsPart,
        onGridReady,
        EditableCallback,
        fiveyearList,
        setFiveyearList,
        AssemblyPartNumber,
        isEditFlag,
        sopQuantityList,
        setSopQuantityList
    } = props;


    // Grid configuration
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    // Formatter functions
    const partNumberFormatter = (params) => {
        const partNumber =
            AssemblyPartNumber?.label ||
            (typeof AssemblyPartNumber === 'string' ? AssemblyPartNumber : '') ||
            params.value ||
            '-';
        return partNumber;
    };

    const sopFormatter = (params) => {
        return params.value || '-';
    };

    const beforeSaveCell = (props) => {
        let cellValue = props
        if (cellValue === undefined || cellValue === '') {
            return 0
        }
        const numValue = Number(cellValue)
        if (isNaN(numValue) || numValue < 0) {
            Toaster.warning('Please enter a valid positive number.');
            return 0
        }
        return numValue
    }

    const afcFormatter = (props) => {
        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        const cell = props?.value;
        
        const validatedValue = beforeSaveCell(cell)
        
        if (props?.node?.data) {
            props.node.data.Quantity = validatedValue
            setSopQuantityList(final)
        }

        let isEnable = isEditFlag ? true : isViewFlag ? false : true

        return (
            <>
                {<span className={`form-control custom-max-width-110px ${isEnable ? '' : 'disabled'}`}>
                    {validatedValue}
                </span>}
            </>
        )
    }

    // Grid components
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        partNumberFormatter,
        sopFormatter,
        afcFormatter
    };

    // Event handlers
    const handleSave = (isSave) => {
        if (isSave) {
            closeDrawer(true, sopQuantityList);
        } else {
            closeDrawer(false, sopQuantityList);
        }
    };

    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-720px'}>
                            <Row>
                                <Col md="12">
                                    <>
                                        <HeaderTitle title={'Add Forecast'} customClass="mt-5" />
                                        <Row className='mt-3 mb-1'>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>SOP Date<span className="asterisk-required">*</span></label>
                                                    <div id="addRFQDate_container" className="inputbox date-section">
                                                        <DatePicker
                                                            name={'SOPDate'}
                                                            placeholder={'Select'}
                                                            selected={DayTime(sopDate).isValid() ? new Date(sopDate) : ''}
                                                            onChange={handleSOPDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            minDate={props.n100Date || new Date()}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            mandatory={true}
                                                            errors={errors.SOPDate}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={isViewFlag}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="tab-pane fade active show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                            <Row>
                                                <Col md="12" className='ag-grid-react'>
                                                    <div className={`ag-grid-wrapper without-filter-grid rfq-grid height-width-wrapper ${sopQuantityList && sopQuantityList.length === 0 ? "overlay-contain" : ""} `}>
                                                        <div className={`ag-theme-material`}>
                                                            <AgGridReact
                                                                defaultColDef={defaultColDef}
                                                                floatingFilter={false}
                                                                domLayout='autoHeight'
                                                                rowData={sopQuantityList}
                                                                onGridReady={onGridReady}
                                                                gridOptions={gridOptionsPart}
                                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                noRowsOverlayComponentParams={{
                                                                    title: EMPTY_DATA,
                                                                    imagClass: 'imagClass'
                                                                }}
                                                                frameworkComponents={frameworkComponents}
                                                            >
                                                                <AgGridColumn
                                                                    width={"230px"}
                                                                    field="PartNumber"
                                                                    headerName="Part No"
                                                                    tooltipField="PartNumber"
                                                                    cellClass={"colorWhite"}
                                                                    cellRenderer={'partNumberFormatter'}
                                                                />
                                                                <AgGridColumn
                                                                    width={"230px"}
                                                                    field="YearName"
                                                                    headerName="Production Year"
                                                                    cellRenderer={'sopFormatter'}
                                                                />
                                                                <AgGridColumn
                                                                    width={"230px"}
                                                                    field="Quantity"
                                                                    headerName="Annual Forecast Quantity"
                                                                    cellRenderer={'afcFormatter'}
                                                                    editable={EditableCallback}
                                                                    colId="Quantity"
                                                                />
                                                            </AgGridReact>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                </Col>
                            </Row>
                        </div>
                    </Container>
                </div> <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between">
                    <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                        <button
                            type={'button'}
                            className="reset cancel-btn mr15"
                            onClick={() => handleSave(false)}
                        >
                            <div className={'cancel-icon'}></div> {'Cancel'}
                        </button>
                        <button
                            type={'button'}
                            className="submit-button save-btn"
                            onClick={() => handleSave(true)}
                            disabled={props.ViewMode || props?.disabled}
                        >
                            <div className={"save-icon"}></div>
                            {'Save'}
                        </button>
                    </div>
                </Row>
            </Drawer>
        </div>
    );
}

export default AddForecast;