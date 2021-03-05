import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getBOPDrawerDataList, getBOPDrawerVBCDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { ZBC } from '../../../../config/constants';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';

function AddBOP(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(props.Ids);
  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', selectedRowData)
  };

  useEffect(() => {
    if (costData.VendorType === ZBC) {

      const data = {
        PlantId: costData.PlantId,
        CostingId: costData.CostingId,
      }
      dispatch(getBOPDrawerDataList(data, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setTableDataList(Data)
        } else if (res && res.response && res.response.status === 412) {
          setTableDataList([])
        } else {
          setTableDataList([])
        }
      }))

    } else {

      const data = {
        VendorId: costData.VendorId,
        VendorPlantId: costData.VendorPlantId,
        CostingId: costData.CostingId,
      }
      dispatch(getBOPDrawerVBCDataList(data, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setTableDataList(Data)
        } else if (res && res.response && res.response.status === 412) {
          setTableDataList([])
        } else {
          setTableDataList([])
        }
      }))

    }
  }, []);


  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
  const renderPaginationShowsTotal = (start, to, total) => {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  const options = {
    clearSearch: true,
    noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    paginationShowsTotal: renderPaginationShowsTotal(),
    paginationSize: 5,
  };

  const onRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      let tempArr = [...selectedRowData, row]
      setSelectedRowData(tempArr)
    } else {
      const BoughtOutPartId = row.BoughtOutPartId;
      let tempArr = selectedRowData && selectedRowData.filter(el => el.BoughtOutPartId !== BoughtOutPartId)
      setSelectedRowData(tempArr)
    }

  }

  const onSelectAll = (isSelected, rows) => {
    if (isSelected) {
      setSelectedRowData(rows)
    } else {
      setSelectedRowData([])
    }
  }

  const selectRowProp = {
    mode: 'checkbox',
    clickToSelect: true,
    unselectable: selectedIds,
    onSelect: onRowSelect,
    onSelectAll: onSelectAll
  };

  const renderNetLandedRate = () => {
    return <>Net Landed Cost <br /> INR/UOM</>
  }

  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedRowData.length === 0) {
      toastr.warning('Please select row.')
      return false;
    }
    toggleDrawer('')
  }
  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  const onSubmit = data => {
    toggleDrawer('')
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'ADD BOP'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row>
              <Col>
                <BootstrapTable
                  data={tableData}
                  striped={false}
                  bordered={false}
                  hover={false}
                  options={options}
                  selectRow={selectRowProp}
                  search
                  multiColumnSearch={true}
                  //exportCSV
                  //ignoreSinglePage
                  //ref={'table'}
                  pagination>
                  <TableHeaderColumn dataField="BoughtOutPartId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="EntryType"  >{'BOP Type'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BoughtOutPartNumber" >{'BOP Part No.'}</TableHeaderColumn>
                  <TableHeaderColumn width={70} columnTitle={true} dataAlign="center" dataField="BoughtOutPartName" >{'BOP Part Name'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BoughtOutPartCategory" >{'BOP Category'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Specification" searchable={false} >{'Specification'}</TableHeaderColumn>
                  {costData && costData.VendorType === ZBC && <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Vendor" >Vendor</TableHeaderColumn>}
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Currency" searchable={false} >Currency</TableHeaderColumn>
                  <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCost" searchable={false} >{renderNetLandedRate()}</TableHeaderColumn>
                </BootstrapTable>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-left bluefooter-butn">
                <button
                  type={'button'}
                  className="submit-button mr5 save-btn"
                  onClick={addRow} >
                  <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'SELECT'}
                </button>

                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                </button>
              </div>
            </Row>

          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddBOP);