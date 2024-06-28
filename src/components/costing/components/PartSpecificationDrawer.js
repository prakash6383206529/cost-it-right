import { Drawer } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import HeaderTitle from '../../common/HeaderTitle';
import { getSpecificationDetailTco } from '../actions/Costing';
import { QuotationId } from '../../rfq/ViewRfq';
import LoaderCustom from '../../common/LoaderCustom';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA } from '../../../config/constants';
import { AgGridReact } from 'ag-grid-react';
import SOPListing from './SOPListing';

const PartSpecificationDrawer = (props) => {
    const gridOptions = {};
    const { register, control, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const [isLoader, setIsLoader] = useState(false);
    const quotationId = useContext(QuotationId);
    const [columnDefs, setColumnDefs] = useState([]);
    console.log('columnDefs: ', columnDefs);
    const [rowData, setRowData] = useState([]);
    const dispatch = useDispatch();
    const { quotationDetailsList } = useSelector((state) => state?.rfq);
    const { partSpecificationRFQData } = useSelector((state) => state?.costing);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('');
    };

    useEffect(() => {
        if (quotationDetailsList && quotationDetailsList.length > 0) {
            setIsLoader(true);

            const baseCostingIds = quotationDetailsList
                .map(item => item.CostingId)
                .filter(id => id !== null);

            if (baseCostingIds.length > 0) {
                dispatch(getSpecificationDetailTco(quotationId, baseCostingIds, (res) => {
                    console.log('res: ', res);
                    let Data = res?.data?.Data
                    if (Data?.SpecsHead && Data?.SpecsColumn) {
                        console.log('res: ', res);
                        setColumnDefs(generateColumnDefs(Data?.SpecsHead));
                        setRowData(Data?.SpecsColumn);
                    }
                    setIsLoader(false);
                }));
            } else {
                setIsLoader(false);
            }
        }
    }, [quotationDetailsList, quotationId, dispatch]);

    const generateColumnDefs = (specsHead) => {
        console.log('specsHead: ', specsHead);
        return specsHead.map((head, index) => ({
            headerName: head,
            field: `field${index}`,
            sortable: true,
            filter: true,
        }));
    };

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        floatingFilter: true,
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
        params.api.sizeColumnsToFit();
    };

    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };

    return (
        <>
            <Drawer className="top-drawer" anchor={"right"} open={props?.isOpen} onClose={toggleDrawer}>
                <Container>
                    <div className="ag-grid-react">
                        <div className="drawer-wrapper drawer-full-width">
                            <Row className="drawer-heading">
                                <Col>
                                    <div className="header-wrapper left">
                                        <h3>Part Specification Detail</h3>
                                    </div>
                                    <div onClick={toggleDrawer} className="close-button right"></div>
                                </Col>
                            </Row>
                            {isLoader ? (
                                <LoaderCustom customClass="loader-center" />
                            ) : (
                                <Col md="12">
                                    <HeaderTitle title="Specifications" customClass="mt-3" />
                                    {rowData?.length > 0 && (
                                        <Row className="mt-1 part-detail-wrapper">
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Havells Design Part"
                                                    name="HavellsDesignPart"
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    disabled={true}
                                                    defaultValue={partSpecificationRFQData?.HavellsDesignPart || ""}
                                                    className=""
                                                    customClassName="withBorder"
                                                    errors={errors.Specification}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Target Price"
                                                    name="TargetPrice"
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    defaultValue={partSpecificationRFQData?.TargetPrice || ""}
                                                    className=""
                                                    customClassName="withBorder"
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="UOM"
                                                    name="UOMSymbol"
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    defaultValue={partSpecificationRFQData?.UOMSymbol || ""}
                                                    className=""
                                                    customClassName="withBorder"
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Date"
                                                    name="TimeLine"
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    defaultValue={partSpecificationRFQData?.TimeLine ? new Date(partSpecificationRFQData.TimeLine).toLocaleDateString() : ""}
                                                    className=""
                                                    customClassName="withBorder"
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Part Number"
                                                    name="PartNumber"
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    defaultValue={partSpecificationRFQData?.SOPQuantityDetails?.PartNumber || ""}
                                                    className=""
                                                    customClassName="withBorder"
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                            </Col>
                                        </Row>
                                    )}
                                    <div className="ag-grid-react">
                                        <div className={`ag-grid-wrapper height-width-wrapper ${rowData.length <= 0 ? "overlay-contain" : ""}`}>
                                            <div className="ag-theme-material">
                                                <AgGridReact
                                                    defaultColDef={defaultColDef}
                                                    floatingFilter={true}
                                                    domLayout="autoHeight"
                                                    gridOptions={gridOptions}
                                                    columnDefs={columnDefs}
                                                    rowData={rowData}
                                                    onGridReady={onGridReady}
                                                    loadingOverlayComponent="customLoadingOverlay"
                                                    noRowsOverlayComponent="customNoRowsOverlay"
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                        imagClass: 'imagClass'
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                    suppressRowClickSelection={true}
                                                    rowSelection="multiple"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                
                            )}
                        </div>
                        
                    </div>
                    {/* <SOPListing
                    rowData={partSpecificationRFQData?.SOPQuantityDetails}
                    /> */}
                </Container>
            </Drawer>
        </>
    );
};

export default PartSpecificationDrawer;
