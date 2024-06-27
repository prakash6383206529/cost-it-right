import { Drawer } from '@material-ui/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Col, Container, Row, Nav, NavItem, NavLink, TabContent, TabPane, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import HeaderTitle from '../../common/HeaderTitle';
import { getSpecificationDetailTco } from '../actions/Costing';
const PartSpecificationDrawer = (props) => {
    const [isLoader, setIsLoader] = useState(false)

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
        setIsLoader(true)
dispatch(getSpecificationDetailTco( (res) => {
    
    setTableData(res)
  
}))
    }, [])

    
   

    return (
        
        <>

            <Drawer className="top-drawer" anchor={"right"} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
            <Container>
               

                    <div className={`ag-grid-react`}>
                        <div className={'drawer-wrapper width768'}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{`Part Specification Detail`}</h3>
                                    </div>
                                    <div onClick={(e) => toggleDrawer(e)} className={'close-button right'}></div>
                                </Col>
                            </Row>
                            {/* {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />} */}
                            <Col md="12">
                                        <HeaderTitle title={'Specifications'} customClass="mt-3" />

                                        <Table striped>
                                        <thead>
    <tr>
      {partSpecificationRFQData.SpecsHead.map((specHead, index) => (
        <th key={index}>{specHead}</th>
      ))}
    </tr>
  </thead>
                    <tbody>
                        {partSpecificationRFQData?.SpecsColumn?.map((row, index) => (
                            <tr key={index}>
                                <td>{row.part}</td>
                                <td>{row.SHM01}</td>
                                <td>{row.SHM02}</td>
                                <td>{row.SHM03}</td>
                                <td>{row.SHM04}</td>
                                <td>{row.SHM05}</td>
                            </tr>
                        ))}
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





