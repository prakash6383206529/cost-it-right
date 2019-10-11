import React, { Component } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

// This is the custom csv export component
const ExportCSV = (props) => {
    const handleClick = () => {
        props.onExport();
    };
    return (
        <div className="text-right">
            <button className="btn btn-primary" onClick={handleClick}>Export Data</button>
        </div>
    );
};

export default class Table extends Component {    
      render() {
        const { SearchBar } = Search;
        const options = {
            paginationSize: 5,
            pageStartIndex: 1,
            // alwaysShowAllBtns: true, // Always show next and previous button
            withFirstAndLast: true, // Hide the going to First and Last page button
            // hideSizePerPage: true, // Hide the sizePerPage dropdown always
            hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
            firstPageText: '<<',
            prePageText: '<',
            nextPageText: '>',
            lastPageText: '>>',
            nextPageTitle: 'First page',
            prePageTitle: 'Pre page',
            firstPageTitle: 'Next page',
            lastPageTitle: 'Last page',
            showTotal: true,
            paginationTotalRenderer: null,
            sizePerPageList: [
                {text: '10', value: 10},
                {text: '50', value: 50},
                {text: '100', value: 100},
                {text: 'All', value: this.props.data.length
            }]
          };
        return (
            <div>
                { (this.props.data.length>0 && this.props.columns.length >0) &&<ToolkitProvider
                    bootstrap4                
                    keyField="id"
                    data={ this.props.data }
                    columns={ this.props.columns }
                    exportCSV={{fileName: "AlertHistoryList.csv"}}           
                    search
                >
                {
                    props => (
                    <div>
                        {this.props.showSearch && <SearchBar { ...props.searchProps } />}
                        <BootstrapTable {...props.baseProps} filter={filterFactory()} pagination={paginationFactory(options)} defaultSorted={this.props.defaultSorted} />
                        {this.props.exportCSV && <ExportCSV  {...props.csvProps}/>}
                    </div>
                    )
                }
                </ToolkitProvider>   }                 
            </div>
        )
    }
}
 