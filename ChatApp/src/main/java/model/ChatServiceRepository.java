package com.ChatApp.model;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatServiceRepository extends MongoRepository<Message, String> {

    // Custom query methods can be defined here if needed
    // For example, to find messages by room ID:
    // List<Message> findByRoomid(Integer roomid);

    // Additional methods can be added as per requirements
}
