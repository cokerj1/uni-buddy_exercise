import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { MessageData } from './message.data';
import { ChatMessageModel, ChatMessageSchema } from './models/message.model';

import { ConfigManagerModule } from '../configuration/configuration-manager.module';
import {getTestConfiguration}  from '../configuration/configuration-manager.utils';

const id = new ObjectID('5fe0cce861c8ea54018385af');
const conversationId = new ObjectID();
const senderId = new ObjectID('5fe0cce861c8ea54018385af');
const sender2Id = new ObjectID('5fe0cce861c8ea54018385aa');
const sender3Id = new ObjectID('5fe0cce861c8ea54018385ab');

class TestMessageData extends MessageData {
  async deleteMany() {
    await this.chatMessageModel.deleteMany();
  }
}

describe('MessageData', () => {
  let messageData: TestMessageData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigManagerModule],
          useFactory: () => {
            const databaseConfig =
              getTestConfiguration().database;
            return {
              uri: databaseConfig.connectionString,
            };
          },
        }),
        MongooseModule.forFeature([
          { name: ChatMessageModel.name, schema: ChatMessageSchema },
        ]),
      ],
      providers: [TestMessageData],
    }).compile();

    messageData = module.get<TestMessageData>(TestMessageData);
  });

  beforeEach(
    async () => {
      messageData.deleteMany();
    }
  );

  afterEach(async () => {
    messageData.deleteMany();
  });

  it('should be defined', () => {
    expect(messageData).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(messageData.create).toBeDefined();
    });

    it('successfully creates a message', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      expect(message).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationId,
          conversation: { id: conversationId.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
        }
      );

    });
  });


  describe('get', () => {
    it('should be defined', () => {
      expect(messageData.getMessage).toBeDefined();
    });

    it('successfully gets a message', async () => {
      const conversationId = new ObjectID();
      const sentMessage = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      const gotMessage = await messageData.getMessage(sentMessage.id.toHexString())

      expect(gotMessage).toMatchObject(sentMessage)
    });

    it('message sent should have tags included', async () => {
      const conversationId = new ObjectID();
      const sentMessage = await messageData.create(
        { conversationId, text: 'Hello world', tags: ['hello','world'] },
        senderId,
      );

      const gotMessage = await messageData.getMessage(sentMessage.id.toHexString())
      expect(gotMessage.tags).toEqual(sentMessage.tags);
    });
  });

  describe('updateTags', () => {
    it('should be defined', () => {
      expect(messageData.updateConversationMessageTags).toBeDefined();
    });
    
    it('successfully updates the tags of a message', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Message with old tags', tags: ['old'] },
        senderId,
      );

      // Make sure that the message starts with the old tags
      expect(message.tags).toEqual(['old']);

      const updatedMessage = await messageData.updateConversationMessageTags(message.id, ['new']);

      // Check if updatedMessage has tags to begin with
      expect(updatedMessage.tags).toBeDefined();

      // Make sure that the message now has the new tags
      expect(updatedMessage.tags).toEqual(['new'])

      // Retrieve the message again to verify the update
      const retrievedMessage = await messageData.getMessage(message.id.toHexString());
      // Make sure that the retrieved message also has the new tags
      expect(retrievedMessage.tags).toContain("new");
      // Make sure that the updatedMessage doesn't have the old tags
      expect(retrievedMessage.tags).not.toContain('old');
    });
  });

  describe('searchMessagesByTag', () => {
    it('should be defined', () => {
      expect(messageData.searchMessagesByTag).toBeDefined();
    });

    // creating messages with and without tags
    it('successfully searches for messages by tags', async () => {
      const conversationId = new ObjectID();
      const message1 = await messageData.create(
        { conversationId, text: 'Message with tags', tags: ['tag1', 'tag2'] },
        senderId,
      );
      const message2 = await messageData.create(
        { conversationId, text: 'Another message with tags', tags: ['tag2', 'tag3'] },
        senderId,
      );
      const message3 = await messageData.create(
        { conversationId, text: 'Message without tags' },
        senderId,
      );

      const searchResult1 = await messageData.searchMessagesByTag('tag1');
      expect(searchResult1).toContainEqual(message1);
      expect(searchResult1).not.toContainEqual(message2);
      expect(searchResult1).not.toContainEqual(message3);

      const searchResult2 = await messageData.searchMessagesByTag('tag2');
      expect(searchResult2).toContainEqual(message1);
      expect(searchResult2).toContainEqual(message2);
      expect(searchResult2).not.toContainEqual(message3);

      const searchResult3 = await messageData.searchMessagesByTag('tag3');
      expect(searchResult3).not.toContainEqual(message1);
      expect(searchResult3).toContainEqual(message2);
      expect(searchResult3).not.toContainEqual(message3);

      const searchResult4 = await messageData.searchMessagesByTag('tag4');
      expect(searchResult4).toHaveLength(0)
    });
  });

  describe('delete', () => {
    it('successfully marks a message as deleted', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Message to delete' },
        senderId,
      );

      // Make sure that it started off as not deleted
      expect(message.deleted).toEqual(false);

      const deletedMessage = await messageData.delete(new ObjectID(message.id));
      expect(deletedMessage.deleted).toEqual(true);

      // And that is it now deleted
      const retrievedMessage = await messageData.getMessage(message.id.toHexString())
      expect(retrievedMessage.deleted).toEqual(true);
    });
  });
});
