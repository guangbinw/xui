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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools'

class NewGroup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var group = form2json('#newGroupForm');
		console.log("group", group);

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}
		xFetchJSON("/api/groups", {
			method: "POST",
			body: JSON.stringify(group)
		}).then((obj) => {
			group.id = obj.id;
			_this.props.handleNewUserAdded(group);
		}).catch((msg) => {
			console.error("route", msg);
			_this.setState({errmsg: '' + msg + ''});
		}); 
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewUserAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Group" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newGroupForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" /></Col>
				</FormGroup>
				
				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="realm" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class GroupPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: '', group: {}, edit: false, permissions: []};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handlePermissions = this.handlePermissions.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var group = form2json('#newGroupForm');
		console.log("group", group);

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/groups/" + group.id, {
			method: "PUT",
			body: JSON.stringify(group)
		}).then(() => {
			_this.setState({group: group, errmsg: {key: "Saved at", time: Date()}});
		}).catch(() => {
			console.error("route", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handlePermissions(e) {
		var group_id = this.state.group.id;
		var permission_id = e.target.value;
		if (e.target.checked) {
			var gtype = "POST";
		} else {
			var gtype = "DELETE";
		}
		xFetchJSON("/api/permissions", {
			method: gtype,
			body: '{"permission_id":"'+permission_id+'","group_id":"'+group_id+'"}'
		}).then((data) => {
			console.error("www", data);
		}).catch((msg) => {
			console.error("err", msg);
		});
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/groups/" + this.props.params.id)
			.then((data) => {
				console.log("group", data);
				_this.setState({group: data});
			}).catch((e) => {
				console.log("get groups ERR");
			});

		xFetchJSON("/api/permissions/" + this.props.params.id)
			.then((data) => {
				console.log("permissions", data);
				_this.setState({permissions: data});
			}).catch((e) => {
				console.log("get permissions ERR");
			});
	}

	render() {
		const group = this.state.group;
		let save_btn = "";
		let err_msg = "";

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
			if (this.state.errmsg) {
				err_msg  = <Button><T.span text={this.state.errmsg} className="danger"/></Button>
			}
		}

		var permissions = this.state.permissions.map(function(row) {
			return <Checkbox key="row" name="permissions" defaultChecked={row.checkshow} value={row.id}><T.span text="action:"/><T.span text={row.action}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="type:"/><T.span text={row.method}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="param:"/><T.span text={row.param}/></Checkbox>
		})
		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Groups"/></h1>
			<hr/>

			<Form horizontal id="newGroupForm">
				<input type="hidden" name="id" defaultValue={group.id}/>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={group.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="realm" defaultValue={group.realm}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={group.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

			<br/>
				<FormGroup onChange={this.handlePermissions}>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Permissions"/></Col>
					<Col sm={10}>{permissions}</Col>
				</FormGroup>
			
		</div>
	}
}

class GroupsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false, formShow1: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		} else if (data == "import") {
			this.setState({ formShow1: true});
		};
	}

	handleDelete(id) {
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/groups/" + id, {
				method: "DELETE"
			}).then(() => {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			})
			.catch((msg) => {
				console.error("route", msg);
			});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/groups",{})
			.then((data) => {
				console.log("groups", data);
				_this.setState({rows: data});
			}).catch((e) => {
				console.log("get groups ERR");
			});
	}

	handleFSEvent(v, e) {
	}

	handleUserAdded(user) {
		var rows = this.state.rows;
		rows.unshift(user);
		this.setState({rows: rows, formShow: false});
	}

	handleUserAdded1(user) {
		var rows = this.state.rows;
		rows.unshift(user);
		this.setState({rows: rows, formShow1: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let formClose1 = () => this.setState({ formShow1: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/groups/${row.id}`}>{row.name}</Link></td>
					<td>{row.realm}</td>
					<td>{row.description}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
				<Button onClick={() => this.handleControlClick("new")}>
					<i className="fa fa-plus" aria-hidden="true" onClick={() => this.handleControlClick("new")}></i>&nbsp;
					<T.span onClick={() => this.handleControlClick("new")} text="New" />
				</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Groups"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Realm"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewGroup show={this.state.formShow} onHide={formClose} handleNewUserAdded={this.handleUserAdded.bind(this)}/>
		</div>
	}
}

export {GroupsPage, GroupPage};
