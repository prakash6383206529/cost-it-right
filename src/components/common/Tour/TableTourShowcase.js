import { AgGridReact } from 'ag-grid-react'
import React, { useEffect, useState } from 'react'
import { EMPTY_DATA } from '../../../config/constants'
import { Col, Row } from 'reactstrap'
import { Steps } from 'intro.js-react';
import { tableShowCaseSteps } from './TourMessages'
import { useTranslation } from 'react-i18next';
import Switch from "react-switch";
import Button from '../../layout/Button';

const gridOptions = {};
const approvalStatusName = ['Approved', 'Draft', 'PendingForApproval', 'AwaitingForApproval', "Error"]
function TableTourShowcase(props) {
    const { headerName, options, actionButtons, mainButtons } = props || {}
    const [columnDefs, setColumnDefs] = useState([])
    const [rowData, setrowData] = useState([])
    const { t } = useTranslation("Common")
    const [isOpen, setIsOpen] = useState(false);
    const [showGrid, setShowGrid] = useState(false)
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        floatingFilter: true,
    };

    useEffect(() => {
        let columnsStoreArr = [];
        let rowStoreArr = []
        headerName?.map((item, index) => {
            let columnKeyWithData = {}
            if (item === 'Status') {
                columnKeyWithData.cellRenderer = 'statusFormatter'
            }
            if (item === 'Action') {
                columnKeyWithData.cellRenderer = 'actionFormatter'
                columnKeyWithData.type = "rightAligned"
                columnKeyWithData.width = "320px"
            }
            if (options?.checkBox && index === 0) {
                columnKeyWithData.cellClass = "has-checkbox"
                columnKeyWithData.checkboxSelection = true
            }
            if (options?.firstColumnLink && index === 0) {
                columnKeyWithData.cellRenderer = 'linkFormatter'
            }
            columnKeyWithData['field'] = `Column${index}`
            columnKeyWithData['headerName'] = item;
            columnsStoreArr.push(columnKeyWithData)


            let rowKeyWithData = {}
            for (let i = 0; i < (headerName?.length || 0); i++) {
                if (headerName?.[i] === 'Status' && options?.isApprovalFlow) {
                    rowKeyWithData[`Column${i}`] = approvalStatusName[Math.floor(Math.random() * 5)]
                } else {
                    rowKeyWithData[`Column${i}`] = `data${i + 1}`;
                }
            }
            rowStoreArr.push(rowKeyWithData)
        })
        setrowData(rowStoreArr)

        setColumnDefs(columnsStoreArr)
        setShowGrid(true)
        setTimeout(() => {
            setIsOpen(true)
        }, 400);

    }, [])
    const onGridReady = (params) => {
        setTimeout(() => {
            params?.api?.sizeColumnsToFit()
        }, 200);
    }
    const statusFormatter = (props) => {
        const cellValue = true;
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const toggleStatus = <>
            <label htmlFor="normal-switch" className="normal-switch" id={`switch_${props?.rowIndex || 0}`}>
                <Switch
                    onChange={() => { }}
                    checked={cellValue}
                    disabled={false}
                    background="#ff6600"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#FC5774"
                    id="normal-switch"
                    height={24}
                    className={cellValue ? "active-switch" : "inactive-switch"}
                />
            </label>
        </>
        const approvalStatus = <div className={cell}>{cell}</div>
        return options?.isApprovalFlow ? approvalStatus : toggleStatus
    }
    const actionFormatter = () => {
        return <>
            {actionButtons && actionButtons.map(item => {
                if (item?.toLowerCase() === 'copy') {
                    return <button id={`table_showcase_${item?.toLowerCase()}`} className={`${item} All mr-1`} type={'button'} ></button >
                } else {
                    return <button id={`table_showcase_${item?.toLowerCase()}`} className={`${item} mr-1`} type={'button'} ></button >
                }
            })
            }
        </>
    }

    const linkFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                <div
                    id={`link_${props?.rowIndex || 0}`}
                    className={'link'}
                >{cell}</div>
            </>
        )
    }
    const frameworkComponents = {
        statusFormatter: statusFormatter,
        actionFormatter: actionFormatter,
        linkFormatter: linkFormatter
    };
    return (
        <div className={`showcase-container`}>
            <div className={`ag-grid-react`}>
                <Steps
                    enabled={isOpen}
                    steps={tableShowCaseSteps(t, props || {})}
                    onExit={(() => {
                        props?.close?.()
                        setIsOpen(false)
                    })}
                    initialStep={0}
                    options={{ hideNext: false, hidePrev: true, doneLabel: 'Got it', skipLabel: 'Skip', }}
                    onComplete={(() => { })}
                    onChange={(() => { })}
                />
                <Row className='mb-2'>
                    <Col md="4" className='d-flex'>
                        <input type="text" className="form-control table-search mr-0" id="filter-text-box" placeholder="Search" autoComplete={'off'} />
                        <Button
                            id={"RM_listing_Guide"}
                            variant={"ml-2"}
                            className={`guide-bulb-on`}
                            title='Guide'
                        />
                    </Col>
                    <Col md="8" className='d-flex justify-content-end'>
                        {mainButtons && mainButtons.map(item => {
                            if (item?.toLowerCase() === 'download') {
                                return <button id={`showcase_${item?.toLowerCase()}`} type="button" class="user-btn mr5"><div class={`${item?.toLowerCase()} `}></div>All</button>
                            } else if (item?.toLowerCase() === 'add') {
                                return <button id={`showcase_${item?.toLowerCase()}`} type="button" className={"user-btn mr5"}><div className={"plus mr-0"}></div></button>
                            }
                            else {
                                return <button id={`showcase_${item?.toLowerCase()}`} type="button" class="user-btn mr5" disabled={item === 'Filter' ? true : false}><div class={`${item?.toLowerCase()}`}></div></button>
                            }
                        })}
                    </Col>
                </Row>
                <div className={`ag-grid-wrapper`}>
                    <div className={`ag-theme-material`}>
                        {showGrid && <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            gridOptions={gridOptions}
                            columnDefs={columnDefs}
                            rowData={rowData}
                            pagination={true}
                            paginationPageSize={10}
                            onGridReady={onGridReady}
                            loadingOverlayComponent={'customLoadingOverlay'}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass'
                            }}
                            frameworkComponents={frameworkComponents}
                            suppressRowClickSelection={true}
                            rowSelection={'multiple'}
                        >

                        </AgGridReact>}
                        {/* <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} /> */}
                    </div>
                </div>
            </div >
        </div>
    )
}

export default TableTourShowcase
