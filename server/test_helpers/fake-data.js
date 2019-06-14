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
import MarcRecord from 'marc-record-js';

export const FAKE_RECORD = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '003    aaabbb',
  '100    ‡aTest Author',
  '245 0  ‡aSome content',
  '245 0  ‡aTest Title‡bTest field‡cTest content'
].join('\n'));

export const FAKE_RECORD_2 = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '003    aaabbb',
  '100    ‡aTest Author',
  '245 0  ‡aFake_record_2',
  '245 0  ‡aTest Title‡bTest field‡cTest content'
].join('\n'));

export const FAKE_DELETED_RECORD = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '003    aaabbb',
  '100    ‡aTest Author',
  '245 0  ‡aSome content',
  '245 0  ‡aTest Title‡bTest field‡cTest content',
  'STA    ‡aDELETED'
].join('\n'));

export const FAKE_RECORD_SID_LOW = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author',
  'SID    ‡btest‡c111',
  'SID    ‡btest-2‡c114',
  'LOW    ‡aTEST'
].join('\n'));

export const FAKE_RECORD_2_LOW = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author',
  'LOW    ‡aTEST',
  'LOW    ‡aTEST-2',
].join('\n'));


export const FAKE_RECORD_FCC_SID = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author',
  'SID    ‡btest‡cFCC131',
  'SID    ‡btest-2‡c114'
].join('\n'));

export const FAKE_RECORD_FOR_CLEANUP = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author‡9TEST <KEEP>‡9TEST-2 <KEEP>',
  '245    ‡aSome content‡9TEST <DROP>',
  '300    ‡aSub-A‡5TEST',
  '301    ‡aSub-A‡5TEST‡5TEST-2',
  '302    ‡aSub-A‡5TEST-2',
  'SID    ‡btest‡cFCC131',
  'SID    ‡btest-2‡c114'
].join('\n'));

export const FAKE_RECORD_ONLY_LOW_TEST = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author‡9TEST <KEEP>‡9TEST-2 <KEEP>',
  '245    ‡aSome content‡9TEST <DROP>',
  '300    ‡aSub-A‡5TEST',
  '301    ‡aSub-A‡5TEST‡5TEST-2',
  'SID    ‡btest‡cFCC131',
  'SID    ‡btest-2‡c114',
  'LOW    ‡aTEST'
].join('\n'));

export const FAKE_CYRILLIC_RECORD = MarcRecord.fromString(`LDR    01731cam a22002417i 4500
001    002686913
005    20050825143756.0
008    050712s2005    ru      r     000 u rus  
020    ‡a5-94617-054-6 (в обл.)
040    ‡aRuMoRKP‡brus‡ercr‡dRuMoRGB
041 0  ‡arus
044    ‡aru
080    ‡a341
084    ‡aХ620.5,0‡2rubbk
100 1  ‡aНавальный, Сергей Викторович
245 00 ‡aЭлекторально-правовая культура: генезис и эволюция‡cС. В. Навальный ; Федер. агентство по сел. хоз-ву, Краснояр. гос. аграр. ун-т
260    ‡aКрасноярск‡bКраснояр. гос. аграр. ун-т‡c2005
300    ‡a326 с.‡c21 см
520    ‡aДается обоснование особого правового явления - электорально-правовой культуры - через призму ее развития в историко-правовом пространстве и выходом на современные демократические ценности. Для преподавателей курса теории государства и права.
504    ‡aБиблиогр.: с. 320-326
650  7 ‡aГосударство и право. Юридические науки -- Конституционное право -- Российская Федерация -- Избирательная система‡2rubbk
852    ‡a2005120263‡bFB‡cBOOK‡d90‡e20050801‡f20050905‡gGNP01‡i4‡j1 05-18/199‡o292743‡r90.00‡1ФБ Осн. хран.
852    ‡a2005120291‡bFB‡cBOOK‡d90‡e20050801‡f20050905‡gGNP01‡i4‡j1 05-18/200‡o292743‡r90.00‡1ФБ Осн. хран.`);

export const melindaClientUnableParseResponse = {
  messages:[], 
  errors:[
    {code:-1, message: 'melinda-api-client unable to parse: Fake update failure reason'}
  ], 
  triggers:[], 
  warnings:[]
};
