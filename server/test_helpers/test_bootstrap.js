/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-ui-commons
*
* melinda-ui-commons program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-ui-commons is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
process.env.REST_API_URL='test-rest-url';
process.env.REST_API_USERNAME='test-rest-username'; //ignore:node_username
process.env.REST_API_PASSWORD='test-rest-password'; //ignore:node_password
process.env.SRU_URL='test-sru-url';
process.env.ALEPH_URL='test-url';
process.env.ALEPH_USER_LIBRARY='test-lib'; //ignore:node_username
process.env.DUPLICATE_DB_URL='test-duplicate-db-url';
process.env.AMQP_HOST='test-amqp-host';
process.env.SMTP_CONNECTION_URL='smtp://test:test@localhost:2525';
process.env.USEMARCON_BIN=process.env.USEMARCON_BIN || '/path/to/bin';
process.env.USEMARCON_CONFIG_PATH=process.env.USEMARCON_BIN || '/tmp';
