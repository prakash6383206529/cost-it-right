import React, { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
import { SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import LoaderCustom from '../../common/LoaderCustom';
import RMCompareTable from '../../rfq/compareTable/RMCompareTable';
import BOPCompareTable from '../../rfq/compareTable/BOPCompareTable';
import { rfqGetBestCostingDetails } from '../../rfq/actions/rfq';
import { useDispatch } from 'react-redux';
import { formViewData } from '../../../helper';

const RfqMasterApprovalDrawer = (props) => {
    console.log('props: ', props);
    const dispatch = useDispatch();
  const [isLoader, setIsLoader] = useState(false);
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const {selectedRows} = props
useEffect(() => {
    let tempObj = []
    let temp = []
    dispatch(rfqGetBestCostingDetails(selectedRows[0]?.BestCostAndShouldCostMasterDetails?.BestCostId, (res) => {
        tempObj = formViewData(res?.data?.Data, '', true)
        tempObj[0].bestCost = true
        temp.push(tempObj[0])

             }))
    }
    , [])
  const onSubmit = handleSubmit((data) => {
    // Handle form submission
    console.log(data);
    props.closeDrawer();
  });

  const toggleDrawer = () => {
    props.closeDrawer();
  };
  
  

  return (
    <Drawer anchor="right" open={props.isOpen} onClose={toggleDrawer}>
      <div className="container">
        <div className="drawer-wrapper layout-width-900px">
          <Row className="drawer-heading">
            <Col>
              <div className="header-wrapper left">
                <h3>Send for Approval</h3>
              </div>
              <div onClick={toggleDrawer} className="close-button right"></div>
            </Col>
          </Row>

          {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}

          { props.type === 'RM' && <RMCompareTable
                            // checkCostingSelected={checkCostingSelected}
                            selectedRows={props.selectedRows}
                            // uniqueShouldCostingId={uniqueShouldCostingId}
                        />}
                        { props.type === 'BoughtOutPart' && <BOPCompareTable
                            // checkCostingSelected={checkCostingSelected}
                            selectedRows={props.selectedRows}
                            // uniqueShouldCostingId={uniqueShouldCostingId}
                            // quotationId={data?.QuotationId}
                        />}
        </div>
      </div>
    </Drawer>
  );
};

export default RfqMasterApprovalDrawer;