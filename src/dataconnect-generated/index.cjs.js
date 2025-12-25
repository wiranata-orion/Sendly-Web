const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'website-platform',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const addContactRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddContact', inputVars);
}
addContactRef.operationName = 'AddContact';
exports.addContactRef = addContactRef;

exports.addContact = function addContact(dcOrVars, vars) {
  return executeMutation(addContactRef(dcOrVars, vars));
};

const getUserByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserById', inputVars);
}
getUserByIdRef.operationName = 'GetUserById';
exports.getUserByIdRef = getUserByIdRef;

exports.getUserById = function getUserById(dcOrVars, vars) {
  return executeQuery(getUserByIdRef(dcOrVars, vars));
};

const createMessageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMessage', inputVars);
}
createMessageRef.operationName = 'CreateMessage';
exports.createMessageRef = createMessageRef;

exports.createMessage = function createMessage(dcOrVars, vars) {
  return executeMutation(createMessageRef(dcOrVars, vars));
};

const listConversationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListConversations');
}
listConversationsRef.operationName = 'ListConversations';
exports.listConversationsRef = listConversationsRef;

exports.listConversations = function listConversations(dc) {
  return executeQuery(listConversationsRef(dc));
};
