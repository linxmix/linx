// i think this came from ember-mocha addon...
import Ember from 'ember';
import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

setResolver(resolver);
