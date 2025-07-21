package com.ChatApp.service;

import com.ChatApp.model.ChatServiceRepository;
import com.ChatApp.model.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class HandleMessageService implements Command<Message, Message> {

    private final ChatServiceRepository chatServiceRepository;

    public HandleMessageService(ChatServiceRepository chatServiceRepository) {
        this.chatServiceRepository = chatServiceRepository;
    }



    @Override
    public Message execute(Message input) {
        chatServiceRepository.save(input);
        return input;
    }
}
