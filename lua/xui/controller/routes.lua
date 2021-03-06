--[[
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
]]

content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

local block_prefix = config.block_path .. "/blocks-"

get('/', function(params)
	n, routes = xdb.find_all("routes")
	if (n > 0)	then
		return routes
	else
		return "[]"
	end
end)

get('/:id', function(params)
	route = xdb.find("routes", params.id)
	if route then
		return route
	else
		return 404
	end
end)

post('/', function(params)
	print(serialize(params))

	if params.request.dest_type == 'FS_DEST_GATEWAY' then
		gw = xdb.find("gateways", params.request.dest_uuid)
		params.request.body = gw.name
	elseif params.request.dest_type == 'IVRBLOCK' then
		block = xdb.find("blocks", params.request.dest_uuid)
		params.request.body = block.name
	end

	route = xdb.create_return_object('routes', params.request)

	if route then
		return route
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	if params.request.dest_type == 'FS_DEST_GATEWAY' then
		gw = xdb.find("gateways", params.request.dest_uuid)
		params.request.body = gw.name
	elseif params.request.dest_type == 'FS_DEST_IVRBLOCK' then
		block = xdb.find("blocks", params.request.dest_uuid)
		params.request.body = block.name
	elseif params.request.dest_type == 'FS_DEST_CONFERENCE' then
		room = xdb.find("conference_rooms", params.request.dest_uuid)
		params.request.body = room.nbr
	end

	ret = xdb.update("routes", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("routes", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
