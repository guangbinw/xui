/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import verto from './verto/verto';
import { xFetchJSON } from './libs/xtools';


class ModulePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {edit: false, rows:[]};

		// This binding is necessary to make `this` work in the callback
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleFSEvent = this.handleFSEvent.bind(this);
	}

	handleToggleParam(data) {
		const _this = this;

		xFetchJSON( "/api/modules/" + data, {
			method: "PUT",
			body: JSON.stringify({action: "toggle"})
		}).then((param) => {
			console.log("success!!!!", param);
			const rows = _this.state.rows.map(function(p) {
				if (p.id == data) {
					p.disabled = param.disabled;
				}
				return p;
			});
			_this.state.rows = rows;
			_this.setState({rows: _this.state.rows});
		}).catch((msg) => {
			console.error("toggle params", msg);
		});
	}

	handleFSEvent(v, e) {
		console.log("FSevent:", e);
		let loaded = false;

		if (e.eventChannel == "FSevent.module_load") {
			loaded = true;
		} else if (e.eventChannel == "FSevent.module_unload") {
			loaded = false;
		}

		let module = e.data.key;

		let rows = this.state.rows.map(function(row) {
			if (row.k == e.data.key) {
				row.loaded = loaded;
			}
			return row;
		});

		this.setState({rows: rows});
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.module_load");
		verto.unsubscribe("FSevent.module_unload");
	}

	componentDidMount() {
		var _this = this;


		verto.subscribe("FSevent.module_load", {handler: this.handleFSEvent});
		verto.subscribe("FSevent.module_unload", {handler: this.handleFSEvent});

		xFetchJSON("/api/modules/").then((data) => {
			console.log(data);
			_this.setState({rows: data});

			verto.fsAPI("show", "modules as json", function(ret) {
				var msg = JSON.parse(ret.message);
				let modules = {};

				console.log(msg);

				// filter uniq keys
				msg.rows.forEach(function(item) {
					modules[item.ikey] = 1;
				});


				console.log(modules);

				let rows = data.map(function(row) {
					if (modules[row.k] == 1) {
						row.loaded = true;
					}
					return row;
				})

				_this.setState({rows: rows});
			});
		}).catch((msg) => {
			console.log("get module ERR");
		});
	}

	handleSort(field){
		const rows = this.state.rows;
		var n = 1;

		if (this.state.order == 'ASC') {
			this.state.order = 'DSC';
			n = -1;
		} else {
			this.state.order = 'ASC';
		}

		rows.sort(function(a,b) {
			return a[field].toUpperCase() < b[field].toUpperCase() ? -1 * n : 1 * n;
		});

		this.setState({rows: rows});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);
		var k = e.target.getAttribute("data-k");

		if (data == "load") {
			verto.fsAPI("load", k);
		} else if (data == "unload") {
			verto.fsAPI("unload", k);
		} else if (data == "reload") {
			verto.fsAPI("reload", k);
		}
	}


	render() {
		const _this = this;
		let save_btn = "";
		let err_msg = "";

		var rows = _this.state.rows.map(function(row) {
				const enabled_style = dbfalse(row.disabled) ? "success" : "default";
				const loaded_class = row.loaded ? null : "disabled";

				return <tr key={row.id} className={loaded_class}>
					<td>{row.k}</td>
					<td>
						<Button onClick={() => _this.handleToggleParam(row.id)} bsStyle={enabled_style}>
							{dbfalse(row.disabled) ? T.translate("Yes") : T.translate("No")}
						</Button>
					</td>
					<td>
						<T.a onClick={_this.handleControlClick} data-k={row.k} data="load" text="Load" className="cursor-hand"/> |&nbsp;
						<T.a onClick={_this.handleControlClick} data-k={row.k} data="unload" text="Unload" className="cursor-hand"/> |&nbsp;
						<T.a onClick={_this.handleControlClick} data-k={row.k} data="reload" text="Reload" className="cursor-hand"/> |&nbsp;
						<span>{row.class_name}</span>
					</td>
				</tr>
			});

		return <div>
			<h2><T.span text="Modules"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th onClick={() => this.handleSort("k")}><T.span text="Name" /></th>
					<th onClick={() => this.handleSort("disabled")}><T.span text="Enabled" /></th>
					<th><T.span text="Control"/></th>
				</tr>
				{rows}
				</tbody>
			</table>
		</div>
	}
}

export {ModulePage};
