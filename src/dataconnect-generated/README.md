# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserById*](#getuserbyid)
  - [*ListConversations*](#listconversations)
- [**Mutations**](#mutations)
  - [*AddContact*](#addcontact)
  - [*CreateMessage*](#createmessage)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserById
You can execute the `GetUserById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserById(vars: GetUserByIdVariables): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface GetUserByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
}
export const getUserByIdRef: GetUserByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserById(dc: DataConnect, vars: GetUserByIdVariables): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface GetUserByIdRef {
  ...
  (dc: DataConnect, vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
}
export const getUserByIdRef: GetUserByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByIdRef:
```typescript
const name = getUserByIdRef.operationName;
console.log(name);
```

### Variables
The `GetUserById` query requires an argument of type `GetUserByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByIdData {
  user?: {
    id: UUIDString;
    username: string;
    createdAt: TimestampString;
    lastActiveAt?: TimestampString | null;
  } & User_Key;
}
```
### Using `GetUserById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserById, GetUserByIdVariables } from '@dataconnect/generated';

// The `GetUserById` query requires an argument of type `GetUserByIdVariables`:
const getUserByIdVars: GetUserByIdVariables = {
  id: ..., 
};

// Call the `getUserById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserById(getUserByIdVars);
// Variables can be defined inline as well.
const { data } = await getUserById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserById(dataConnect, getUserByIdVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserById(getUserByIdVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByIdRef, GetUserByIdVariables } from '@dataconnect/generated';

// The `GetUserById` query requires an argument of type `GetUserByIdVariables`:
const getUserByIdVars: GetUserByIdVariables = {
  id: ..., 
};

// Call the `getUserByIdRef()` function to get a reference to the query.
const ref = getUserByIdRef(getUserByIdVars);
// Variables can be defined inline as well.
const ref = getUserByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByIdRef(dataConnect, getUserByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListConversations
You can execute the `ListConversations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listConversations(): QueryPromise<ListConversationsData, undefined>;

interface ListConversationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListConversationsData, undefined>;
}
export const listConversationsRef: ListConversationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listConversations(dc: DataConnect): QueryPromise<ListConversationsData, undefined>;

interface ListConversationsRef {
  ...
  (dc: DataConnect): QueryRef<ListConversationsData, undefined>;
}
export const listConversationsRef: ListConversationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listConversationsRef:
```typescript
const name = listConversationsRef.operationName;
console.log(name);
```

### Variables
The `ListConversations` query has no variables.
### Return Type
Recall that executing the `ListConversations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListConversationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListConversationsData {
  conversations: ({
    id: UUIDString;
    name?: string | null;
    createdAt: TimestampString;
    lastMessageAt?: TimestampString | null;
  } & Conversation_Key)[];
}
```
### Using `ListConversations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listConversations } from '@dataconnect/generated';


// Call the `listConversations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listConversations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listConversations(dataConnect);

console.log(data.conversations);

// Or, you can use the `Promise` API.
listConversations().then((response) => {
  const data = response.data;
  console.log(data.conversations);
});
```

### Using `ListConversations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listConversationsRef } from '@dataconnect/generated';


// Call the `listConversationsRef()` function to get a reference to the query.
const ref = listConversationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listConversationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.conversations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.conversations);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddContact
You can execute the `AddContact` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addContact(vars: AddContactVariables): MutationPromise<AddContactData, AddContactVariables>;

interface AddContactRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddContactVariables): MutationRef<AddContactData, AddContactVariables>;
}
export const addContactRef: AddContactRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addContact(dc: DataConnect, vars: AddContactVariables): MutationPromise<AddContactData, AddContactVariables>;

interface AddContactRef {
  ...
  (dc: DataConnect, vars: AddContactVariables): MutationRef<AddContactData, AddContactVariables>;
}
export const addContactRef: AddContactRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addContactRef:
```typescript
const name = addContactRef.operationName;
console.log(name);
```

