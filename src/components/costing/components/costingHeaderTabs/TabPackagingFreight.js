import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, saveCostingSurfaceTreatmentTab } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, } from '../../../../helper';
import PackageAndFreight from '../CostingHeadCosts/PackageAndFreight';

function TabPackagingFreight(props) {

  const { handleSubmit, watch, reset } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [tabData, setTabData] = useState([]);
  const [surfaceTotal, setSurfaceTotal] = useState('');
  const [transportationTotal, setTransportationTotal] = useState('');
  const [netSurfaceTreatmentCost, setNetSurfaceTreatmentCost] = useState('');

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      // dispatch(getSurfaceTreatmentTabData(data, (res) => {
      //   if (res && res.data && res.data.Result) {
      //     let Data = res.data.Data;
      //     setTabData(Data.CostingPartDetails)
      //   }
      // }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let topHeaderData = {
      NetSurfaceTreatmentCost: surfaceTotal + transportationTotal,
    }
    //props.setHeaderCost(topHeaderData)
  }, [tabData]);

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method setSurfaceCost
  * @description SET SURFACE TREATMENT COST
  */
  const setSurfaceCost = (surfaceGrid, index) => {
    let tempObj = tabData[index];
    let NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(tempObj.TransporationCost)

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          //GrandTotalCost: tempObj.GrandTotalCost + NetSurfaceTreatmentCost,
          NetSurfaceTreatmentCost: NetSurfaceTreatmentCost,
          SurfaceTreatmentCost: surfaceCost(surfaceGrid),
          SurfaceTreatmentZBCDetails: surfaceGrid
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method surfaceCost
  * @description GET SURFACE TREATMENT COST
  */
  const surfaceCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost);
    }, 0)
    setSurfaceTotal(cost)
    return cost;
  }

  /**
  * @method setTransportationCost
  * @description SET TRANSPORTATION COST
  */
  const setTransportationCost = (transportationObj, index) => {
    let tempObj = tabData[index];
    let NetSurfaceTreatmentCost = checkForNull(tempObj.SurfaceTreatmentCost) + checkForNull(transportationObj.TransporationCost)
    setTransportationTotal(checkForNull(transportationObj.TransporationCost))

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          //GrandTotalCost: tempObj.GrandTotalCost + NetSurfaceTreatmentCost,
          NetSurfaceTreatmentCost: NetSurfaceTreatmentCost,
          TransporationCost: transportationObj.TransporationCost,
          TransporationZBCDetails: transportationObj,
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      NetRawMaterialsCost: '',
      NetBoughtOutPartCost: '',
      NetConversionCost: '',
      NetOperationCost: '',
      NetProcessCost: '',
      NetToolsCost: '',
      NetTotalRMBOPCC: '',
      NetSurfaceTreatmentCost: 0,
      NetOverheadAndProfitCost: 0,
      NetPackagingAndFreight: 0,
      NetToolCost: 0,
      DiscountsAndOtherCost: 0,
      TotalCost: '',
      NetPOPrice: '',
      LoggedInUserId: '',
      CostingId: costData.CostingId,
      CostingNumber: costData.CostingNumber,
      ShareOfBusinessPercent: costData.ShareOfBusinessPercent,
      IsIncludeSurfaceTreatmentWithOverheadAndProfit: '',
      CostingPartDetails: tabData,
    }

    dispatch(saveCostingSurfaceTreatmentTab(data, res => {
      console.log('saveCostingSurfaceTreatmentTab: ', res);
    }))

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {


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
                        <th style={{ width: '100px' }}>{`Net Packaging Cost`}</th>
                        <th style={{ width: '150px' }}>{`Net Freight Cost`}</th>
                      </tr>
                    </thead>
                    <tbody >
                      {
                        // tabData && tabData.map((item, index) => {
                        //   return (
                        //     < >
                        //       <tr key={index} onClick={() => toggle(index)}>
                        //         <td>{item.PartName}</td>
                        //         <td>{item.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.SurfaceTreatmentCost, 2) : 0}</td>
                        //         <td>{item.TransporationCost !== null ? checkForDecimalAndNull(item.TransporationCost, 2) : 0}</td>
                        //       </tr>
                        //       {item.IsOpen &&
                        <tr>
                          <td colSpan={4}>
                            <div>
                              <PackageAndFreight
                              //index={index}
                              //surfaceData={item.SurfaceTreatmentZBCDetails}
                              //transportationData={item.TransporationZBCDetails}
                              //setSurfaceCost={setSurfaceCost}
                              //setTransportationCost={setTransportationCost}
                              />
                            </div>
                          </td>
                        </tr>
                        //       }
                        //     </>
                        //   )
                        // })
                      }

                    </tbody>
                  </Table>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}>
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
                    </button>
                  </div>
                </Row>

              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};

export default TabPackagingFreight;