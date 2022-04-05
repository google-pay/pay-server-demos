/*
 * Copyright 2021 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const stripJsonComments = require('strip-json-comments');
const fs = require('fs');
const path = require('path');

// Wraps each of the keys in config.json with a check for the value stored in
// an environment variable. The names of the enviroment variables are the full
// paths of keys translated into uppercase with underscores, for example:
// braintree.clientConfig.braintree:apiVersion becomes BRAINTREE_CLIENT_CONFIG_BRAINTREE_API_VERSION
function configOrEnvVars(config, path) {
  Object.keys(config).forEach(k => {
    const thisPath =
      (path ? path + '_' : '') +
      k
        .replace(/[A-Z]/g, s => '_' + s.toLowerCase())
        .replace(/[^\w]/g, '_')
        .toUpperCase();
    const type = typeof config[k];
    config[k] = type === 'object' ? configOrEnvVars(config[k], thisPath) : config[k] || process.env[thisPath];
    
    if(config[k] === undefined) {
      // variable not define in config.json or as ENV variable
      throw new Error(k + " is NOT set");
    }
    if (typeof config[k] != type) {
      config[k] = JSON.parse(config[k]);
    }
  });
  return config;
}

var config = undefined;

// check config-test.json
const configTestPath = path.resolve(__dirname, 'config-test.json');
if(fs.existsSync(configTestPath)) {
  config = JSON.parse(stripJsonComments(fs.readFileSync(configTestPath, 'utf8')));
} else {
  // fallback to config.json
  const configPath = path.resolve(__dirname, 'config.json');
  config = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf8')));  
}

module.exports = configOrEnvVars(config);
