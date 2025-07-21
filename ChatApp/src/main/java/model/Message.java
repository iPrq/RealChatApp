package com.ChatApp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("messages")
public class Message {

    @Id
    private String id;
    private String content;
    private String sender;
    private String timestamp;
    private Integer roomid;

    public Message(String content, String id, String sender, String timestamp, Integer roomid) {
        this.content = content;
        this.id = id;
        this.sender = sender;
        this.timestamp = timestamp;
        this.roomid = roomid;
    }
}