### Variables
The `AddContact` mutation requires an argument of type `AddContactVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddContactVariables {
  requesterId: UUIDString;
  addresseeId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `AddContact` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddContactData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddContactData {
  contact_insert: Contact_Key;
}
```
### Using `AddContact`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addContact, AddContactVariables } from '@dataconnect/generated';

// The `AddContact` mutation requires an argument of type `AddContactVariables`:
const addContactVars: AddContactVariables = {
  requesterId: ..., 
  addresseeId: ..., 
  status: ..., 
};

// Call the `addContact()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addContact(addContactVars);
// Variables can be defined inline as well.
const { data } = await addContact({ requesterId: ..., addresseeId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addContact(dataConnect, addContactVars);

console.log(data.contact_insert);

// Or, you can use the `Promise` API.
addContact(addContactVars).then((response) => {
  const data = response.data;
  console.log(data.contact_insert);
});
```

### Using `AddContact`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addContactRef, AddContactVariables } from '@dataconnect/generated';

// The `AddContact` mutation requires an argument of type `AddContactVariables`:
const addContactVars: AddContactVariables = {
  requesterId: ..., 
  addresseeId: ..., 
  status: ..., 
};

// Call the `addContactRef()` function to get a reference to the mutation.
const ref = addContactRef(addContactVars);
// Variables can be defined inline as well.
const ref = addContactRef({ requesterId: ..., addresseeId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addContactRef(dataConnect, addContactVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.contact_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.contact_insert);
});
```

## CreateMessage
You can execute the `CreateMessage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createMessage(vars: CreateMessageVariables): MutationPromise<CreateMessageData, CreateMessageVariables>;

interface CreateMessageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMessageVariables): MutationRef<CreateMessageData, CreateMessageVariables>;
}
export const createMessageRef: CreateMessageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMessage(dc: DataConnect, vars: CreateMessageVariables): MutationPromise<CreateMessageData, CreateMessageVariables>;

interface CreateMessageRef {
  ...
  (dc: DataConnect, vars: CreateMessageVariables): MutationRef<CreateMessageData, CreateMessageVariables>;
}
export const createMessageRef: CreateMessageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMessageRef:
```typescript
const name = createMessageRef.operationName;
console.log(name);
```

### Variables
The `CreateMessage` mutation requires an argument of type `CreateMessageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMessageVariables {
  recipientId: UUIDString;
  senderId: UUIDString;
  content: string;
  sentAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateMessage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMessageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMessageData {
  message_insert: Message_Key;
}
```
### Using `CreateMessage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMessage, CreateMessageVariables } from '@dataconnect/generated';

// The `CreateMessage` mutation requires an argument of type `CreateMessageVariables`:
const createMessageVars: CreateMessageVariables = {
  recipientId: ..., 
  senderId: ..., 
  content: ..., 
  sentAt: ..., 
};

// Call the `createMessage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMessage(createMessageVars);
// Variables can be defined inline as well.
const { data } = await createMessage({ recipientId: ..., senderId: ..., content: ..., sentAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMessage(dataConnect, createMessageVars);

console.log(data.message_insert);

// Or, you can use the `Promise` API.
createMessage(createMessageVars).then((response) => {
  const data = response.data;
  console.log(data.message_insert);
});
```

### Using `CreateMessage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMessageRef, CreateMessageVariables } from '@dataconnect/generated';

// The `CreateMessage` mutation requires an argument of type `CreateMessageVariables`:
const createMessageVars: CreateMessageVariables = {
  recipientId: ..., 
  senderId: ..., 
  content: ..., 
  sentAt: ..., 
};

// Call the `createMessageRef()` function to get a reference to the mutation.
const ref = createMessageRef(createMessageVars);
// Variables can be defined inline as well.
const ref = createMessageRef({ recipientId: ..., senderId: ..., content: ..., sentAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMessageRef(dataConnect, createMessageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.message_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.message_insert);
});
```

