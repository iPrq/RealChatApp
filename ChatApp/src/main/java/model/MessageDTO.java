package com.ChatApp.model;

public class MessageDTO {
    private String sender;
    private String timestamp;

    public MessageDTO(String sender, String timestamp) {
        this.sender = sender;
        this.timestamp = timestamp;
    }
}
