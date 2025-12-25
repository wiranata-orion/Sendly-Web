import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddContactData {
  contact_insert: Contact_Key;
}

export interface AddContactVariables {
  requesterId: UUIDString;
  addresseeId: UUIDString;
  status: string;
}

export interface Contact_Key {
  requesterId: UUIDString;
  addresseeId: UUIDString;
  __typename?: 'Contact_Key';
}

export interface ConversationParticipant_Key {
  conversationId: UUIDString;
  userId: UUIDString;
  __typename?: 'ConversationParticipant_Key';
}

export interface Conversation_Key {
  id: UUIDString;
  __typename?: 'Conversation_Key';
}

export interface CreateMessageData {
  message_insert: Message_Key;
}

export interface CreateMessageVariables {
  recipientId: UUIDString;
  senderId: UUIDString;
  content: string;
  sentAt: TimestampString;
}

export interface GetUserByIdData {
  user?: {
    id: UUIDString;
    username: string;
    createdAt: TimestampString;
    lastActiveAt?: TimestampString | null;
  } & User_Key;
}

export interface GetUserByIdVariables {
  id: UUIDString;
}

export interface ListConversationsData {
  conversations: ({
    id: UUIDString;
    name?: string | null;
    createdAt: TimestampString;
    lastMessageAt?: TimestampString | null;
  } & Conversation_Key)[];
}

export interface Message_Key {
  id: UUIDString;
  __typename?: 'Message_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface AddContactRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddContactVariables): MutationRef<AddContactData, AddContactVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddContactVariables): MutationRef<AddContactData, AddContactVariables>;
  operationName: string;
}
export const addContactRef: AddContactRef;

export function addContact(vars: AddContactVariables): MutationPromise<AddContactData, AddContactVariables>;
export function addContact(dc: DataConnect, vars: AddContactVariables): MutationPromise<AddContactData, AddContactVariables>;

interface GetUserByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  operationName: string;
}
export const getUserByIdRef: GetUserByIdRef;

export function getUserById(vars: GetUserByIdVariables): QueryPromise<GetUserByIdData, GetUserByIdVariables>;
export function getUserById(dc: DataConnect, vars: GetUserByIdVariables): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface CreateMessageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMessageVariables): MutationRef<CreateMessageData, CreateMessageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMessageVariables): MutationRef<CreateMessageData, CreateMessageVariables>;
  operationName: string;
}
export const createMessageRef: CreateMessageRef;

export function createMessage(vars: CreateMessageVariables): MutationPromise<CreateMessageData, CreateMessageVariables>;
export function createMessage(dc: DataConnect, vars: CreateMessageVariables): MutationPromise<CreateMessageData, CreateMessageVariables>;

interface ListConversationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListConversationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListConversationsData, undefined>;
  operationName: string;
}
export const listConversationsRef: ListConversationsRef;

export function listConversations(): QueryPromise<ListConversationsData, undefined>;
export function listConversations(dc: DataConnect): QueryPromise<ListConversationsData, undefined>;

