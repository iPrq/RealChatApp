package com.ChatApp.service;

import com.ChatApp.model.ChatServiceRepository;
import com.ChatApp.model.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class GetMessagesService {

    private final ChatServiceRepository chatServiceRepository;

    public GetMessagesService(ChatServiceRepository chatServiceRepository) {
        this.chatServiceRepository = chatServiceRepository;
    }

    public ResponseEntity<List<Message>> execute() {
        List<Message> messages = chatServiceRepository.findAll();
        return ResponseEntity.ok(messages);
    }
}
