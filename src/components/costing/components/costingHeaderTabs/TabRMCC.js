import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import { getRMCCTabData } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';

function TabRMCC(props) {

  const { register, handleSubmit, watch, reset } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [tabData, setTabData] = useState([]);
  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      dispatch(getRMCCTabData(data, (res) => {
        let Data = res.data.Data;
        setTabData(Data.CostingBaseGridHeaderDetails)
      }))
    }
  }, [costData]);

  const toggle = () => setIsOpen(!isOpen);


  /**
  * @method netRMCost
  * @description GET RM COST
  */
  const netRMCost = (rmData) => {
    return 0;
  }

  /**
  * @method netBOPCost
  * @description GET BOP COST
  */
  const netBOPCost = (bopData) => {
    return 0;
  }

  /**
  * @method netConversionCost
  * @description GET CONVERSION COST
  */
  const netConversionCost = (ccData) => {
    return 0;
  }

  /**
  * @method netTotalCost
  * @description GET TOTAL COST
  */
  const netTotalCost = () => {
    return netRMCost() + netBOPCost() + netConversionCost();
  }


  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    console.log('values >>>', values);
  }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>
              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Table className="table" size="sm" >
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>{``}</th>
                        <th style={{ width: '100px' }}>{`Type`}</th>
                        <th style={{ width: '150px' }}>{`RM Cost`}</th>
                        <th style={{ width: '150px' }}>{`BOP`}</th>
                        <th style={{ width: '200px' }}>{`Conversion Cost`}</th>
                        <th style={{ width: '200px' }}>{`Quantity`}</th>
                        <th style={{ width: '200px' }}>{`RM + CC Cost/Part`}</th>
                      </tr>
                    </thead>
                    <tbody >
                      {
                        tabData && tabData.map((item, index) => {
                          return (
                            < >
                              <tr key={index} onClick={toggle}>
                                <td>{item.PartNumber}</td>
                                <td>{item.Type}</td>
                                <td>{netRMCost(item.CostingRawMaterialsCost)}</td>
                                <td>{netBOPCost(item.CostingBoughtOutPartCost)}</td>
                                <td>{netConversionCost(item.CostingConversionCostResponse)}</td>
                                <td>{item.Quantity}</td>
                                <td>{netTotalCost(item)}</td>
                              </tr>
                              <tr>
                                <td colSpan={7}>
                                  <div>
                                    <PartCompoment
                                      rmData={item.CostingRawMaterialsCost}
                                      bopData={item.CostingBoughtOutPartCost}
                                      ccData={item.CostingConversionCostResponse}
                                      costData={costData}
                                    />
                                  </div>
                                </td>
                              </tr>
                            </>
                          )
                        })
                      }

                    </tbody>
                  </Table>
                </Row>


                <Row>
                  <Col md="12">

                  </Col>
                </Row>

              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};


export default TabRMCC;