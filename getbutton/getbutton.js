/**
 * Copyright 2018 OPEN-EYES S.r.l.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var PosixMQ = require('posix-mq');

module.exports = function (RED) {
	"use strict";

	function GuiGetButton(config) {
		RED.nodes.createNode(this,config);
		this.msgname = config.msgname;
		var posixmq = new PosixMQ();
		var node = this;
		var msg;
		var n;
		var send = false;
		var PosixMQ_name = "/gui_event";
		var PosixMQ_maxmsg = 10;
        var PosixMQ_msgsize = 256;

        node.status({fill: "red", shape: "dot", text: PosixMQ_name});

        try{
		    posixmq.open({ name: PosixMQ_name, create: true, mode: '0777', maxmsgs: PosixMQ_maxmsg, msgsize: PosixMQ_msgsize });
            node.status({fill: "green", shape: "dot", text: PosixMQ_name});
        }
        catch(err){
            node.status({fill: "red", shape: "dot", text: PosixMQ_name});
            console.log(err);
        }
        //node.warn("the " + node.msgname.toString() + " message queue is open");

		posixmq.on('messages', function() {
			var str = "";
			var readbuf = new Buffer(posixmq.msgsize);
			var n;

			//node.warn("message IN queue" + posixmq.msgsize);

			while ((n = posixmq.shift(readbuf)) !== false){
				str = readbuf.toString('utf8', 0, n);
				node.send({payload: str});
			}
		});

		node.on('close', function() {
			posixmq.unlink();
			posixmq.close();
			node.status({fill: "red", shape: "dot", text: node.msgname.toString()});
		});
	}

	RED.nodes.registerType("get-button", GuiGetButton);
}
