package com.ChatApp;

import com.ChatApp.model.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import com.ChatApp.service.GetMessagesService;
import com.ChatApp.service.HandleMessageService;

import java.util.List;

@Controller
public class AppController {
    private final HandleMessageService handleMessageService;
    private final GetMessagesService getMessagesService;

    public AppController(HandleMessageService handleMessageService, GetMessagesService getMessagesService) {
        this.handleMessageService = handleMessageService;
        this.getMessagesService = getMessagesService;
    }


    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public Message handleMessage(Message message) {
        return handleMessageService.execute(message);
    }

    @GetMapping("/message")
    public ResponseEntity<List<Message>> getMessages() {
        return getMessagesService.execute();
    }
}
