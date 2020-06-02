import React from "react";
import MetisMenu from 'react-metismenu';
import "./Breadcrumb.scss";

function Breadcrumb() {
	return <div className="breadcrumbs fixed-top">
		<div className="container-fluid">
			<div className="row">
				<div className="col-12">
					<div className="bread-inner">
						<ul className="bread-list d-inline-flex">
							<li><a href="index.html">Master</a></li>
							<li><a href="index.html">User</a></li>
							<li className="active"><a href="#">User Management</a></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
}

export default Breadcrumb;