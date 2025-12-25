# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { addContact, getUserById, createMessage, listConversations } from '@dataconnect/generated';


// Operation AddContact:  For variables, look at type AddContactVars in ../index.d.ts
const { data } = await AddContact(dataConnect, addContactVars);

// Operation GetUserById:  For variables, look at type GetUserByIdVars in ../index.d.ts
const { data } = await GetUserById(dataConnect, getUserByIdVars);

// Operation CreateMessage:  For variables, look at type CreateMessageVars in ../index.d.ts
const { data } = await CreateMessage(dataConnect, createMessageVars);

// Operation ListConversations: 
const { data } = await ListConversations(dataConnect);


```