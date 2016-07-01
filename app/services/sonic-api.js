import Ember from 'ember';
const { get } = Ember;

import _ from 'npm:underscore';
import { task } from 'ember-concurrency';
import XMLtoJS from 'npm:xml2js';
const { parseString } = XMLtoJS;

import ENV from 'linx/config/environment';
const accessId = ENV.SONIC_API_ACCESS_ID;

// Sonic API service (https://www.sonicapi.com/docs)
export default Ember.Service.extend({
  baseUrl: 'https://api.sonicapi.com',

  baseParams: {
    access_id: accessId,
    blocking: true,
  },

  analyzeTempoTask: task(function * (streamUrl) {
    if (Ember.isEmpty(streamUrl)) {
      return console.warn('cannot SonicApiService.analyzeTempoTask without valid streamUrl');
    }

    const params = _.extend({
      input_file: streamUrl
    }, this.get('baseParams'));

    const url = `${this.get('baseUrl')}/analyze/tempo?${Ember.$.param(params)}`;

    return yield new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url,
        type: 'post',
        data: params,
        dataType: 'xml'
      }).then((response) => {
        parseString(cleanXmlResponse(response), (error, json = {}) => {
          error && reject(error);

          // XML parses weirdly with $, convert to reasonable object
          const result = get(json, 'response.auftakt_result.0');
          resolve({
            meta: get(result, '$'),
            tick_marks: (get(result, 'click_marks.0.click') || []).mapBy('$'),
          });
        });
      }, reject);
    });
  }),
});

// clean XML response of defunkt windows characters
// http://stackoverflow.com/questions/34783452/cannot-parse-xml-error-non-whitespace-before-first-tag-line-0-column-1-cha
function cleanXmlResponse(xmlDom) {
  const xmlString = getXmlAsString(xmlDom) || '';
  return xmlString.replace('\ufeff', '');
}

function getXmlAsString(xmlDom) {
  return (typeof window.XMLSerializer !== 'undefined') ?
    (new window.XMLSerializer()).serializeToString(xmlDom) :
    xmlDom.xml;
}
