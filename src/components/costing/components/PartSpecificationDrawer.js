import { Drawer } from '@material-ui/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Col, Container, Row, Nav, NavItem, NavLink, TabContent, TabPane, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import HeaderTitle from '../../common/HeaderTitle';
import { getSpecificationDetailTco } from '../actions/Costing';
import { QuotationId } from '../../rfq/ViewRfq';
import LoaderCustom from '../../common/LoaderCustom';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { REMARKMAXLENGTH } from '../../../config/masterData';
import { Controller, useForm } from 'react-hook-form';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA } from '../../../config/constants';
const PartSpecificationDrawer = (props) => {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const [isLoader, setIsLoader] = useState(false)
    const quotationId = useContext(QuotationId)
    
const {quotationDetailsList} = useSelector((state) => state?.rfq)
    const [tableData, setTableData] = useState([]);
    const dispatch = useDispatch();
        const { partSpecificationRFQData } = useSelector((state) => state?.costing)
        
    

    // 
    /**
     * @method toggleDrawer
     * @description control the drawer
    */
    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('');
    };

    useEffect(() => {
        if (quotationDetailsList && quotationDetailsList.length > 0) {
            setIsLoader(true);

            // Extract all CostingIds and filter out null values
            const baseCostingIds = quotationDetailsList
            .map(item => item.CostingId)
            .filter(id => id !== null);
            

            if (baseCostingIds.length > 0) {
                dispatch(getSpecificationDetailTco(quotationId, baseCostingIds, (res) => {
                    setTableData(res);
                    setIsLoader(false);
                }));
            } else {
                setIsLoader(false);
            }
        }
    }, [quotationDetailsList, quotationId, dispatch]);
    
   

    return (
        
        <>

            <Drawer className="top-drawer" anchor={"right"} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
            <Container>
               

                    <div className={`ag-grid-react`}>
                        <div className={'drawer-wrapper drawer-full-width'}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{`Part Specification Detail`}</h3>
                                    </div>
                                    <div onClick={(e) => toggleDrawer(e)} className={'close-button right'}></div>
                                </Col>
                            </Row>
                            {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
                            <Col md="12">
                                        <HeaderTitle title={'Specifications'} customClass="mt-3" />
                                       <Row className="mt-1 part-detail-wrapper"> 

                                        <Col md="3">
                                                <TextFieldHookForm
                                                    label="Havells Design Part"
                                                    name={"HavellsDesignPart"}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    disabled={true}

                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Specification}
                                                />
                                            </Col>

 <Col md="3">
                                                <TextFieldHookForm
                                                    label="Target Price"
                                                    name={'TagetPrice'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                         
                                         


</Col> 

<Col md="3">
                                                <TextFieldHookForm
                                                    label="UOM"
                                                    name={'UOMSymbol'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                         
                                         


</Col> 
<Col md="3">
                                                <TextFieldHookForm
                                                    label="Date"
                                                    name={'TimeLine'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                         
                                         


</Col> 

</Row> 


                                        <Table striped>
                                        <thead>
    <tr>
      {partSpecificationRFQData?.SpecsHead?.map((specHead, index) => (
        <th key={index}>{specHead}</th>
      ))}
    </tr>
  </thead>
                    <tbody>
                    {partSpecificationRFQData?.SpecsColumn?.length === 0 ? (
                                          
<NoContentFound title={EMPTY_DATA} customClassName="no-content-found align right" />                                          
                                        ) : (
                                            partSpecificationRFQData?.SpecsColumn?.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.PartSpecs}</td>
                                                    <td>{row.PartSpecsValue}</td>
                                                    <td>{row.SHM-2216}</td>
                                                    <td>{row.SHM-2309.}</td>
                                                    <td>{row.SHM-2339}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                </Table>
                <HeaderTitle title={'SOP Details'} customClass="mt-3" />

<Table striped>
                                    <thead>
                                        <tr>
                                            <th>Part No</th>
                                            <th>Production Year</th>
                                            <th>Annual Forecast Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {partSpecificationRFQData?.SOPQuantityDetails?.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center">
                                                    <NoContentFound title={EMPTY_DATA} customClassName="no-content-found align right" />
                                                </td>
                                            </tr>
                                        ) : (
                                            partSpecificationRFQData?.SOPQuantityDetails?.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.PartNumber}</td>
                                                    <td>{row.YearName}</td>
                                                    <td>{row.Quantity}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                                    </Col>
                            

                        </div>
                    </div>
                </Container>
            </Drawer>
        </>
    );
};

export default PartSpecificationDrawer;





