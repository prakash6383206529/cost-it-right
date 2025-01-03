import React, { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
import LoaderCustom from '../../common/LoaderCustom';
import RMCompareTable from '../../rfq/compareTable/RMCompareTable';
import BOPCompareTable from '../../rfq/compareTable/BOPCompareTable';
import { rfqGetBestCostingDetails } from '../../rfq/actions/rfq';
import { useDispatch, useSelector } from 'react-redux';
import { calculateBestCost } from '../../../helper';
import _ from 'lodash';


const RfqMasterApprovalDrawer = (props) => {
  
  const dispatch = useDispatch();
  const [isLoader, setIsLoader] = useState(false);
  const [uniqueShouldCostingId,setUniqueShouldCostingId  ] = useState([])
  const [bestCostData,setBestCostData] = useState([])
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { selectedRows } = props

useEffect(() => {
  dispatch(rfqGetBestCostingDetails(selectedRows[0]?.BestCostAndShouldCostMasterDetails?.BestCostId, (res) => {
    let temp = []
    const uniqueShouldCostingIdArr = props?.uniqueShouldCostingId || [];
    const idArr = props?.selectedRows.map(item => item.RawMaterialId);
    const combinedArr = Array.from(new Set([...uniqueShouldCostingIdArr, ...idArr]));

    // Call API based on part type
    // if (props.type === 'Raw Material') {
    //   dispatch(getViewRawMaterialDetails(combinedArr, res => {
    //     setIsLoader(false)
    //     if (res) {
    //       res?.data?.DataList?.map((item) => {
    //         temp.push(item)
    //         return null
    //       })
    //       let dat = [...temp]
    //       let tempArrToSend = _.uniqBy(dat, 'RawMaterialId')
    //       let arr = calculateBestCost(tempArrToSend, true)
    //       dispatch(setRawMaterialCostingData([...arr]))
    //     }
    //   }))
    // } else if (props.type === 'Bought Out Part') {
    //   dispatch(getViewBOPDetails(combinedArr, res => {
    //     setIsLoader(false)
    //     if (res) {
    //       res?.data?.DataList?.map((item) => {
    //         temp.push(item)
    //         return null
    //       })
    //       let dat = [...temp]
    //       let tempArrToSend = _.uniqBy(dat, 'BoughtOutPartId')
    //       let arr = calculateBestCost(tempArrToSend,true)
    //       dispatch(setBopCostingData([...arr]))
    //     }
    //   }))
    // }
  }))
  uniqueShouldCost()
}, [])

const onSubmit = handleSubmit((data) => {
    // Handle form submission
    
    props.closeDrawer();
  });

  const toggleDrawer = () => {
    props.closeDrawer();
  };

  const uniqueShouldCost = () => {
    let uniqueShouldCostId = [];
    const rmShouldCost = selectedRows[0]?.BestCostAndShouldCostMasterDetails?.ShouldRawMaterials || [];
    const bopShouldCost = selectedRows[0]?.BestCostAndShouldCostMasterDetails?.ShouldBoughtOutParts || [];

    switch (props.type) {
        case 'Raw Material':
            uniqueShouldCostId = _.uniq(rmShouldCost.map(item => item.RawMaterialId));
            break;
        case 'Bought Out Part':
            uniqueShouldCostId = _.uniq(bopShouldCost.map(item => item.BoughtOutPartId));
            break;
        default:
            break;
    }

    setUniqueShouldCostingId(uniqueShouldCostId);
}

  return (
    <Drawer anchor="right" open={props.isOpen} onClose={toggleDrawer}>
      <div className="container">
        <div className="drawer-wrapper layout-width-1200px">
          <Row className="drawer-heading">
            <Col>
              <div className="header-wrapper left">
                <h3>Compare Quotation</h3>
              </div>
              <div onClick={toggleDrawer} className="close-button right"></div>
            </Col>
          </Row>

          {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}

          {props.type === 'Raw Material' && <RMCompareTable
            // checkCostingSelected={checkCostingSelected}
            compare={true}
            selectedRows={props.selectedRows[0].BestCostAndShouldCostMasterDetails?.RawMaterialIdList}
            quotationId={props.quotationId}
            uniqueShouldCostingId={uniqueShouldCostingId}
            RfqMasterApprovalDrawer={true}
            bestCostData={bestCostData}
          />}
          {props.type === 'Bought Out Part' && <BOPCompareTable
            // checkCostingSelected={checkCostingSelected}
            compare={true}
            selectedRows={props.selectedRows[0].BestCostAndShouldCostMasterDetails.BoughtOutPartIdList}
            uniqueShouldCostingId={uniqueShouldCostingId}
            quotationId={props.quotationId}
            RfqMasterApprovalDrawer={true}
            bestCostData={bestCostData}
          />}
        </div>
      </div>
    </Drawer>
  );
};

export default RfqMasterApprovalDrawer;