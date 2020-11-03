import React, { useState, useEffect, useCallback, } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, Collapse, CardBody, Card } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'

function TabRMCC(props) {
  const { costData } = props;
  const { register, handleSubmit, watch, control, reset, errors } = useForm();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);


  /**
  * @method netRMCost
  * @description GET RM COST
  */
  const netRMCost = () => {
    return 0;
  }

  /**
  * @method netBOPCost
  * @description GET BOP COST
  */
  const netBOPCost = () => {
    return 0;
  }

  /**
  * @method netConversionCost
  * @description GET CONVERSION COST
  */
  const netConversionCost = () => {
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
                      <tr onClick={toggle}>
                        <td>{costData.PartNumber}</td>
                        <td>{costData.PartNumber}</td>
                        <td>{netRMCost()}</td>
                        <td>{netBOPCost()}</td>
                        <td>{netConversionCost()}</td>
                        <td>{1}</td>
                        <td>{netTotalCost()}</td>
                      </tr>
                      {isOpen &&
                        <tr>
                          <td colSpan={7}>
                            <div>
                              <PartCompoment />
                            </div>
                          </td>
                        </tr>}
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