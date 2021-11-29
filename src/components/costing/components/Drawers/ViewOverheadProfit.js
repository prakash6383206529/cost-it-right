import React, { useState, useEffect } from 'react'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useForm, Controller, useWatch } from 'react-hook-form';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull } from '../../../../helper'
import { useSelector } from 'react-redux'
function ViewOverheadProfit(props) {
  const { overheadData, profitData, rejectAndModelType, iccPaymentData } = props

  const { rejectData, modelType } = rejectAndModelType

  const { register, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const [viewOverheadData, setViewOverheadData] = useState({})
  const [viewProfitData, setViewProfitData] = useState({})
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  useEffect(() => {
    setViewOverheadData(overheadData)
    setViewProfitData(profitData)

  }, [])
  /**
  * @method toggleDrawer
  * @description closing drawer
  */
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper drawer-1500px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"View Overhead & Profit Cost:"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <div className="input-group form-group col-md-4 input-withouticon">
              <TextFieldHookForm
                label="Model Type for Overhead/Profit"
                name={"modeltype"}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                handleChange={() => { }}
                //defaultValue={`${viewRM[0].RMName}`}
                defaultValue={modelType}
                className=""
                customClassName={"withBorder"}
                //errors={errors.ECNNumber}
                disabled={true}
              />
            </div>
            <div
            // className="cr-process-costwrap"
            >
              <Row className="px-3">
                <Col md="12">
                  <div className="left-border">{"Overheads"}</div>
                </Col>
              </Row>
              <Row className="px-3">
                {/* OVERHEAD RENDERING */}
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{`Applicability`}</th>
                        <th>{`Overhead On`}</th>
                        <th>{`Percentage(%)`}</th>
                        <th>{`Cost (Applicability)`}</th>
                        <th>{`Overhead`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewOverheadData && (
                        <>
                          {viewOverheadData.IsOverheadFixedApplicable && (
                            <tr>

                              <td>{`Fixed`}</td>
                              <td>
                                {viewOverheadData.OverheadFixedPercentage ? checkForDecimalAndNull(viewOverheadData.OverheadFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadFixedCost ? checkForDecimalAndNull(viewOverheadData.OverheadFixedCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadFixedTotalCost ? checkForDecimalAndNull(viewOverheadData.OverheadFixedTotalCost.initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadRMApplicable && (
                            <tr>
                              <td>{`RM`}</td>
                              <td>
                                {viewOverheadData.OverheadRMPercentage ? checkForDecimalAndNull(viewOverheadData.OverheadRMPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadRMCost ? checkForDecimalAndNull(viewOverheadData.OverheadRMCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadRMTotalCost ? checkForDecimalAndNull(viewOverheadData.OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadBOPApplicable && (
                            <tr>
                              <td>{`Insert`}</td>
                              <td>
                                {viewOverheadData.OverheadBOPPercentage ? checkForDecimalAndNull(viewOverheadData.OverheadBOPPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadBOPCost ? checkForDecimalAndNull(viewOverheadData.OverheadBOPCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadBOPTotalCost ? checkForDecimalAndNull(viewOverheadData.OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadCCApplicable && (
                            <tr>
                              <td>{`CC`}</td>
                              <td>
                                {viewOverheadData.OverheadCCPercentage ? checkForDecimalAndNull(viewOverheadData.OverheadCCPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCCCost ? checkForDecimalAndNull(viewOverheadData.OverheadCCCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCCTotalCost ? checkForDecimalAndNull(viewOverheadData.OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadCombined && (
                            <tr>
                              <td>{viewOverheadData.OverheadApplicability}</td>
                              <td>
                                {viewOverheadData.OverheadPercentage ? checkForDecimalAndNull(viewOverheadData.OverheadPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCombinedCost ? checkForDecimalAndNull(viewOverheadData.OverheadCombinedCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCombinedTotalCost ? checkForDecimalAndNull(viewOverheadData.OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      {(viewOverheadData.IsOverheadFixedApplicable === null && viewOverheadData.IsOverheadRMApplicable === null && viewOverheadData.IsOverheadBOPApplicable === null && viewOverheadData.IsOverheadCCApplicable === null && viewOverheadData.IsOverheadCombined === null) && (
                        <tr>
                          <td colSpan={12}>
                            <NoContentFound title={EMPTY_DATA} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
                <Col md="12"><hr /></Col>
              </Row>

              <div>
                <Row className="px-3">
                  <Col md="8">
                    <div className="left-border">{"Profits:"}</div>
                  </Col>
                </Row>
                <Row className="px-3">
                  {/*PROFIT RENDERING */}

                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        { }
                        <tr>
                          <th>{`Applicability`}</th>
                          <th>{`Profits (Fixed)`}</th>
                          <th>{`Percentage(%)`}</th>
                          <th>{`Cost (Applicability)`}</th>
                          <th>{`Profit`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewProfitData && (
                          <>
                            {viewProfitData.IsProfitFixedApplicable && (
                              <tr>

                                <td>{`Fixed`}</td>
                                <td>
                                  {viewProfitData.ProfitFixedPercentage ? checkForDecimalAndNull(viewProfitData.ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitFixedCost ? checkForDecimalAndNull(viewProfitData.ProfitFixedCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitFixedTotalCost ? checkForDecimalAndNull(viewProfitData.ProfitFixedTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitRMApplicable && (
                              <tr>
                                <td>{`RM`}</td>
                                <td>
                                  {viewProfitData.ProfitRMPercentage ? checkForDecimalAndNull(viewProfitData.ProfitRMPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitRMCost ? checkForDecimalAndNull(viewProfitData.ProfitRMCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitRMTotalCost ? checkForDecimalAndNull(viewProfitData.ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitBOPApplicable && (
                              <tr>
                                <td>{`Insert`}</td>
                                <td>
                                  {viewProfitData.ProfitBOPPercentage ? checkForDecimalAndNull(viewProfitData.ProfitBOPPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitBOPCost ? checkForDecimalAndNull(viewProfitData.ProfitBOPCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitBOPTotalCost ? checkForDecimalAndNull(viewProfitData.ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitCCApplicable && (
                              <tr>
                                <td>{`CC`}</td>
                                <td>

                                  {viewProfitData.ProfitCCPercentage ? checkForDecimalAndNull(viewProfitData.ProfitCCPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCCCost ? checkForDecimalAndNull(viewProfitData.ProfitCCCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCCTotalCost
                                    ? viewProfitData.ProfitCCTotalCost
                                    : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitCombined && (
                              <tr>
                                <td>{viewProfitData.ProfitApplicability}</td>
                                <td>
                                  {viewProfitData.ProfitPercentage ? checkForDecimalAndNull(viewProfitData.ProfitPercentage, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCombinedCost ? checkForDecimalAndNull(viewProfitData.ProfitCombinedCost, initialConfiguration.NoOfDecimalForPrice) : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCombinedTotalCost
                                    ? viewProfitData.ProfitCombinedTotalCost
                                    : "-"}
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                        {(viewProfitData.IsProfitFixedApplicable === null && viewProfitData.IsProfitRMApplicable === null && viewProfitData.IsProfitBOPApplicable === null && viewProfitData.IsProfitCCApplicable === null && viewProfitData.IsProfitCombined === null) && (
                          <tr>
                            <td colSpan={12}>
                              <NoContentFound title={EMPTY_DATA} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                  <Col md="12"><hr /></Col>
                </Row>
              </div>
              <div>
                <Row className="px-3">
                  <Col md="10">
                    <div className="left-border">{"Rejection:"}</div>
                  </Col>
                </Row>
                <Row className="px-3">
                  {/*REJECTION RENDERING */}

                  <Col md="12">
                    <Table className="table cr-brdr-main " size="sm">
                      <thead>
                        <tr>

                          <th>{`Applicability`}</th>
                          <th>{`Rejection ${rejectData.RejectionApplicability === 'Fixed' ? '' : '(%)'}`}</th>
                          <th>{`Cost (Applicability)`}</th>
                          <th>{`Net Rejection`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          (rejectData.RejectionApplicability === null) ?
                            <tr>
                              <td colSpan={8}>
                                <NoContentFound title={EMPTY_DATA} />
                              </td>
                            </tr> :
                            <tr>

                              <td>{rejectData.RejectionApplicability ? rejectData.RejectionApplicability : '-'}</td>
                              <td>{rejectData.RejectionPercentage ? checkForDecimalAndNull(rejectData.RejectionPercentage, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                              <td>{rejectData.RejectionCost ? checkForDecimalAndNull(rejectData.RejectionCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                              <td>{rejectData.RejectionTotalCost ? checkForDecimalAndNull(rejectData.RejectionTotalCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                            </tr>
                        }
                        {/* {rejectData && (
                          <tr>
                            <td>{rejectData.RejectionApplicability}</td>
                            <td>{rejectData.RejectionPercentage}</td>
                            <td>{rejectData.RejectionCost}</td>
                            <td>{rejectData.RejectionTotalCost}</td>
                          </tr>
                        )} */}
                        {/* {(rejectData.RejectionApplicability === null && rejectData.RejectionPercentage === null && rejectData.RejectionCost === null && rejectData.RejectionTotalCost === null) && (
                          <tr>
                            <td colSpan={8}>
                              <NoContentFound title={CONSTANT.EMPTY_DATA} />
                            </td>
                          </tr>
                        )} */}
                      </tbody>
                    </Table>
                  </Col>
                  <Col md="12"><hr /></Col>
                </Row>
              </div>


              <div>
                <Row className="px-3">
                  <Col md="12">
                    <div className="left-border">{"ICC:"}</div>
                  </Col>
                </Row>
                <Row className="px-3">
                  {/*REJECTION RENDERING */}

                  <Col md="12">
                    <Table className="table cr-brdr-main " size="sm">
                      <thead>
                        <tr>

                          <th>{`Applicability`}</th>
                          <th>{`Interest Rate (%)`}</th>
                          <th>{`Cost (Applicability)`}</th>
                          <th>{`Net ICC`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          (iccPaymentData.ICCApplicabilityDetail.ICCApplicability === null) ?
                            <tr>
                              <td colSpan={8}>
                                <NoContentFound title={EMPTY_DATA} />
                              </td>
                            </tr> :
                            <tr>

                              <td>{iccPaymentData.ICCApplicabilityDetail ? iccPaymentData.ICCApplicabilityDetail.ICCApplicability : '-'}</td>
                              <td>{iccPaymentData.ICCApplicabilityDetail.InterestRate ? checkForDecimalAndNull(iccPaymentData.ICCApplicabilityDetail.InterestRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                              <td>{iccPaymentData.ICCApplicabilityDetail.CostApplicability ? checkForDecimalAndNull(iccPaymentData.ICCApplicabilityDetail.CostApplicability, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                              <td>{iccPaymentData.NetICC ? checkForDecimalAndNull(iccPaymentData.NetICC, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                            </tr>
                        }

                      </tbody>
                    </Table>
                  </Col>
                  <Col md="12"><hr /></Col>
                </Row>
              </div>




              <div>
                <Row className="px-3">
                  <Col md="12">
                    <div className="left-border">{"Payment Terms:"}</div>
                  </Col>
                </Row>
                <Row className="px-3">
                  {/*REJECTION RENDERING */}

                  <Col md="12">
                    <Table className="table cr-brdr-main " size="sm">
                      <thead>
                        <tr>

                          <th>{`Applicability`}</th>
                          <th>{`Repayment Period (No of days)`}</th>
                          <th>{`Interest Rate (%)`}</th>
                          <th>{`Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          (iccPaymentData.PaymentTermDetail.PaymentTermApplicability === null) ?
                            <tr>
                              <td colSpan={8}>
                                <NoContentFound title={EMPTY_DATA} />
                              </td>
                            </tr> :
                            <tr>

                              <td>{iccPaymentData.PaymentTermDetail.PaymentTermApplicability ? iccPaymentData.PaymentTermDetail.PaymentTermApplicability : '-'}</td>
                              <td>{iccPaymentData.PaymentTermDetail.RepaymentPeriod ? checkForDecimalAndNull(iccPaymentData.PaymentTermDetail.RepaymentPeriod, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                              <td>{iccPaymentData.PaymentTermDetail.InterestRate ? checkForDecimalAndNull(iccPaymentData.PaymentTermDetail.InterestRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                              <td>{iccPaymentData.PaymentTermDetail.NetCost ? checkForDecimalAndNull(iccPaymentData.PaymentTermDetail.NetCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                            </tr>
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>




            </div>
          </div>
        </Container>
      </Drawer>
    </>
  );
}

export default React.memo(ViewOverheadProfit)
