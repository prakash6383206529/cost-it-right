import React from "react";
import MetisMenu from 'react-metismenu';
import "./LeftMenu.scss";

function Leftmenu() {
	const content = [
		{
			label: 'Plant',
			to: '#a-link',
		},
		{
			icon: 'icon-class-name',
			label: 'Fuel User',
		}
	];

	return <div className="left-side-menu">
		<div className="h-100 menuitem-active">
			<MetisMenu content={content}
				iconNameStateVisible="minus"
				iconNameStateHidden="plus" />
		</div>
	</div>
}

export default Leftmenu;